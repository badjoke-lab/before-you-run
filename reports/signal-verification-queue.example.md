# Before You Run Signal Verification Queue Report

Input: data/signal-verification-queue.example.json  
Network access: false  
Automatic publication: false

## Summary

- Total queue items: 1
- needs-verification: 1

## Platform groups

- x: 1

## Queue status groups

### needs-verification

#### Example verification queue item for package warning

- ID: verify-example-x-package-warning
- Priority: medium
- Platform: x
- Source type: signal
- Source kind: social-link
- Source signal ID: social-signal-example-x-package-warning
- Source evidence ID: evidence-example-screenshot-package-warning
- Review decision: hold
- Suggested action: needs-redaction
- Created at: 2026-05-28
- Last reviewed at: 2026-05-28

Verification needs:
- Needs primary source: true
- Needs reference source: true
- Needs original context: true
- Needs duplicate check: true
- Needs safety rewrite: false
- Needs translation: false
- Needs redaction review: true

Verification state:
- Primary source found: false
- Reference source found: false
- Original context checked: false
- Duplicate checked: false
- Redaction checked: false
- Safe to promote: false
- Do not publish as confirmed: true

Decision reason:
Example signal needs stronger source confirmation before candidate promotion.

Next action:
Find a primary or reliable reference source before moving this item into candidate review.

Public-safe summary:
Placeholder verification queue summary. This item is not confirmed.

