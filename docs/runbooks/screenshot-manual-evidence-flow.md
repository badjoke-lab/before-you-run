# Screenshot / Manual Evidence Flow

Status: local review workflow  
Last updated: 2026-05-28

---

## Purpose

The screenshot/manual evidence flow gives Tripwire reviewers a public-safe way to record references to screenshots and manually observed evidence notes during Phase 3 review.

This workflow is for local review notes only. Screenshot references and manual notes can help reviewers remember what was observed, but they are not confirmation of a claim by themselves.

---

## Safety boundary

This workflow does not:

```text
- process images
- run OCR
- parse screenshots
- fetch external sources
- scrape websites
- call social APIs
- publish candidates automatically
- publish cards automatically
- modify data/threats.json
```

Do not copy unsafe operational detail into public cards. Evidence notes must avoid exploit steps, attack instructions, credential theft methods, bypass instructions, weaponized payloads, actual secrets, actual personal data, and real unverified allegations.

---

## Recording evidence notes

Use `data/evidence-notes.example.json` as documentation-by-example for the shape of local evidence notes.

Record `screenshot_reference` as a local note, local path, or review reference only. Do not commit sensitive screenshots by default. The screenshot itself should not be processed, parsed, or committed unless a separate review determines that it is safe and necessary.

Each evidence note should include:

```text
- evidence type and status
- source context
- platform and language
- collection and observation dates when available
- public-safe summary
- screenshot reference or manual note reference
- source URL if available
- capture notes
- redaction review fields
- context review fields
- verification fields
```

---

## Redaction review

Before any public use, check whether the reference or note may expose:

```text
- usernames or profile images
- unrelated people
- private messages
- actual personal data
- actual secrets
- credentials, tokens, or private URLs
- unrelated sensitive context
```

If redaction may be needed, keep the evidence status cautious and do not publish the material as confirmed.

---

## Context review

Screenshots are references, not confirmation. Before using an evidence note for candidate or card review, check:

```text
- the original source
- the observation date and source date
- surrounding thread or page context
- whether translation is needed
- whether the note could be a repost, parody, outdated claim, or missing key context
```

A screenshot alone is not enough for publication as a confirmed claim.

---

## Verification review

Evidence notes must not be published as confirmed claims without stronger verification. Prefer primary sources where possible, and use reference sources only with clear scope and date checks.

If neither a primary source nor a reference source has been found, the evidence should remain held for verification. Do not promote it automatically to a candidate or public card.

---

## Build the local report

Generate the local Markdown report with:

```bash
npm run evidence:report
```

The report builder reads local evidence note data, validates required fields and allowed values, groups notes by status and type, and writes `reports/evidence-notes.example.md`.

The report builder does not read image files, run OCR, fetch URLs, scrape websites, publish candidates or cards, or modify `data/threats.json`.
