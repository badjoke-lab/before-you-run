# Before You Run Specs

This directory contains public-safe MVP specification documents for Before You Run.

## Core documents

- `tripwire-mvp-spec-v0.1.md` — v0.1 MVP specification
- `time-policy.md` — time, freshness, and timezone display policy

## Time policy summary

Before You Run stores internal timestamps in UTC ISO 8601 format, displays UTC by default, and allows users to choose a display timezone. Source times preserve their original precision, and date-only source values remain date-only.
