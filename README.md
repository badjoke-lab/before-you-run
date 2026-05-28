# Tripwire

Tripwire is a provisional developer-safety information project for beginner and indie developers.

The project focuses on public-safe risky-action cards: what to avoid, what to check first, safer alternatives, source links, and AI/agent safety prompts for development workflows.

## Current status

Current phase: v0.1 MVP release preparation.

The repository currently includes the v0.1 static site foundation, data-driven risky-action cards, search/filter/detail behavior, AI/agent copy actions, utility pages, license files, and JSON validation.

The public MVP specification is available at:

```text
docs/specs/tripwire-mvp-spec-v0.1.md
```

## v0.1 scope

The v0.1 MVP provides:

```text
- English root page
- Japanese /ja/ page
- Risky-action card list
- Card detail view
- Search and filters
- Source URL display
- Source type display
- AI / Agent Safety copy actions
- Checklists
- Command safety reference
- After-incident guide
- Sources page
- Mobile-readable layout
- JSON data validation
```

## Public content boundary

Tripwire is defensive and educational. Public content should focus on:

```text
- Risk categories
- Beginner-safe explanations
- What to avoid
- Safer alternatives
- Source links
- Confidence / freshness / severity labels
- Public-safe summaries
```

Tripwire should not publish offensive operational detail, unverified claims as facts, or private planning notes.

## Technical direction

The initial implementation is a static site using HTML, CSS, JavaScript, and JSON data files. Candidate collection and advisory-source integrations are planned for later versions.

## Candidate source metadata

Tripwire includes public-safe source metadata for future candidate collection. Automated collection is not active in v0.1.


## Candidate digest skeleton

A local manual candidate digest builder is available for future v0.2 workflows.

```bash
npm run digest:build
```

This uses example candidate data and does not fetch external sources.

## Candidate review queue

A local review queue example is available for future v0.2 workflows.

```bash
npm run queue:digest
```

This generates a review digest from local example data only.


## Card draft pipeline

A local candidate-to-card draft builder is available for future v0.2 workflows.

```bash
npm run drafts:build
```

This creates draft card JSON and a Markdown report from local review queue example data. Drafts are not published automatically.




## Intake runner skeleton

A local no-network intake runner skeleton is available for future Phase 2 workflows.

```bash
npm run intake:run
```

This processes local example intake data only. It does not fetch RSS feeds or call external APIs.

## Manual intake format

Tripwire includes a local manual intake format for URLs, article notes, social links, screenshot references, and manual notes.

```bash
npm run intake:run
```

Manual intake data is local example data only and does not publish candidates or cards automatically.

## Candidate moderation report

A local candidate moderation report builder is available for Phase 2 review workflows.

```bash
npm run moderation:report
```

This reads local manual intake example data and writes a Markdown moderation report. It does not publish candidates or cards.


## Freshness / severity helper

A local freshness and severity helper report is available for Phase 2 review workflows.

```bash
npm run freshness:report
```

This reads local manual intake example data and writes a Markdown helper report. It does not verify truth, fetch sources, or publish candidates/cards.


## Duplicate detection

A local duplicate detection report is available for manual intake review.

```bash
npm run duplicates:report
```

This checks local manual intake data only and does not fetch external sources.


## Source credibility helper

A local source credibility helper report is available for Phase 2 review workflows.

```bash
npm run credibility:report
```

This reads local manual intake example data and writes a Markdown helper report. It does not verify truth, fetch sources, or publish candidates/cards.


## Card update history

A local card update history report is available for Phase 2 editorial workflows.

```bash
npm run history:report
```

This reads local example update history data and writes a Markdown report. It does not modify published cards automatically.

## Signal labels

Tripwire includes confidence, freshness, and severity-hint label definitions for candidate review workflows. These labels are editorial aids and do not automatically publish or confirm candidate items.

## License

```text
Code: MIT License
Editorial content, threat cards, translations, checklists, incident guides, and AI safety rules: CC BY-NC 4.0
```

## Validation

Run:

```bash
npm run check
node --check app.js
```
