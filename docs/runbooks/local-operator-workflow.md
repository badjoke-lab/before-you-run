# Before You Run Local Operator Workflow

## Purpose

This workflow is for real day-to-day manual operation.

It lets an operator collect URLs, social signals, screenshot references, and notes locally without committing raw working data to the public repository.

The tracked `data/*.local.template.json` files are intentionally empty JSON arrays. Add real working data only to ignored `data/*.local.json` files.

## First setup

```bash
npm run operator:setup
```

This creates ignored local working files:

```text
data/manual-intake.local.json
data/social-signals.local.json
data/evidence-notes.local.json
data/signal-verification-queue.local.json
data/publish-review-checklist.local.json
```

## Daily operation

1. Collect a possible risk item manually.
2. Put it into the appropriate local JSON file.
3. Run:

```bash
npm run operator:run
```

4. Review the generated `reports/*.local.md` files.
5. Hold anything that is signal-only, unverified, unclear, private, or unsafe.
6. Only after review, manually create or update a public-safe card in `data/threats.json`.
7. Run:

```bash
npm run check
```

8. Commit only public-safe changes.

## Important boundary

Local files are ignored by git and should not be committed.

Do not commit:

* unverified allegations
* raw social screenshots
* private notes
* personal data
* secrets
* exploit details
* attack instructions
* credential theft methods
* bypass instructions
* weaponized payloads
