# Intake Runner (Phase 2 Skeleton)

## Purpose

This intake runner is a local, no-network skeleton for Before You Run Phase 2 preparation.

It reads local manual intake example items and produces local example run outputs only.

## Current boundaries in this PR

- Local/no-network execution only.
- No RSS fetching in this PR.
- No API calls or network requests.
- No web scraping.
- No scheduled workflow execution.
- No runtime UI changes.
- No automatic candidate publication.
- No automatic card publication.

## What this skeleton does

- Reads local intake items from `data/manual-intake.example.json` (or a provided input path).
- Validates required intake fields and allowed label values.
- Produces a local intake run JSON output.
- Produces a local Markdown report with candidate-like items.

## Editorial and safety guidance

- This skeleton only prepares the shape for future RSS/manual intake workflows.
- Real source items must be reviewed before entering a candidate review queue.
- Signal-only items require verification before editorial use.
- Unsafe operational detail must not be copied into candidates or cards.
