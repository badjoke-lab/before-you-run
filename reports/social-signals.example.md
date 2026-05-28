# Tripwire Manual Social Signal Report

Input: data/social-signals.example.json  
Network access: false  
Automatic publication: false

## Summary

- Total social signals: 2
- needs-verification: 2

## Platform groups

- bluesky: 1
- x: 1

## Signal status groups

### needs-verification

#### Example social signal about package install script review

- ID: social-signal-example-x-package-warning
- Platform: x
- Source kind: social-link
- Source type: signal
- Signal status: needs-verification
- Suggested action: hold-for-confirmation
- Confidence: low
- Freshness: new
- Severity hint: watch
- URL: https://example.com/social-post
- Categories: malicious-packages

Review needs:
- Needs source check: true
- Needs confirmation source: true
- Needs safety rewrite: false
- Needs translation: false
- Needs duplicate check: true

Verification:
- Primary source found: false
- Reference source found: false
- Do not publish as confirmed: true
- Notes: Example only. Social signals must be verified before publication.

Helper notes:
- Signal risk note: This is a signal-only item. Do not treat it as confirmed without stronger sources.
- Verification helper: No stronger source recorded yet. Hold for confirmation.

Public-safe summary:
Placeholder social signal summary. This is not treated as confirmed information.

Why relevant:
This may point to a risky developer action, but it requires confirmation from stronger sources.

#### Example Bluesky signal about dependency review

- ID: social-signal-example-bluesky-dependency-warning
- Platform: bluesky
- Source kind: social-link
- Source type: signal
- Signal status: needs-verification
- Suggested action: hold-for-confirmation
- Confidence: low
- Freshness: new
- Severity hint: watch
- URL: https://example.com/bluesky-post
- Categories: supply-chain

Review needs:
- Needs source check: true
- Needs confirmation source: true
- Needs safety rewrite: false
- Needs translation: false
- Needs duplicate check: true

Verification:
- Primary source found: false
- Reference source found: false
- Do not publish as confirmed: true
- Notes: Example only. Bluesky signals must be verified before publication.

Helper notes:
- Signal risk note: This is a signal-only item. Do not treat it as confirmed without stronger sources.
- Verification helper: No stronger source recorded yet. Hold for confirmation.

Public-safe summary:
Placeholder Bluesky signal summary. This is not treated as confirmed information.

Why relevant:
This may point to a developer dependency risk, but it requires confirmation from stronger sources.

