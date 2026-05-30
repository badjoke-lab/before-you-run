# Pre-migration smoke check

This runbook records the checks to complete before any Pages project or public URL migration for Before You Run.

## Naming boundary

- Public product name: Before You Run
- Previous provisional name: Tripwire
- Current repository identifier: badjoke-lab/before-you-run
- Current public Pages URL: https://tripwire-3gk.pages.dev/

Do not treat the current Pages URL as the final public brand.

## Before changing URLs

Complete these checks on the currently deployed site:

- `/` loads and shows Before You Run in the title, header, hero, and footer.
- `/ja/` loads and shows Before You Run in the title, header, hero, and footer.
- `/cards/` loads from the current Pages URL.
- `/ja/cards/` loads from the current Pages URL.
- Navigation between English and Japanese pages works.
- The card list appears on the root pages.
- No obvious layout break appears on mobile width.

## Migration order

1. Confirm the final public URL.
2. Confirm whether the Pages project rename or a new Pages project is safer.
3. Keep the old Pages URL reachable where possible.
4. Update canonical references only after the final public URL is selected.
5. Regenerate sitemap and robots after the final URL decision.
6. Run the smoke check again after deployment.

## Do not bundle with URL migration

Do not combine URL migration with:

- card data changes
- script changes
- package script changes
- dependency changes
- layout redesign
- new feature work

Keep the migration reversible and easy to review.

## Required checks

Run these before merging any migration PR:

```bash
npm run check
node --check app.js
```
