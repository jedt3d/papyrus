import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

test("failed updates keep the draft; corrections succeed; late older results cannot replace newer output", { timeout: 10000 }, async () => {
  const temp = await mkdtemp(join(tmpdir(), "papyrus-reload-"));
  const draft = join(temp, "draft.css");
  const profile = join(temp, "profile.json");
  const builder = join(temp, "builder.mjs");
  await writeFile(profile, JSON.stringify({ target: "web", environment: "test subprocess" }));
  await writeFile(builder, `
    import { readFile, mkdir, writeFile } from 'node:fs/promises';
    const job = process.argv[2];
    const css = await readFile(job + '/source/assets/story.css', 'utf8');
    if (css === 'failed draft') process.exit(1);
    await mkdir(job + '/output');
    await writeFile(job + '/output/index.html', '<body>' + css + '</body>');
  `);
  const output = join(temp, "session");
  const runner = spawn(process.execPath, [new URL("experiment.mjs", import.meta.url).pathname,
    output, "--", process.execPath, builder], { stdio: ["pipe", "pipe", "pipe"] });
  const closed = new Promise(resolve => runner.once("close", resolve));
  let stderr = "";
  runner.stderr.on("data", data => { stderr += data; });
  const lines = createInterface({ input: runner.stdout })[Symbol.asyncIterator]();
  const event = async (status) => {
    for (;;) {
      const next = await lines.next();
      assert.equal(next.done, false, stderr);
      const value = JSON.parse(next.value);
      if (value.status === status) return value;
    }
  };
  const submit = async (css, delayMs = 0) => {
    await writeFile(draft, css);
    runner.stdin.write(JSON.stringify({ draft, story: "card/long-content", profile, delayMs }) + "\n");
    return event("submitted");
  };
  try {
    await submit("first working CSS");
    const first = await event("current");
    await submit("failed draft");
    await event("failed");
    assert.equal(await readFile(draft, "utf8"), "failed draft");
    assert.equal(JSON.parse(await readFile(join(output, "current.json"))).id, first.id);
    assert.match(await readFile(join(output, first.path, "index.html"), "utf8"), /first working CSS/);
    await submit("corrected CSS");
    const corrected = await event("current");
    assert.notEqual(corrected.id, first.id);
    assert.match(await readFile(join(output, corrected.path, "index.html"), "utf8"), /corrected CSS/);
    const old = await submit("older delayed CSS", 500);
    const latest = await submit("newer CSS");
    const current = await event("current");
    assert.equal(current.id, latest.id);
    assert.equal((await event("stale")).id, old.id);
    assert.equal(JSON.parse(await readFile(join(output, "current.json"))).id, latest.id);
    assert.match(await readFile(join(output, old.path, "index.html"), "utf8"), /older delayed CSS/);
    const oldBeforeFailure = await submit("older than failure", 500);
    await submit("failed draft");
    await event("failed");
    assert.equal((await event("stale")).id, oldBeforeFailure.id);
    assert.equal(JSON.parse(await readFile(join(output, "current.json"))).id, latest.id);
  } finally {
    runner.kill();
    await closed;
    await rm(temp, { recursive: true, force: true });
  }
});
