# Downloadable AI rules runbook

Status: local example workflow  
Last updated: 2026-05-28

---

## Purpose

Downloadable AI rules provide a local Markdown export format for reviewed Before You Run category safety packs. The files are meant to help AI assistants keep guidance defensive, beginner-safe, and aligned with reviewed safety boundaries.

Generated rules are public-safe examples and are not a replacement for human review.

---

## Source of truth

Rules are generated locally from reviewed category safety packs in `data/category-safety-packs.example.json`.

Draft, needs-review, and archived packs must not be exported. A pack is exportable only when:

```text
- pack_status is reviewed
- all review_requirements values are false
- allowed guidance, disallowed guidance, and safe response rules are non-empty
```

---

## Local export command

```bash
npm run rules:build
```

Equivalent direct command:

```bash
node scripts/build-downloadable-ai-rules.mjs data/category-safety-packs.example.json downloads/ai-rules reports/downloadable-ai-rules.example.md
```

The export writes:

```text
downloads/ai-rules/*.md
downloads/ai-rules/manifest.example.json
reports/downloadable-ai-rules.example.md
```

---

## Safety boundary

The workflow does not use:

```text
- AI generation
- network access
- scraping
- automatic publication
- automatic edits to data/threats.json
```

Exported rules must remain defensive and beginner-safe. Disallowed sections may name unsafe content only to prohibit it; allowed guidance, safe response rules, and AI prompt snippets must avoid unsafe operational detail.

---

## Review expectations

Before adding or updating a reviewed pack, confirm that the pack:

```text
- avoids real unverified allegations
- avoids operational harmful instructions
- focuses on review, isolation, safer alternatives, and uncertainty labels
- uses beginner-safe language
- has completed source, safety, translation, and AI output review where applicable
```

Generated rules are review artifacts, not final policy. Human reviewers should inspect both the source pack and generated Markdown before any downstream reuse.

---

## Future bundle guidance

Future AGENTS.md and Cursor bundles should be built from reviewed exported rules only. Bundle generation is out of scope for this workflow and should remain separate from local Markdown rule export.
