const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '../../agent-docs/Papyrus.md');
const target = path.resolve(__dirname, '../content/english/pages/proposal-th.md');
const englishSource = path.resolve(__dirname, '../../agent-docs/Papyrus.en.md');
const englishTarget = path.resolve(__dirname, '../content/english/pages/proposal.md');

function proposalPage(body, language = 'th') {
  const english = language === 'en';
  const readable = body.replace(/^\*\*(\d+\. .+)\*\*$/gm, '## $1');
  return `---
title: "${english ? 'Papyrus project proposal' : 'ข้อเสนอโครงการ Papyrus'}"
description: "${english ? 'The project proposal in Plain English: purpose, scope, architecture, and development priorities.' : 'ข้อเสนอต้นฉบับภาษาไทย: เป้าหมาย ขอบเขต สถาปัตยกรรม และลำดับการพัฒนา'}"
status: "${english ? 'Original proposal — see the diary for current progress' : 'ข้อเสนอต้นฉบับ — ดูความคืบหน้าปัจจุบันใน diary'}"
content_language: "${language}"
url: "${english ? '/proposal/' : '/proposal/th/'}"
proposal_languages:
  - label: "English"
    lang: "en"
    url: "proposal/"
  - label: "ไทย"
    lang: "th"
    url: "proposal/th/"
draft: false
---

> ${english ? 'Plain English translation of the original proposal dated 11 October 2026. This describes the intended product, not a list of completed features. See the [Roadmap](/papyrus/roadmap/) and [Developer diary](/papyrus/diary/) for current progress.' : 'เอกสารข้อเสนอโครงการต้นฉบับ ณ วันที่ 11 ตุลาคม 2026 ความสามารถที่กล่าวถึงยังเป็นแผนงาน โปรดดู [Roadmap](/papyrus/roadmap/) และ [Developer diary](/papyrus/diary/) สำหรับสถานะการพัฒนาปัจจุบัน'}

${readable}`;
}

function syncProposal(from = source, to = target, language = 'th') {
  const page = proposalPage(fs.readFileSync(from, 'utf8'), language);
  if (fs.existsSync(to) && fs.readFileSync(to, 'utf8') === page) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, page, 'utf8');
  return true;
}

if (require.main === module) {
  syncProposal();
  syncProposal(englishSource, englishTarget, 'en');
  if (process.argv.includes('--watch')) {
    fs.watch(path.dirname(source), (_, filename) => {
      if (!filename || [path.basename(source), path.basename(englishSource)].includes(filename.toString())) {
        try {
          syncProposal();
          syncProposal(englishSource, englishTarget, 'en');
        }
        catch (error) { console.error(`Proposal sync failed; retaining last page: ${error.message}`); }
      }
    });
  }
}

module.exports = { proposalPage, syncProposal };
