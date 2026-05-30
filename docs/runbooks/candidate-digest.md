# Candidate Digest (Manual Skeleton)

This runbook describes the local/manual candidate digest skeleton for Before You Run v0.2 planning.

## Scope

- This is a local/manual candidate digest skeleton.
- It does not fetch external data.
- It does not publish candidates as cards automatically.

## Safety and review

- Candidates must be reviewed before becoming public cards.
- Signal-only candidates require verification.
- Unsafe operational detail must not be copied into public cards.

## Usage

```bash
npm run digest:build
```

By default, this reads `data/manual-candidates.example.json` and writes `reports/candidate-digest-YYYY-MM-DD.md`.

You can also run directly with custom paths:

```bash
node scripts/build-candidate-digest.mjs data/manual-candidates.example.json reports/candidate-digest-test.md
```
