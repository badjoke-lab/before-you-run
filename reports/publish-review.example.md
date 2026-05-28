# Tripwire Publish Review Report

Input: data/publish-review-checklist.example.json  
Network access: false  
Automatic publication: false

## Summary

- Total review items: 1
- hold-for-stronger-source: 1

## Decision groups

### hold-for-stronger-source

#### Check package install scripts before running install commands

- Target card ID: check-package-install-scripts-before-install
- Draft ID: draft-check-package-install-scripts
- Source candidate ID: queue-example-package-script-draft
- Review status: ready-for-final-review
- Reviewed at: 2026-05-28
- Helper note: blocked-source

Gate status:
- Source checked: true
- Source URL present: true
- Duplicate checked: true
- Freshness checked: true
- Severity checked: true
- Credibility checked: true
- Safety rewrite checked: true
- Translation checked: true
- AI output checked: true
- Unsafe detail removed: true

Source summary:
- Source count: 1
- Primary sources: 0
- Reference sources: 1
- Signal sources: 0
- Needs stronger source: true
- Notes: Example source review note. Replace with real review notes before publication.

Editorial summary:
- Public safe: true
- Beginner safe: true
- Contains unverified claims: false
- Contains operational detail: false
- Needs manual copyedit: true
- Notes: Example only. Final text must be manually reviewed before publication.

Decision reason:
Example item has a defensive angle but needs stronger source support before publication.

Next action:
Find or confirm a stronger source before copying into data/threats.json.
