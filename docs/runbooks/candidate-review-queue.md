# Candidate Review Queue Runbook

## Purpose

The candidate review queue is a local, public-safe staging format for manually collected candidate items in Tripwire v0.2 planning.

It helps reviewers evaluate whether a candidate can become a defensive card draft without exposing unsafe detail.

## Scope and publication boundary

- The queue is a review aid only.
- Queue entries do **not** publish cards automatically.
- Queue entries do **not** trigger runtime site changes.
- Queue entries should remain public-safe and placeholder-based unless fully verified from appropriate sources.

## Queue schema

Example file:

```text
data/candidate-review-queue.example.json
```

Required fields per item:

- id
- status
- review_priority
- title
- source_url
- source_type
- language
- collected_at
- candidate_categories
- confidence
- freshness
- severity_hint
- summary
- why_relevant
- review_questions
- safe_card_angle
- review_decision

Allowed values:

- `status`: `candidate`, `high-priority-candidate`, `maybe-relevant`, `needs-verification`, `rejected`, `published`, `updated`
- `review_priority`: `low`, `medium`, `high`
- `source_type`: `primary`, `reference`, `signal`
- `confidence`: `low`, `medium`, `high`
- `freshness`: `new`, `recent`, `stale`, `unknown`
- `severity_hint`: `high`, `medium`, `watch`, `unknown`
- `review_decision`: `undecided`, `needs-more-sources`, `draft-card`, `reject`, `publish`

## Review decisions

Use `review_decision` to track progression:

- `undecided`: candidate needs initial review.
- `needs-more-sources`: more verification is required.
- `draft-card`: candidate is sufficiently scoped for a defensive draft.
- `reject`: candidate should not proceed.
- `publish`: candidate was transformed into a vetted publishable card item through normal editorial flow.

## What makes a candidate publishable

A candidate is publishable only after:

- source quality is verified (especially for signal-only inputs),
- wording is defensive and beginner-safe,
- summary avoids unsafe operational detail,
- relevance maps clearly to a Tripwire what-to-avoid card,
- confidence/freshness/severity labels are coherent.

## What blocks publication

Typical blocking issues include:

- signal-only claim without stronger primary/reference confirmation,
- unclear relevance to a concrete defensive card angle,
- unresolved ambiguity or contradictory reporting,
- wording that includes unsafe operational detail.

## Safety guidance

- Signal-only items require verification before draft or publication steps.
- Do not copy unsafe operational detail into cards.
- Keep queue and digest outputs public-safe and non-operational.
