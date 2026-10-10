import { createHash, randomUUID } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync, openSync, closeSync } from "node:fs";
import { resolve, join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";

const [destination, separator, ...command] = process.argv.slice(2);
if (!destination || separator !== "--" || !command.length) {
  throw new Error("Usage: node experiment.mjs NEW_SESSION_DIR -- BUILD_COMMAND [ARGS]; submit JSON lines on stdin");
}
const root = resolve(destination);
const source = resolve(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(root);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const runnerHash = hash(readFileSync(fileURLToPath(import.meta.url)));
const emit = (status, value) => {
  const { sourceFiles, environment, buildCommand, ...summary } = value;
  process.stdout.write(JSON.stringify({ status, ...summary }) + "\n");
};
const reloadScript = `<script>setInterval(async()=>{try{const c=await(await fetch('/current.json',{cache:'no-store'})).json();const p='/'+c.path+'/';if(location.pathname!==p)location.replace(p)}catch{}},500)</script>`;
writeFileSync(join(root, "index.html"), "<body>Waiting for a working preview." + reloadScript + "</body>");
let newest = 0;
let builds = Promise.resolve();
let activations = Promise.resolve();
let native;
process.on("SIGTERM", () => { native?.kill(); process.exit(); });
process.on("SIGINT", () => { native?.kill(); process.exit(); });

function snapshot(request, sequence) {
  if (!/^(button\/(primary|disabled|long-content)|card\/(default|long-content)|text-input\/(default|disabled|long-content))$/.test(request.story)) {
    throw new Error("Choose one of the eight shared story IDs");
  }
  if (request.delayMs !== undefined && (!Number.isInteger(request.delayMs) || request.delayMs < 0 || request.delayMs > 60000)) {
    throw new Error("delayMs must be an integer from 0 to 60000 (late-result experiment only)");
  }
  const css = readFileSync(request.draft);
  const profileBytes = readFileSync(request.profile);
  const profile = JSON.parse(profileBytes);
  if (!["web", "wasm", "desktop"].includes(profile.target) || !profile.environment) {
    throw new Error("Profile must identify target (web/wasm/desktop) and environment");
  }
  const id = randomUUID();
  const job = join(root, "jobs", id);
  const copy = join(job, "source");
  mkdirSync(copy, { recursive: true });
  for (const entry of ["src", "assets", "public", "Cargo.toml", "Cargo.lock", "Dioxus.toml", "rust-toolchain.toml"]) {
    cpSync(join(source, entry), join(copy, entry), { recursive: true });
  }
  for (const target of ["blitz-wasm", "blitz-desktop"]) {
    mkdirSync(join(copy, target));
    for (const entry of readdirSync(join(source, target))) {
      if (entry === "src" || entry === "index.html" || entry.startsWith("Cargo.")) {
        cpSync(join(source, target, entry), join(copy, target, entry), { recursive: true });
      }
    }
  }
  const files = {};
  function record(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) record(path);
      else if (relative(copy, path) !== "assets/story.css") files[relative(copy, path)] = hash(readFileSync(path));
    }
  }
  record(copy);
  writeFileSync(join(copy, "assets/story.css"), css);
  writeFileSync(join(job, "draft.css"), css);
  writeFileSync(join(job, "profile.json"), profileBytes);
  const revision = {
    id, sequence, story: request.story, target: profile.target, environment: profile.environment,
    gitRevision: execFileSync("git", ["rev-parse", "HEAD"], { cwd: source, encoding: "utf8" }).trim(),
    sourceHash: hash(JSON.stringify(files)), sourceFiles: files,
    styleHash: hash(css), profileHash: hash(profileBytes),
    runnerHash, buildCommand: command,
    submittedAt: new Date().toISOString(), path: `jobs/${id}/output`,
  };
  writeFileSync(join(job, "revision.json"), JSON.stringify(revision, null, 2));
  return { job, revision, delayMs: request.delayMs ?? 0 };
}

async function build({ job, revision }) {
  const log = openSync(join(job, "build.log"), "w");
  try {
    const child = spawn(command[0], [...command.slice(1), job], {
      env: { ...process.env, PAPYRUS_RELOAD_SOURCE: source }, stdio: ["ignore", log, log],
    });
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", code => code === 0 ? resolve() : reject(new Error(`Build exited ${code}`)));
    });
    const output = join(job, "output");
    if (revision.target !== "desktop") {
      const html = join(output, "index.html");
      writeFileSync(html, readFileSync(html, "utf8").replace("</body>", reloadScript + "</body>"));
    }
    writeFileSync(join(output, "revision.json"), JSON.stringify(revision, null, 2));
  } finally { closeSync(log); }
}

async function complete(item) {
  await delay(item.delayMs);
  const activation = activations.then(() => activate(item));
  activations = activation.catch(() => {});
  await activation;
}

async function activate(item) {
  if (item.revision.sequence !== newest) return emit("stale", item.revision);
  let candidate;
  try {
    if (item.revision.target === "desktop") {
      const logPath = join(item.job, "runtime.log");
      const log = openSync(logPath, "w");
      candidate = spawn(join(item.job, "output/Papyrus.app/Contents/MacOS/papyrus-blitz-desktop"), [], {
        env: process.env, stdio: ["ignore", log, log],
      });
      closeSync(log);
      let startError;
      candidate.once("error", error => { startError = error; });
      let started = false;
      for (let attempt = 0; attempt < 40; attempt++) {
        await delay(250);
        if (startError || candidate.exitCode !== null || candidate.signalCode !== null) throw startError ?? new Error("Native candidate exited before activation");
        if (readFileSync(logPath, "utf8").includes("Papyrus desktop:")) { started = true; break; }
      }
      if (!started) throw new Error("Native candidate did not report a window within 10 seconds");
      // shortcut: window startup + grace is a smoke check, add a paint acknowledgement in the permanent runner.
      await delay(1000);
      if (candidate.exitCode !== null || candidate.signalCode !== null) throw new Error("Native candidate exited during startup grace");
    }
    if (item.revision.sequence !== newest) { candidate?.kill(); return emit("stale", item.revision); }
    // Only this atomic pointer changes; every published output retains its own assets.
    writeFileSync(join(root, "current.tmp"), JSON.stringify(item.revision, null, 2));
    renameSync(join(root, "current.tmp"), join(root, "current.json"));
    if (candidate) { native?.kill(); native = candidate; }
    emit("current", item.revision);
  } catch (error) { candidate?.kill(); throw error; }
}

for await (const line of createInterface({ input: process.stdin })) {
  const sequence = ++newest;
  try {
    const item = snapshot(JSON.parse(line), sequence);
    emit("submitted", item.revision);
    const built = builds.then(() => build(item));
    builds = built.catch(() => {});
    built.then(() => complete(item)).catch(error => emit("failed", { sequence, id: item.revision.id, error: error.message }));
  } catch (error) { emit("failed", { sequence, error: error.message }); }
}
await builds;
