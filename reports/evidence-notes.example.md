# Before You Run Screenshot / Manual Evidence Report

Input: data/evidence-notes.example.json  
Network access: false  
Image processing: false  
OCR: false  
Automatic publication: false

## Summary

- Total evidence notes: 1
- needs-review: 1

## Evidence type groups

- screenshot-reference: 1

## Evidence status groups

### needs-review

#### Example screenshot reference for package warning

- ID: evidence-example-screenshot-package-warning
- Evidence type: screenshot-reference
- Evidence status: needs-review
- Source context: manual-social-signal
- Related signal ID: social-signal-example-x-package-warning
- Platform: x
- Suggested action: needs-redaction
- Source URL: https://example.com/social-post
- Screenshot reference: local-placeholder/path-or-note.png

Redaction:
- Needs redaction: true
- Possible personal data: true
- Possible secret data: false
- Notes: Check whether usernames, profile images, or unrelated people should be removed before any public use.

Context review:
- Needs original source check: true
- Needs date check: true
- Needs thread context: true
- Needs translation: false
- Notes: A screenshot alone is not enough for publication.

Verification:
- Primary source found: false
- Reference source found: false
- Do not publish as confirmed: true
- Notes: Evidence note must be verified against stronger sources before publication.

Public-safe summary:
Placeholder screenshot evidence note. This does not confirm the claim by itself.

