# Tripwire Local Data Boundary

## Public repo data

Safe to commit:

- public-safe cards
- source links
- confidence/freshness/severity labels
- defensive summaries
- templates
- example placeholder data
- generated example reports

## Local private operator data

Do not commit by default:

- data/*.local.json
- reports/*.local.md
- raw notes
- raw screenshots
- private review context
- personal data
- secret-like data
- unverified claims
- social-only allegations

## Promotion rule

A local item may move toward public card data only after:

- source check
- credibility check
- duplicate check
- freshness/severity check
- safety rewrite check
- publish review check
- manual human decision

No script should automatically promote local data into `data/threats.json`.
