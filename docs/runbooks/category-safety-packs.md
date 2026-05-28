# Category safety packs runbook

Status: local example workflow  
Last updated: 2026-05-28

---

## Purpose

Category safety packs are local, AI-facing defensive guidance bundles for Tripwire category workflows. They describe how an AI assistant should discuss a risk category in beginner-safe, public-safe language.

The packs are intended to support future reviewed AI rule exports. They are not final downloadable bundles in this PR.

---

## Safety boundary

Category safety packs must stay defensive, educational, and beginner-safe.

They must not include:

```text
- exploit steps
- attack instructions
- credential theft methods
- bypass instructions
- weaponized payloads
- malware payloads
- real unverified allegations
```

Disallowed guidance may name unsafe content only to prohibit it. Allowed guidance, safe response rules, and AI prompt snippets should focus on safer checks, defensive review, uncertainty labels, and non-operational alternatives.

---

## What safety packs are

Safety packs are:

```text
- AI-facing defensive guidance bundles
- category-based editorial aids
- local example data until reviewed
- inputs for future reviewed downloadable AI rules
```

Safety packs are not:

```text
- automatic policy engines
- automatic publication tools
- card publishing workflows
- evidence verification systems
- downloadable rules in this PR
```

---

## Publication and card safety

Category safety packs do not publish cards, modify cards, or modify `data/threats.json` automatically.

Every pack needs source review and safety review before being exported. Packs that may affect AI output also need AI output review before they are used outside the local example workflow.

Future downloadable bundles should be generated from reviewed packs only.

---

## Local report generation

Run the local report builder:

```bash
npm run packs:report
```

The report builder reads local example data and writes a Markdown report. It does not fetch sources, call AI systems, scrape websites, publish cards, or generate downloadable bundles.
