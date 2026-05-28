# Signal Labels Runbook

Status: public runbook  
Last updated: 2026-05-28

---

## Purpose

Tripwire uses three optional signal labels in candidate workflows:

- **confidence**
- **freshness**
- **severity_hint**

These labels help editors describe uncertainty and recency during review.

---

## Editorial intent

Signal labels are **editorial aids**, not automatic truth claims.

- They support triage and review prioritization.
- They do not automatically confirm candidate accuracy.
- They do not automatically publish any card.

Signal-only items require additional verification before publication.

---

## Confidence guidance

- **low**: early/weak signal; needs stronger confirmation.
- **medium**: relevant signal with some support; still needs review.
- **high**: strongly supported by reliable references.

Low-confidence items should **not** be published as confirmed cards.

---

## Freshness guidance

- **new**: newly observed or collected.
- **recent**: still relevant for current awareness.
- **stale**: older item; re-check before use.
- **unknown**: freshness not clear yet.

Stale items should be re-checked before use in publication drafts.

---

## Severity-hint guidance

- **high**, **medium**, **watch**, **unknown** are provisional hints.
- Severity hint is **not** final card severity.
- Final severity is set through editorial review and publication rules.

---

## Publication boundary

Published cards must remain defensive and public-safe.

- Do not include offensive or harmful operational detail.
- Do not present unverified allegations as facts.
- Keep language beginner-safe and reviewable.
