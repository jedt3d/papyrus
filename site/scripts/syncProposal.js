const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '../../agent-docs/Papyrus.md');
const target = path.resolve(__dirname, '../content/english/pages/proposal.md');

function proposalPage(body) {
  const readable = body.replace(/^\*\*(\d+\. .+)\*\*$/gm, '## $1');
  return `---
title: "Papyrus project proposal"
description: "The original Thai proposal: intended scope, architecture, and development priorities."
status: "Proposal — implementation pending"
content_language: "th"
draft: false
---

> เอกสารข้อเสนอโครงการต้นฉบับ ณ วันที่ 11 ตุลาคม 2026 ความสามารถที่กล่าวถึงยังเป็นแผนงาน โปรดดู Roadmap และ Developer diary สำหรับสถานะการพัฒนาปัจจุบัน

${readable}`;
}

function syncProposal(from = source, to = target) {
  const page = proposalPage(fs.readFileSync(from, 'utf8'));
  if (fs.existsSync(to) && fs.readFileSync(to, 'utf8') === page) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, page, 'utf8');
  return true;
}

if (require.main === module) {
  syncProposal();
  if (process.argv.includes('--watch')) {
    fs.watch(path.dirname(source), (_, filename) => {
      if (!filename || filename.toString() === path.basename(source)) {
        try { syncProposal(); }
        catch (error) { console.error(`Proposal sync failed; retaining last page: ${error.message}`); }
      }
    });
  }
}

module.exports = { proposalPage, syncProposal };
