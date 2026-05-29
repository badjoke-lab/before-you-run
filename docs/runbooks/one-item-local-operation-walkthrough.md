# Tripwire One-item Local Operation Walkthrough

## Purpose

This walkthrough shows how one manually collected risk item moves through the local operator workflow.

It uses tracked placeholder example data only.

It does not use real claims, real social posts, real screenshots, network access, AI generation, scraping, OCR, or automatic publication.

## Run the walkthrough

```bash
npm run operator:walkthrough
```

## What it demonstrates

1. A manually collected risk item is recorded.
2. Related social signal is treated as low-tier signal only.
3. Evidence note is treated as context, not confirmation.
4. Verification queue holds the item until stronger source checks are done.
5. Publish review blocks publication with `hold-for-stronger-source`.
6. Public card data is not modified.

## Real operation

For real operation, use:

```bash
npm run operator:setup
npm run operator:run
```

Real working files should go into ignored `data/*.local.json` files.

Do not commit raw local data.

## Promotion rule

Do not manually copy a local item into public card data unless:

- source check is acceptable
- credibility check is acceptable
- duplicate check is acceptable
- freshness/severity check is acceptable
- safety rewrite check is acceptable
- publish review decision allows manual publication
