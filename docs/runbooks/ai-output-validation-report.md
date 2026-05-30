# AI-output validation report runbook

## Purpose

The AI-output validation report provides a local review gate for example assistant outputs before they are reused in Before You Run docs, downloadable bundles, or public guidance.

Use it to check whether example AI-facing text stays inside Before You Run's defensive, public-safe content boundary.

## What the report does

The report builder is local and deterministic:

- It reads local sample data from `data/ai-output-samples.example.json` by default.
- It writes a Markdown report to `reports/ai-output-validation.example.md` by default.
- It validates required sample fields, allowed values, and non-empty output text.
- It flags unsafe operational terms when they are not clearly framed as prohibitions.
- It flags overconfident or unverified claims.
- It flags missing review, check, verify, or confirm language.
- It flags missing safe-handling guidance for secrets, tokens, or credentials when reviewing unknown repositories.
- It flags very short outputs that may lack enough context for safe public reuse.

## What the report does not do

The report is not an AI system and is not a truth engine:

- It does not call AI.
- It does not generate new AI text.
- It does not fetch sources or external data.
- It does not scrape websites.
- It does not publish cards or bundles automatically.
- It does not edit `data/threats.json`.
- It does not prove that an output is correct, complete, or safe for publication.

Passing validation only means the sample did not trigger the current deterministic checks. Passing validation is not a replacement for human review.

## Run the report

```bash
npm run ai-output:validate
```

The script can also be run directly with explicit paths:

```bash
node scripts/build-ai-output-validation-report.mjs data/ai-output-samples.example.json reports/ai-output-validation.example.md
```

## Review workflow

1. Add or update local example samples only.
2. Run the validation report.
3. Review every `needs-review` and `fail` result.
4. Edit unsafe or overconfident output before any public reuse.
5. Re-run the report after edits.
6. Keep human review as the final publication gate.

## Handling flagged outputs

Failing or needs-review outputs must not be copied into public cards, docs, rules, or assistant bundles without editing.

Unsafe operational detail must not be preserved in public output. Replace it with defensive wording, safe alternatives, review steps, and clear boundaries.

When an output makes an unverified claim about a real repository, package, person, maintainer, or organization, rewrite it as uncertainty-aware guidance and require source review before public reuse.
