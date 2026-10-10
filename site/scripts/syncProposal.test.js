const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { proposalPage, syncProposal } = require('./syncProposal');

test('publishes English at the default proposal URL and Thai at its own URL', () => {
  const english = proposalPage('**1. Purpose**\n\nEnglish proposal.\n', 'en');
  const thai = proposalPage('**1. ขอบเขต**\n\nต้นฉบับไทย\n', 'th');
  assert.match(english, /content_language: "en"/);
  assert.match(english, /url: "\/proposal\/"/);
  assert.ok(english.endsWith('## 1. Purpose\n\nEnglish proposal.\n'));
  assert.match(thai, /url: "\/proposal\/th\/"/);
  for (const page of [english, thai]) {
    assert.match(page, /label: "English"/);
    assert.match(page, /label: "ไทย"/);
  }
});

test('preserves Thai, code fences and links while adding section navigation', () => {
  const body = '**1. ขอบเขต**\n\n[Blitz](https://blitz.is)\n\n```mermaid\nflowchart TD\n A --> B\n```\n';
  const result = proposalPage(body);
  assert.ok(result.endsWith(body.replace('**1. ขอบเขต**', '## 1. ขอบเขต')));
  assert.match(result, /content_language: "th"/);
});

test('refreshes output without changing the source and retains the last page on missing input', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'papyrus-proposal-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'source.md');
  const target = path.join(dir, 'content', 'proposal.md');
  fs.writeFileSync(source, 'ต้นฉบับ\n');
  assert.equal(syncProposal(source, target), true);
  assert.equal(fs.readFileSync(source, 'utf8'), 'ต้นฉบับ\n');
  assert.equal(syncProposal(source, target), false);
  fs.writeFileSync(source, 'ฉบับแก้ไข\n');
  syncProposal(source, target);
  const lastPage = fs.readFileSync(target, 'utf8');
  assert.ok(lastPage.endsWith('ฉบับแก้ไข\n'));
  fs.unlinkSync(source);
  assert.throws(() => syncProposal(source, target));
  assert.equal(fs.readFileSync(target, 'utf8'), lastPage);
});
