# Tripwire Freshness / Severity Helper Report

Input: data/manual-intake.example.json  
Network access: false

## Summary

- Total items: 3
- High severity hints: 1
- Medium severity hints: 1
- Watch severity hints: 1
- Stale items: 0
- Unknown freshness items: 0

## Items

### Example advisory note about access policy verification

- ID: manual-intake-example-official-advisory-auth-check
- Source type: primary
- Confidence: medium
- Freshness: recent
- Severity hint: high
- URL: https://example.com/advisory
- Categories: credential-exposure, supply-chain
- Caution flags: safety-rewrite-needed

Freshness note:
Recent item. Suitable for review, but confirm if newer sources exist.

Severity note:
High severity hint. Prioritize review, but confirm source quality.

Public-safe summary:
Public-safe placeholder summary describing verification-focused advisory content.

### Example article about reviewing package install scripts

- ID: manual-intake-example-article-package-script
- Source type: reference
- Confidence: low
- Freshness: new
- Severity hint: medium
- URL: https://example.com/article
- Categories: malicious-packages
- Caution flags: source-check-needed

Freshness note:
Fresh item. Review soon while context is current.

Severity note:
Medium severity hint. Review after high-priority items.

Public-safe summary:
Example public-safe source summary for local intake testing.

### Example social discussion link for review

- ID: manual-intake-example-social-link-discussion
- Source type: signal
- Confidence: low
- Freshness: new
- Severity hint: watch
- URL: https://example.com/social
- Categories: social-engineering
- Caution flags: signal-low-confidence, source-check-needed, translation-needed

Freshness note:
Fresh item. Review soon while context is current.

Severity note:
Watch item. Monitor or hold unless source confidence improves.

Public-safe summary:
Public-safe placeholder summary of a social signal that needs verification.

