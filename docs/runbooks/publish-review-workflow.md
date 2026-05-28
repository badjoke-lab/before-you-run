# Publish/review workflow

Status: Phase 2 editorial runbook  
Last updated: 2026-05-28

---

## Purpose

The publish/review workflow is the final local editorial gate before a draft or candidate is manually promoted into published Tripwire card data.

This workflow helps reviewers confirm that candidate material is sourced, public-safe, non-duplicative, fresh enough to be useful, severity-checked, credible, translation-reviewed when needed, and free of unchecked AI output before any manual publication step.

---

## Publication boundary

This is a local editorial gate only.

The publish/review report:

```text
- does not publish cards automatically
- does not edit data/threats.json
- does not fetch external data
- does not scrape websites
- does not call AI systems
- does not change runtime UI
```

`data/threats.json` must only be changed manually after final review. A reviewer should copy only approved, public-safe, source-supported content into published card data.

---

## Required review gates

Before any manual publication decision, reviewers must check every gate in the publish/review checklist:

```text
- source checked
- source URL present
- duplicate checked
- freshness checked
- severity checked
- credibility checked
- safety rewrite checked
- translation checked
- AI output checked
- unsafe detail removed
```

All source, duplicate, freshness, severity, credibility, safety, translation, and AI-output gates must be checked before a card is treated as ready for manual publication.

---

## Source expectations

Stronger sources are required before making confident claims.

Use the source summary to distinguish between:

```text
- primary sources
- reference sources
- signal sources
```

Signal-only items should not be published as confirmed facts. If a candidate is based only on weak, indirect, or unconfirmed signals, hold it until stronger support is available.

---

## Safety expectations

Public cards must stay beginner-safe and defensive.

Do not copy unsafe operational detail into public cards, including detailed harmful instructions, bypass instructions, weaponized payloads, or other material that would make abuse easier.

If a useful defensive idea depends on unsafe detail, rewrite it into a high-level, public-safe warning before publication. If it cannot be rewritten safely, hold or reject it.

---

## Translation and AI-output review

Translation review is required when a draft or candidate depends on translated source material or translated card copy.

AI-output review is required whenever AI-assisted text, summaries, labels, or drafts are present. The reviewer must confirm that the final copy is accurate, public-safe, and supported by sources. AI output must not be treated as a source.

---

## Running the local report

Generate the example publish/review report with:

```bash
npm run publish:report
```

Or run the script directly with explicit paths:

```bash
node scripts/build-publish-review-report.mjs data/publish-review-checklist.example.json reports/publish-review.example.md
```

The report groups checklist entries by stored decision and adds a deterministic helper note. The helper note is an editorial aid only; it does not override the stored decision.

---

## Decision guidance

Use conservative decisions:

```text
- approve-for-manual-publish: all gates are checked and the item is public-safe, supported, and copyedited
- hold-for-stronger-source: source support is weak or needs confirmation
- needs-safety-rewrite: public copy may contain unsafe or overly operational detail
- needs-translation-review: translated material still needs human review
- needs-duplicate-review: overlap with existing cards is unresolved
- needs-severity-review: severity framing needs manual review
- reject: the item is unsuitable for publication
```

If in doubt, hold instead of publishing.
