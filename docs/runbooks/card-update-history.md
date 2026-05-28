# Card update history runbook

Status: local editorial workflow foundation  
Last updated: 2026-05-28

---

## Purpose

Card update history records local editorial metadata for published safety cards. It gives reviewers a consistent place to track source re-checks, editorial changes, review decisions, and follow-up notes for Phase 2 operations.

Update history is not a publication pipeline. It does not publish cards, modify cards automatically, fetch sources, scrape websites, or edit `data/threats.json`.

---

## What to record

Each update history entry should identify the card, the review dates, the change type, the reason for the change, source review details, editorial review details, the review decision, and the next review date.

Use source re-check dates to prevent stale cards. If a source has not been reviewed recently, mark the card clearly for follow-up instead of assuming the earlier evidence is still current.

Change reasons should stay public-safe. They should explain the defensive editorial reason for a change without copying unsafe operational detail into the history entry or public card copy.

---

## Source review guidance

Track whether sources are primary, reference, or signal sources.

Signal-only source notes should not be treated as confirmation. If a card depends only on signals or indirect references, mark `needs_stronger_source` clearly and avoid overstating confidence.

When a card needs stronger sources, mark that state directly in the update history and route it for review. Do not turn weak evidence into stronger public claims.

---

## Editorial safety guidance

Reviewers should keep update history focused on defensive, beginner-safe editorial context.

Do not copy unsafe operational detail into public cards, reports, or history notes. This includes exploit steps, attack instructions, credential theft methods, bypass instructions, or weaponized payloads.

If a card needs a safety rewrite, translation review, severity review, or source check, record that need explicitly and keep the published card unchanged until the normal review workflow approves a safe update.

---

## Local report generation

Generate the example card update history report with:

```bash
npm run history:report
```

The report reads `data/card-update-history.example.json` and writes `reports/card-update-history.example.md` by default. The script is local-only and has no network access.
