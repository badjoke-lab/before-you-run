# Before You Run Candidate Digest

Date: 2026-05-28  
Source: data/candidate-review-queue.example.json

## Summary

- Total candidates: 2
- needs-verification: 1
- candidate: 1

## needs-verification

### Example candidate about reviewing package install scripts

- Status: needs-verification
- Source type: reference
- Confidence: low
- Freshness: new
- Severity hint: medium
- Categories: malicious-packages
- URL: https://example.com/source
- Review priority: medium
- Review decision: undecided
- Safe card angle: Check package scripts before install commands.
- Review questions: Is there a stronger primary or reference source?; Can this become a clear what-to-avoid card?; Is the wording free of unsafe operational detail?
- Blocking issues: Example source is placeholder only.
- Review notes: Example only. Replace with reviewed candidates later.

Label notes:
- Confidence: Low because this is placeholder/manual example data.
- Freshness: Marked new for local workflow testing.
- Severity hint: Medium as a conservative example.

Why relevant:
This may become a defensive card because it maps to package-install behavior.

Public-safe summary:
Example public-safe summary for review queue testing.

## candidate

### Check package install scripts before running install commands

- Status: candidate
- Source type: reference
- Confidence: medium
- Freshness: new
- Severity hint: medium
- Categories: malicious-packages
- URL: https://example.com/source
- Review priority: high
- Review decision: draft-card
- Safe card angle: Check package install scripts before running install commands
- Review questions: Is the wording beginner-safe and public-safe?; Are the defensive checks clear and actionable?
- Blocking issues: none
- Review notes: Approved as a draft placeholder for editorial review.

Label notes:
- Confidence: Low because this is placeholder/manual example data.
- Freshness: Marked new for local workflow testing.
- Severity hint: Medium as a conservative example.

Why relevant:
This maps directly to a defensive card about verifying scripts before package installation.

Public-safe summary:
Package install commands can run project-defined scripts, so review them before executing commands from an unfamiliar package or repository.
