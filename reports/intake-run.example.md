# Tripwire Intake Run

Mode: manual-local  
Network access: false  
Input: data/manual-intake.example.json

## Summary

- Items seen: 3
- Candidate-like items: 3
- Rejected items: 0

## Candidate-like items

### Example article about reviewing package install scripts

- Source: Manual example article
- Source kind: article
- Source type: reference
- URL: https://example.com/article
- Confidence: low
- Freshness: new
- Severity hint: medium
- Categories: malicious-packages
- Needs translation: false
- Needs source check: true
- Needs safety rewrite: false

Public-safe summary:
Example public-safe source summary for local intake testing.

Submitter note:
Manual placeholder item for intake format testing.

Quoted excerpt:
Short placeholder excerpt only.

Screenshot reference:
No screenshot reference.

Notes:
Placeholder only. No external fetch was performed.

Label notes:
confidence: Low because this is placeholder/manual example data. | freshness: Marked new for local workflow testing. | severity_hint: Medium as a conservative example.

### Example advisory note about access policy verification

- Source: Manual example advisory
- Source kind: official-advisory
- Source type: primary
- URL: https://example.com/advisory
- Confidence: medium
- Freshness: recent
- Severity hint: high
- Categories: credential-exposure, supply-chain
- Needs translation: false
- Needs source check: false
- Needs safety rewrite: true

Public-safe summary:
Public-safe placeholder summary describing verification-focused advisory content.

Submitter note:
Collected manually from a public advisory page for testing.

Quoted excerpt:
Placeholder excerpt from a public advisory summary.

Screenshot reference:
No screenshot reference.

Notes:
Use for local moderation practice only.

Label notes:
confidence: Medium because this is still placeholder text. | freshness: Recent based on placeholder published date. | severity_hint: High to exercise reviewer triage flow.

### Example social discussion link for review

- Source: Manual example social link
- Source kind: social-link
- Source type: signal
- URL: https://example.com/social
- Confidence: low
- Freshness: new
- Severity hint: watch
- Categories: social-engineering
- Needs translation: true
- Needs source check: true
- Needs safety rewrite: false

Public-safe summary:
Public-safe placeholder summary of a social signal that needs verification.

Submitter note:
Signal-only placeholder, requires source confirmation.

Quoted excerpt:
Short placeholder social note.

Screenshot reference:
screenshots/manual-social-example.png

Notes:
Manual social link example for local workflow checks.

Label notes:
confidence: Low because this is an unverified social signal. | freshness: Marked new to represent same-day collection. | severity_hint: Watch pending moderation review.
