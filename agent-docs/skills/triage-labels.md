# Triage labels and priority

Use the default Matt Pocock roles. Keep the existing `wontfix` label.

| Role | GitHub label | Meaning |
| --- | --- | --- |
| Needs triage | `needs-triage` | A maintainer must evaluate the issue. |
| Needs information | `needs-info` | More information is needed before work can proceed. |
| Ready for an agent | `ready-for-agent` | Scope and acceptance criteria are clear. Check blockers before starting. |
| Ready for a human | `ready-for-human` | The work requires human implementation. |
| Will not do | `wontfix` | The work will not be pursued. |

## Phase and priority

- `phase:0`: initial renderer validation, before the permanent application architecture.
- `priority:0`: first prove the shared stories can run on the three targets.
- `priority:1`: required validation and the Phase 0 conclusion, after runnable stories exist.

These priorities are work order, not incident severity. Every Phase 0 ticket is required. A lower number comes first among unblocked tickets; dependency links take precedence. Public Web/WASM work comes before Desktop when choosing between otherwise equal tickets.
