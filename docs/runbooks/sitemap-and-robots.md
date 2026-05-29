# Sitemap and robots runbook

Status: active foundation  
Last updated: 2026-05-29

---

## Purpose

Tripwire publishes a static `sitemap.xml` and `robots.txt` to make public pages easier for search and discovery tools to find.

The sitemap lists the public static pages that are intended for discovery. The robots file allows crawling and points crawlers to the sitemap URL.

---

## Current base URL

The current default base URL is the temporary Cloudflare Pages URL:

```text
https://tripwire-3gk.pages.dev
```

When Tripwire adds a custom domain, set `SITE_URL` while rebuilding the files.

```bash
SITE_URL="https://example.com" npm run sitemap:build
```

---

## Included content

Only public static pages are included in the sitemap.

The sitemap does not include these internal or generated areas yet:

```text
- docs/
- reports/
- data/
- scripts/
- downloads/
```

Downloadable AI rule Markdown files are also not included in the sitemap yet.

---

## Regeneration steps

Run the sitemap builder after adding or removing public pages.

```bash
npm run sitemap:build
```

The builder writes:

```text
sitemap.xml
robots.txt
reports/sitemap.example.md
```

The builder uses local files only. It does not fetch network data, call AI, publish changes, or modify `data/threats.json`.

---

## Search Console

Submit the sitemap URL in Search Console later if needed:

```text
https://tripwire-3gk.pages.dev/sitemap.xml
```

If a custom domain is added, submit the custom-domain sitemap URL after regenerating with `SITE_URL`.
