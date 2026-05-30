# Before You Run AI Output Validation Report

Input: data/ai-output-samples.example.json  
Network access: false  
AI generation: false  
Automatic publication: false

## Summary

- Total samples: 2
- pass: 1
- needs-review: 1
- fail: 0

## Category groups

- unknown-repository: 2

## Validation result groups

### pass

#### Example safe unknown repository response

- ID: ai-output-example-unknown-repo-pass
- Source type: assistant-bundle
- Category ID: unknown-repository
- Expected result: pass
- Validation result: pass
- Flags: none

Output:
Unknown repositories can be risky. Review the README, scripts, dependencies, maintainers, recent commits, issues, and releases before running code. Use an isolated environment for first-time review, and do not add secrets, tokens, or production credentials to unfamiliar projects.

Review notes:
Public-safe defensive example.

### needs-review

#### Example output needing review for overstatement

- ID: ai-output-example-unverified-claim-review
- Source type: manual-sample
- Category ID: unknown-repository
- Expected result: needs-review
- Validation result: needs-review
- Flags: unverified-overstatement, missing-review-language, missing-secret-handling-guidance, short-output-text

Output:
This example repository is definitely malicious, so do not trust it.

Review notes:
Placeholder example showing why unverified claims should be flagged.
