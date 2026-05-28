# Freshness / Severity Helper

## Purpose

This helper creates a local Markdown report from manual intake items and suggests deterministic freshness/severity review hints for Phase 2 editorial triage.

## What the helper does

- Runs locally with no network access.
- Reads manual intake JSON data.
- Generates freshness notes and severity notes per item.
- Adds caution flags for review risk conditions.
- Produces a public-safe Markdown report for human reviewers.

## What the helper does not do

- It does not publish candidates.
- It does not publish threat cards.
- It does not assign final severity.
- It does not verify truth.
- It does not fetch external sources.

Freshness and severity fields in this report are editorial hints only.

## Usage

```bash
npm run freshness:report
```

Direct script invocation:

```bash
node scripts/build-freshness-severity-report.mjs
node scripts/build-freshness-severity-report.mjs data/manual-intake.example.json reports/freshness-severity.example.md
```

## Review guidance

- Signal + low confidence items should be held or verified before promotion.
- Stale + high severity items require source re-check before use.
- Items flagged for source checks should remain in verification workflow.
- Items flagged for safety rewrites should be rewritten before public card drafting.
- Unsafe source content must not be copied into public-facing cards.
