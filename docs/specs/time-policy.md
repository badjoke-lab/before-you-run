# Tripwire Time Policy

Status: Draft
Document type: MVP specification addendum
Applies to: Tripwire v0.1 and later
Last updated: 2026-05-29

## Core policy

Tripwire stores internal timestamps in UTC ISO 8601 format.

Default display timezone is UTC.

Users may choose a display timezone from the UI.

Source times preserve their original precision. Missing source times remain missing.

## Internal fields

- first_seen_at
- checked_at
- updated_at

## Source precision values

- datetime
- date
- month
- unknown

## Source timezone confidence values

- explicit
- inferred
- unknown

## Initial display modes

- UTC
- Local time
- Asia/Tokyo
- America/New_York
- America/Los_Angeles
- Europe/London
- Europe/Berlin
- Custom IANA timezone

## Preference storage

Timezone preference is stored in localStorage.

The timezone setting does not require login, GPS, IP location, or server-side user profile storage.

## Conversion rules

Tripwire-generated timestamps may be converted to the selected display timezone.

Source timestamps may be converted only when the original timezone is known.

Date-only source values remain date-only.

## Display rules

List cards show Updated and Status.

Detail pages show Source published, First seen, Last checked, Last updated, and Status.

Time-sensitive detail pages may show both selected display timezone and UTC.

## Date range rules

Past 24h means an absolute duration from the current UTC timestamp.

Today, Yesterday, and This week use the selected display timezone.
