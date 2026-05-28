# Candidate-to-card draft workflow

## Purpose

Generate local draft threat cards from reviewed queue candidates for editorial review.

## Important boundaries

- Draft generation does not publish cards.
- Drafts must be reviewed before being copied into `data/threats.json`.
- Only queue items with `review_decision` set to `draft-card` are processed.
- Generated text is a starting point, not final editorial content.
- Source URLs must be checked before publication.
- Unsafe detail must not be copied into published cards.

## Inputs and outputs

- Input (default): `data/candidate-review-queue.example.json`
- JSON output (default): `data/card-drafts.example.json`
- Report output (default): `reports/card-drafts.example.md`

## Command

```bash
npm run drafts:build
```

Equivalent direct usage:

```bash
node scripts/build-card-drafts.mjs
node scripts/build-card-drafts.mjs data/candidate-review-queue.example.json data/card-drafts.example.json reports/card-drafts.example.md
```

## Review guidance

1. Confirm every draft card remains public-safe and defensive.
2. Confirm source URLs are valid and editorially acceptable.
3. Replace placeholder Japanese strings and generic guidance where needed.
4. Only after editorial approval, manually copy approved content into `data/threats.json`.
