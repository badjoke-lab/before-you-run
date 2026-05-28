# Source credibility helper runbook

Status: Phase 2 review helper  
Network access: false

---

## Purpose

The source credibility helper gives Tripwire reviewers a local Markdown report for manual intake items before those items move into candidate review.

The helper is an editorial aid. It highlights source type, source kind, confidence, and source-check warnings so reviewers can decide whether an item needs stronger source checking.

---

## What it does

```bash
npm run credibility:report
```

The command reads local manual intake example data and writes a local source credibility report.

By default it reads:

```text
data/manual-intake.example.json
```

By default it writes:

```text
reports/source-credibility.example.md
```

The script is local and no-network. It does not fetch URLs, call RSS feeds, scrape websites, use AI, or query external services.

---

## What it does not do

The helper does not verify truth. It does not prove that a claim is correct, current, complete, or attributable.

It also does not:

```text
- publish candidates
- publish cards
- write to data/threats.json
- change runtime UI
- replace editorial judgment
- turn signal-only items into confirmed items
```

---

## Review guidance

Source credibility should be treated as a review aid, not as an automatic trust score.

Signal-only sources require confirmation before publication. Social links and screenshots are treated as lower-confidence signals unless confirmed by stronger sources.

Primary sources are generally stronger than references or signals, but they still need reviewer checks for:

```text
- scope
- date
- publisher identity
- affected product or ecosystem
- public-safe wording
```

Reference sources can provide useful context, but reviewers should prefer checking them against a primary source before publication.

Manual notes require supporting public sources before publication.

---

## Public safety boundary

Unsafe content must not be copied into public cards. Do not include exploit steps, attack instructions, credential theft methods, bypass instructions, weaponized payloads, or real unverified allegations.

If an intake item contains unsafe or unverified material, summarize only the public-safe risk at a high level and hold the item for source review or rewrite.
