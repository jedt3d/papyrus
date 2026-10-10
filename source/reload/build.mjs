import { readFileSync, cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const [target, job] = process.argv.slice(2);
if (!["web", "wasm", "desktop"].includes(target) || !job) throw new Error("Usage: node build.mjs web|wasm|desktop JOB_DIR");
const revision = JSON.parse(readFileSync(join(job, "revision.json")));
if (revision.target !== target) throw new Error("Build target and profile disagree");
const original = process.env.PAPYRUS_RELOAD_SOURCE;
const source = join(job, "source");
const output = join(job, "output");
const cwd = target === "web" ? source : join(source, target === "wasm" ? "blitz-wasm" : "blitz-desktop");
const cache = target === "web" ? join(original, "target") : join(original, `blitz-${target}`, "target");
const env = {
  ...process.env, CARGO_TARGET_DIR: cache, PAPYRUS_STORY_ID: revision.story,
  PAPYRUS_PREVIEW_REVISION: `Preview ${revision.id.slice(0,8)} / ${target}; Source ${revision.sourceHash.slice(0,12)}; CSS ${revision.styleHash.slice(0,12)}; Profile ${revision.profileHash.slice(0,12)}`,
};
delete env.NO_COLOR;
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};
if (target === "web") {
  run("dx", ["build", "--web", "--bin", "papyrus-web", "--locked", "--base-path", revision.path]);
  cpSync(join(cache, "dx/papyrus-web/debug/web/public"), output, { recursive: true });
} else if (target === "wasm") {
  run("trunk", ["build", "--color", "never", "--public-url", `/${revision.path}/`, "--frozen"]);
  cpSync(join(cwd, "dist"), output, { recursive: true });
} else {
  run("cargo", ["build", "--locked", "--offline"]);
  const app = join(output, "Papyrus.app/Contents");
  mkdirSync(join(app, "MacOS"), { recursive: true });
  cpSync(join(cache, "debug/papyrus-blitz-desktop"), join(app, "MacOS/papyrus-blitz-desktop"));
  writeFileSync(join(app, "Info.plist"), `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>CFBundleExecutable</key><string>papyrus-blitz-desktop</string><key>CFBundleIdentifier</key><string>com.papyrus.phase0.desktop</string><key>CFBundleName</key><string>Papyrus Desktop</string><key>CFBundlePackageType</key><string>APPL</string><key>NSHighResolutionCapable</key><true/></dict></plist>`);
}
console.log("Built immutable output", resolve(output));
