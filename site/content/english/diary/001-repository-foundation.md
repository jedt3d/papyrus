---
title: "Three spaces, one project"
description: "Separate the software, public diary, and agent documents so each can grow without confusing plans with working features."
date: 2026-10-11T00:00:00+07:00
status: "Foundation"
tags: ["repository", "publishing"]
draft: false
---

## Decision

Papyrus begins with three independent areas: `source/` for software, `site/` for public publishing, and `agent-docs/` for AI agent planning. Root `README.md` and `AGENTS.md` explain the boundary and priorities.

The original Thai proposal is preserved in `agent-docs/Papyrus.md`. The Hugo build creates its [public reading page]({{< relref "pages/proposal-th.md" >}}) from that source; it does not publish every agent document.

## Publishing foundation

The diary uses [Hugoplate](https://github.com/zeon-studio/hugoplate), Hugo Extended, and GitHub Pages. Theme source is pinned and its MIT notice retained. Navigation leaves space for software reference and user guides, which are clearly marked as planned.

Editing a diary entry is a Markdown change. Pushing to the main branch runs the publishing workflow. This is a documentation site, not the Papyrus component-preview application.

## Next

Begin the [Phase 0 experiments]({{< relref "pages/roadmap.md" >}}). No renderer compatibility has been established by this repository yet.
