# Signal verification queue runbook

Status: Phase 3 local/manual workflow  
Last updated: 2026-05-28

## Purpose

The signal verification queue combines manually collected social signals and screenshot/manual evidence notes into one local review queue before any item can be considered for candidate review or card drafting.

The queue is for cautious editorial triage only. It helps reviewers track whether a signal still needs source confirmation, original context, duplicate review, redaction review, safety rewriting, or translation before promotion.

## Local/manual boundary

The signal verification queue is local/manual only.

It does not:

- Fetch sources or verify claims automatically.
- Use X, Bluesky, Mastodon, or other social APIs.
- Scrape websites.
- Process screenshots, images, or OCR.
- Publish candidates automatically.
- Publish cards automatically.
- Modify `data/threats.json`.

## Confirmation rules

Social signals and screenshot evidence remain unconfirmed until stronger sources are found. A queue item should stay on hold when any of these checks are incomplete:

- Primary or reliable reference source confirmation.
- Original context review.
- Duplicate review.
- Redaction review.
- Safety rewrite review.
- Translation review when needed.

Signal-only items must not be published as confirmed facts. Treat them as leads that require stronger source context before candidate promotion.

## Promotion rules

Only items with `verification_state.safe_to_promote` set to `true` and stronger source context should move into candidate review.

Before promotion, reviewers should confirm that:

- The item is not marked `do_not_publish_as_confirmed`.
- Required source and context checks are complete.
- Duplicate review is complete.
- Redaction review is complete.
- Any public summary is safe, cautious, and does not overstate certainty.

## Public safety rules

Unsafe operational detail must not be copied into public cards. Do not include exploit steps, attack instructions, credential theft methods, bypass instructions, weaponized payloads, actual sensitive screenshots, personal data, secrets, or unverified allegations.

Keep public notes limited to safe summaries, source-quality status, verification needs, and reviewer next actions.

## Generate the local report

```bash
npm run verify:report
```

This reads `data/signal-verification-queue.example.json` and writes `reports/signal-verification-queue.example.md` by default. It performs local validation and grouping only; it does not fetch, verify, or publish automatically.
