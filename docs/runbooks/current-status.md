# Tripwire Current Status

Status: public project status  
Last updated: 2026-05-28

---

## Project overview

Tripwire is a provisional developer-safety information project for beginner and indie developers.

The v0.1 MVP is designed around public-safe risky-action cards. Each card should explain what to avoid, what to check first, safer alternatives, and source links.

The public MVP specification is available at:

```text
docs/specs/tripwire-mvp-spec-v0.1.md
```

---

## Current phase

```text
Repository foundation / v0.1 planning
```

The project currently has the public MVP specification in place. Runtime implementation has not started yet.

---

## Completed items

```text
- Public repository created
- MVP specification added
- Initial README added
```

---

## Current public content boundary

Tripwire may publish:

```text
- Risk categories
- Beginner-safe explanations
- What to avoid
- Safer alternatives
- Source links
- Confidence / freshness / severity labels
- Public-safe summaries
- Incident first-response guidance
- AI or agent safety prompts for safer development workflows
```

Tripwire should not publish detailed harmful instructions, private planning notes, or unverified claims as facts.

---

## Planned v0.1 capabilities

```text
- English root page
- Japanese /ja/ page
- Risky-action card list
- Card detail view
- Search and filters
- Source URL display
- Source type display
- AI / Agent Safety copy actions
- Checklists page
- Command safety reference
- After-incident guide
- Sources page
- Mobile-readable layout
```

---

## Known limitations

```text
- Runtime implementation has not started yet
- v0.1 will not include full RSS/API candidate collection
- v0.1 will not include advisory database integrations
- v0.1 will not include social platform collection
- v0.1 will not include user accounts or user submissions
- Initial content volume will be limited
```

---

## Technical direction

The v0.1 implementation is planned as a static site.

```text
- HTML / CSS / JavaScript
- JSON data files
- Client-side search and filters
- Static deployment target
- Data validation before release
- Basic JSON data validation is available through npm run check.
```

Candidate collection and external advisory-source integrations are planned for later versions.

---

## Next technical step

```text
PR-01: Static site foundation
```

Expected next work:

```text
- Add initial HTML shell
- Add English root page
- Add Japanese /ja/ shell
- Add basic navigation
- Add initial CSS structure
- Keep the UI simple, readable, and mobile-friendly
```
