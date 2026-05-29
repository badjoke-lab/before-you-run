# Tripwire AI-output workflow index

Tripwire AI-output workflows are local, review-based, and defensive by default.

They do not use AI generation, network requests, scraping, automatic publication, or automatic edits to `data/threats.json`.

## Workflow order

1. Category safety packs
2. Downloadable AI rules
3. Assistant bundles
4. AI-output validation

## 1. Category safety packs

Source data:

- `data/category-safety-packs.example.json`

Report:

- `reports/category-safety-packs.example.md`

Runbook:

- `docs/runbooks/category-safety-packs.md`

Command:

```bash
npm run packs:report
```

Purpose:

Define category-based defensive guidance packs before export.

## 2. Downloadable AI rules

Output:

- `downloads/ai-rules/`

Report:

- `reports/downloadable-ai-rules.example.md`

Runbook:

- `docs/runbooks/downloadable-ai-rules.md`

Command:

```bash
npm run rules:build
```

Purpose:

Export reviewed category safety packs into Markdown AI rule files.

## 3. Assistant bundles

Output:

- `downloads/assistant-bundles/AGENTS.example.md`
- `downloads/assistant-bundles/cursor-rules.example.md`

Report:

- `reports/assistant-bundles.example.md`

Runbook:

- `docs/runbooks/assistant-bundles.md`

Command:

```bash
npm run bundles:build
```

Purpose:

Combine reviewed AI rules into assistant bundle examples.

## 4. AI-output validation

Source data:

- `data/ai-output-samples.example.json`

Report:

- `reports/ai-output-validation.example.md`

Runbook:

- `docs/runbooks/ai-output-validation-report.md`

Command:

```bash
npm run ai-output:validate
```

Purpose:

Validate example AI-facing outputs against public-safe defensive boundaries.

## Safety boundary

Do not include:

- exploit steps
- attack instructions
- credential theft methods
- bypass instructions
- weaponized payloads
- malware payloads
- real unverified allegations

Allowed content:

- defensive guidance
- beginner-safe explanations
- safe alternatives
- review/check/verify language
- secret-handling cautions
- source and confidence caveats

## Local full check

```bash
npm run check
npm run packs:report
npm run rules:build
npm run bundles:build
npm run ai-output:validate
```

## Notes

Passing local validation is not a replacement for human review.

Any output marked `needs-review` or `fail` must be edited before reuse in docs, bundles, cards, or public guidance.
