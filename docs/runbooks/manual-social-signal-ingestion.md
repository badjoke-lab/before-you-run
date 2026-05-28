# Manual Social Signal Ingestion

Status: Phase 3 local workflow foundation  
Last updated: 2026-05-28

---

## Purpose

Manual social signal ingestion gives Tripwire reviewers a public-safe way to record X, Bluesky, Mastodon, and other SNS-derived observations as low-tier signal inputs before any candidate or card review. It is intended for early triage only: a social post, link, screenshot reference, or manual note may suggest that an item deserves review, but it does not confirm that the underlying claim is true.

This workflow supports local editorial organization without adding automated social collection.

---

## Scope

This workflow is manual and local only.

Allowed in this workflow:

```text
- Manually record placeholder or reviewed social signal metadata
- Mark social items as signal-only inputs
- Track review needs and verification state
- Generate a local Markdown report
- Hold low-confidence signals until stronger sources are available
```

Not allowed in this workflow:

```text
- X API access
- Bluesky API access
- Mastodon API access
- Network requests
- Web scraping
- Screenshot/OCR processing
- Automatic candidate publication
- Automatic card publication
- Runtime UI changes
```

---

## Lower-tier handling rules

X, Bluesky, Mastodon, and other SNS items are lower-tier signal inputs. They must not be treated as confirmed facts, even when a post appears credible or widely shared.

Use these rules during review:

```text
- If only a social signal exists, hold instead of publishing.
- Social links require source verification and context review.
- Screenshot references require context and source verification before use.
- Do not copy unsafe operational detail into public cards.
- Do not publish real unverified allegations as facts.
- Prefer primary sources before promotion to candidate review.
- Use reference sources only as support when primary confirmation is unavailable or pending.
```

---


### Bluesky-specific handling

Bluesky observations follow the same manual, lower-tier signal rules as other social sources. Use these Bluesky-specific checks during review:

```text
- Bluesky items are still lower-tier signal inputs unless confirmed elsewhere.
- A Bluesky link alone is not confirmation.
- Manual Bluesky entries should include source URL, short public-safe summary, and verification status.
- Do not rely on reposts or quote-post style context without checking the original source.
- No Bluesky API or automated collection is used in this workflow.
```

### Mastodon-specific handling

Mastodon observations follow the same manual, lower-tier signal rules as other social sources. Use these Mastodon-specific checks during review:

```text
- Mastodon items are still lower-tier signal inputs unless confirmed elsewhere.
- A Mastodon link alone is not confirmation.
- Manual Mastodon entries should include source URL, instance/context if known, short public-safe summary, and verification status.
- Federated reposts/boosts should not be treated as original-source confirmation.
- No Mastodon API or automated collection is used in this workflow.
```

## Manual data file

Example entries live in:

```text
data/social-signals.example.json
```

The example schema documentation lives in:

```text
data/social-signals.schema.example.json
```

Each item records source metadata, candidate categories, low-tier confidence labels, capture context, review needs, and verification status.

---

## Report generation

Generate the local social signal report with:

```bash
npm run social:report
```

The report builder reads local JSON and writes:

```text
reports/social-signals.example.md
```

The report is deterministic, local-only, and does not fetch posts, scrape websites, publish candidates, publish cards, or modify `data/threats.json`.

---

## Publication boundary

Social signals are not publication-ready by themselves. Real publication requires stronger source review and the final publish/review workflow.

Before any public card is created or updated, reviewers must confirm that:

```text
- A stronger primary or reference source has been reviewed
- The claim is not presented as confirmed unless verification supports it
- Unsafe operational detail has been removed
- The public-safe summary is beginner-safe and defensive
- The item has passed the normal candidate and publish review workflow
```
