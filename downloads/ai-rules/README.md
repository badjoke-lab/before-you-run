# Before You Run downloadable AI rules

This directory contains example Markdown AI rule files generated locally from reviewed Before You Run category safety packs.

The generated files are intended to help AI assistants provide defensive, beginner-safe guidance. They are public-safe examples only and are not a replacement for human review.

## Local generation

```bash
npm run rules:build
```

The build reads `data/category-safety-packs.example.json`, exports reviewed packs only, and writes:

- Markdown rule files in this directory
- `manifest.example.json`
- `reports/downloadable-ai-rules.example.md`

The workflow does not use AI generation, network access, scraping, automatic publication, or automatic edits to `data/threats.json`.

## See also

- `docs/runbooks/ai-output-index.md`
- `docs/runbooks/downloadable-ai-rules.md`
