# Duplicate Detection Helper

## Purpose

The duplicate detection helper creates a local Markdown report that flags likely duplicate manual intake items before they move deeper into Tripwire Phase 2 review.

## Boundaries

- Local-only workflow.
- No network access.
- No RSS, API, scraping, or website fetching.
- No AI similarity scoring.
- Does not publish candidates.
- Does not publish threat cards.
- Does not write to `data/threats.json`.
- Does not change the runtime UI.

## Build command

```bash
npm run duplicates:report
```

Equivalent direct command:

```bash
node scripts/build-duplicate-report.mjs
```

Optional paths:

```bash
node scripts/build-duplicate-report.mjs data/manual-intake.example.json reports/duplicates.example.md
```

## Input validation

The helper validates that each manual intake item includes these minimal fields:

```text
id
source_kind
source_type
source_name
url
title
language
collected_at
raw_summary
candidate_categories
confidence
freshness
severity_hint
```

`candidate_categories` must be an array. Other required fields must be non-empty strings.

## Duplicate checks

The report includes three deterministic groups:

- `exact-url-duplicates`
- `normalized-title-duplicates`
- `same-source-title-warnings`

### URL normalization

URL duplicate checks:

- Lowercase the hostname.
- Remove trailing slashes from non-root paths.
- Remove `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content` query parameters.
- Keep the URL path and non-UTM query parameters.

### Title normalization

Title duplicate checks:

- Lowercase text.
- Trim leading and trailing whitespace.
- Collapse repeated whitespace.
- Remove punctuation and symbol characters.

### Same-source title warnings

Same-source title warnings compare pairs from the same `source_name` and flag titles with high token overlap after title normalization. This is only a review warning and is not an automated rejection.

## Review guidance

- Treat exact URL duplicates as the strongest duplicate signal.
- Treat normalized-title duplicates as likely duplicates that still require source review.
- Treat same-source title warnings as manual review prompts.
- Keep duplicate handling in the manual review workflow; do not publish or delete items automatically based on this report.
