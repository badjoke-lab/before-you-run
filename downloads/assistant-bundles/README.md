# Tripwire Assistant Bundles

This directory contains local example assistant configuration bundles generated from reviewed Tripwire downloadable AI rules.

Generate the examples with:

```bash
npm run bundles:build
```

The bundle builder does not use AI generation, network access, scraping, or automatic publication. It writes reviewable examples only and does not install real editor configuration such as `AGENTS.md` or `.cursor/rules` files.

Review every generated file before copying any content into a real assistant or editor setup.
