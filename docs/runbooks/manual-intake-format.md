# Manual Intake File Format

This runbook defines how to prepare local manual intake JSON files for Before You Run Phase 2 workflows.

## Purpose

Manual intake files allow operators to collect and review public-safe source signals locally before moderation. These files support:

- URLs
- Short article notes
- Official advisory references
- Social links
- Screenshot references
- Manual notes

Manual intake is local preparation only. It does not publish candidates or cards automatically.

## Basic workflow

1. Open `data/manual-intake.example.json`.
2. Add an array item per source.
3. Paste only a URL and a short public-safe summary.
4. Add review labels and moderation flags.
5. Run:

```bash
npm run intake:run
```

## Source kind values

Use `source_kind` to describe what kind of source was collected:

- `article`
- `official-advisory`
- `blog`
- `social-link`
- `screenshot-note`
- `manual-note`
- `other`

## Source type values

Use `source_type` for trust and review posture:

- `primary`: Original official source or first-party advisory.
- `reference`: Secondary source used for context.
- `signal`: Early signal that needs stronger verification.

## Required fields

Each intake item requires:

- `id`
- `source_kind`
- `source_type`
- `source_name`
- `url`
- `title`
- `language`
- `collected_at`
- `raw_summary`
- `candidate_categories` (non-empty array)
- `confidence`
- `freshness`
- `severity_hint`

## Optional fields

Optional fields are useful for moderation handoff:

- `source_id`
- `published_at`
- `matched_keywords`
- `submitter_note`
- `quoted_excerpt` (keep short)
- `screenshot_reference`
- `needs_translation`
- `needs_source_check`
- `needs_safety_rewrite`
- `intake_notes`
- `label_notes`

## Screenshot handling

Before You Run does not process screenshots automatically in this workflow. If a screenshot is relevant, store it manually and reference it with `screenshot_reference`.

## Review flags

Use these flags when extra moderation is needed:

- `needs_translation: true` when language support is needed.
- `needs_source_check: true` when source trust or attribution needs verification.
- `needs_safety_rewrite: true` when wording must be rewritten for public-safe publication.

## Safety boundary

Do not paste exploit steps, attack instructions, credential theft methods, bypass instructions, or weaponized payloads.

Do not include unverified allegations as facts.

## Publication behavior

Manual intake files do not trigger automatic candidate publication or card publication.
