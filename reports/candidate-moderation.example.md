# Before You Run Candidate Moderation Report

Input: data/manual-intake.example.json  
Network access: false

## Summary

- Total items: 3
- reject-or-hold: 1
- needs-source-check: 1
- needs-safety-rewrite: 1

## Source type groups

- reference: 1
- primary: 1
- signal: 1

## Action buckets

### reject-or-hold

#### Example social discussion link for review

- ID: manual-intake-example-social-link-discussion
- Source kind: social-link
- Source type: signal
- Confidence: low
- Freshness: new
- Severity hint: watch
- URL: https://example.com/social
- Categories: social-engineering
- Needs translation: true
- Needs source check: true
- Needs safety rewrite: false

Reason:
Low-confidence signal or source-check needed before use.

Public-safe summary:
Public-safe placeholder summary of a social signal that needs verification.

### needs-source-check

#### Example article about reviewing package install scripts

- ID: manual-intake-example-article-package-script
- Source kind: article
- Source type: reference
- Confidence: low
- Freshness: new
- Severity hint: medium
- URL: https://example.com/article
- Categories: malicious-packages
- Needs translation: false
- Needs source check: true
- Needs safety rewrite: false

Reason:
Source verification is required before review can continue.

Public-safe summary:
Example public-safe source summary for local intake testing.

### needs-safety-rewrite

#### Example advisory note about access policy verification

- ID: manual-intake-example-official-advisory-auth-check
- Source kind: official-advisory
- Source type: primary
- Confidence: medium
- Freshness: recent
- Severity hint: high
- URL: https://example.com/advisory
- Categories: credential-exposure, supply-chain
- Needs translation: false
- Needs source check: false
- Needs safety rewrite: true

Reason:
Safety rewrite is required before public-facing use.

Public-safe summary:
Public-safe placeholder summary describing verification-focused advisory content.

