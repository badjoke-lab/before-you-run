# Candidate collection workflow

Status: operator-controlled workflow

## Purpose

This workflow collects public candidate items from configured feed sources and creates review files for ChatGPT/operator review.

It does not publish cards automatically.

## Local run

```bash
npm run candidates:collect:review
```

Primary outputs:

```text
data/candidate-review-queue.generated.json
data/card-drafts.generated.json
reports/candidate-digest-YYYY-MM-DD.md
reports/card-drafts.generated.md
reports/candidate-collection-run-YYYY-MM-DD.md
```

## GitHub Actions run

Open Actions, choose `Collect candidates`, then run it manually.

The workflow uploads an artifact named:

```text
tripwire-candidate-review
```

Download the artifact and pass the generated queue or digest to ChatGPT.

## Operator review loop

1. Run candidate collection.
2. Provide `data/candidate-review-queue.generated.json` or `reports/candidate-digest-YYYY-MM-DD.md` to ChatGPT.
3. Ask for public-safe card drafts and a publish/reject/hold review.
4. Choose which candidate IDs to publish.
5. Apply only the selected reviewed items to `data/threats.json`.
6. Run `npm run check`.
7. Open a PR and merge only after review.

## Boundaries

```text
Network collection: yes
AI generation inside script: no
Automatic publication: no
data/threats.json automatic modification: no
```

Manual social URLs or screenshots remain optional supporting signals. They are not the main intake path.
