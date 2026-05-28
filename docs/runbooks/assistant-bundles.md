# Assistant bundles runbook

Status: local example workflow  
Last updated: 2026-05-28

---

## Purpose

Tripwire assistant bundles provide reviewable AGENTS.md and Cursor rules examples for defensive AI-assistant configuration. The examples combine reviewed downloadable AI rules into local files that can be inspected before any manual use in a real assistant or editor setup.

---

## Local generation workflow

Run the bundle builder from the repository root:

```bash
npm run bundles:build
```

The default command reads `downloads/ai-rules/manifest.example.json`, loads the reviewed rule files listed in that manifest, and writes:

```text
downloads/assistant-bundles/AGENTS.example.md
downloads/assistant-bundles/cursor-rules.example.md
downloads/assistant-bundles/manifest.example.json
reports/assistant-bundles.example.md
```

The script can also be run with explicit paths:

```bash
node scripts/build-assistant-bundles.mjs downloads/ai-rules/manifest.example.json downloads/assistant-bundles reports/assistant-bundles.example.md
```

---

## Safety boundaries

- Bundles are generated locally from reviewed downloadable AI rules.
- No AI generation, network access, scraping, or automatic publication is used.
- Generated files are examples, not automatically installed editor configuration.
- Users should review generated examples before copying them into any real assistant or editor setup.
- Bundles must stay defensive and beginner-safe.
- Disallowed or prohibition sections may name unsafe content only to prohibit it.
- Future editor-specific bundles should be generated only from reviewed rules.

---

## Validation expectations

The bundle builder validates the source manifest, checks that referenced rule files exist, and fails if generated bundle text includes blocked unsafe instruction terms outside clear prohibition contexts.

The workflow must not modify `data/threats.json`, install real editor configuration, publish cards, fetch live sources, or add runtime UI behavior.
