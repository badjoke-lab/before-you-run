# Tripwire Source Credibility Report

Input: data/manual-intake.example.json  
Network access: false

## Summary

- Total items: 3
- hold-for-confirmation: 2
- credible-but-review: 1

## Source type groups

- primary: 1
- reference: 1
- signal: 1

## Items

### Example article about reviewing package install scripts

- ID: manual-intake-example-article-package-script
- Source kind: article
- Source type: reference
- Confidence: low
- Freshness: new
- Severity hint: medium
- Suggested action: hold-for-confirmation
- Credibility flags: low-confidence-source, source-check-required
- URL: https://example.com/article

Credibility note:
Useful context source. Prefer checking against a primary source before publication.

Source kind note:
Useful for context. Needs source and date review.

Public-safe summary:
Example public-safe source summary for local intake testing.

### Example social discussion link for review

- ID: manual-intake-example-social-link-discussion
- Source kind: social-link
- Source type: signal
- Confidence: low
- Freshness: new
- Severity hint: watch
- Suggested action: hold-for-confirmation
- Credibility flags: signal-needs-confirmation, low-confidence-source, source-check-required, social-signal
- URL: https://example.com/social

Credibility note:
Early or indirect signal. Do not treat as confirmed without stronger verification.

Source kind note:
Signal only unless confirmed elsewhere.

Public-safe summary:
Public-safe placeholder summary of a social signal that needs verification.

### Example advisory note about access policy verification

- ID: manual-intake-example-official-advisory-auth-check
- Source kind: official-advisory
- Source type: primary
- Confidence: medium
- Freshness: recent
- Severity hint: high
- Suggested action: credible-but-review
- Credibility flags: primary-but-rewrite-needed
- URL: https://example.com/advisory

Credibility note:
Likely strongest source type, but still confirm scope, date, and publisher identity.

Source kind note:
Usually suitable for primary verification if URL and publisher are valid.

Public-safe summary:
Public-safe placeholder summary describing verification-focused advisory content.

