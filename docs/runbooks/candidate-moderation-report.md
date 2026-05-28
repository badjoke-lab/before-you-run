# Candidate Moderation Report

## Purpose

The candidate moderation report is a local decision-aid document for Tripwire Phase 2 operations. It helps reviewers triage manual intake items and decide whether each item should be accepted, held, rejected, translated, source-checked, or safety-rewritten.

## Boundaries

- Local-only workflow.
- No network access.
- No RSS, API, scraping, OCR, or screenshot processing.
- Does not publish candidates.
- Does not publish cards.
- Does not write to `data/threats.json`.

## Build command

```bash
npm run moderation:report
```

Equivalent direct command:

```bash
node scripts/build-moderation-report.mjs
```

Optional paths:

```bash
node scripts/build-moderation-report.mjs data/manual-intake.example.json reports/candidate-moderation.example.md
```

## Suggested action logic

Suggested actions are deterministic and resolved with a cautious priority order:

1. `reject-or-hold`
2. `needs-source-check`
3. `needs-safety-rewrite`
4. `needs-translation`
5. `ready-for-review`
6. `manual-review`

Rules:

- `reject-or-hold`
  - `source_type === "signal" && confidence === "low"`
  - `needs_source_check === true && source_type === "signal"`
- `needs-source-check`
  - `needs_source_check === true`
- `needs-safety-rewrite`
  - `needs_safety_rewrite === true`
- `needs-translation`
  - `needs_translation === true`
- `ready-for-review`
  - `source_type` is `primary` or `reference`
  - `needs_source_check` is `false`
  - `needs_safety_rewrite` is `false`
  - `confidence` is `medium` or `high`

## What each action means

- `reject-or-hold`: do not advance yet; hold low-confidence signal-only items and verify before use.
- `needs-source-check`: verify source reliability before moderation progression.
- `needs-safety-rewrite`: rewrite potentially unsafe content before using in public cards.
- `needs-translation`: translate before complete editorial review.
- `ready-for-review`: suitable for standard moderation workflow.
- `manual-review`: fallback bucket when no deterministic action applies.

## Safety notes

- Signal-only low-confidence items should be held.
- Items needing safety rewrite must not be copied into public cards yet.
- This report is a moderation decision aid, not an automatic truth system.
