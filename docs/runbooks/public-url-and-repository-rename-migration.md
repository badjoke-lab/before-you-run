# Public URL and repository rename migration note

Status: planning note  
Last updated: 2026-05-30

---

## Purpose

This note records the remaining public URL and repository rename migration plan after PR #51.
It is intentionally public-safe and does not perform any migration work.

---

## Naming boundary

The public product name is **Before You Run**.

**Tripwire** remains only as:

```text
- the previous provisional name
- the current repository identifier
- the existing Cloudflare Pages URL while it is still in use
```

Do not introduce Tripwire as a new public product name in user-facing copy.

---

## Deferred manual migration steps

These steps are intentionally deferred and must be handled manually in a later migration:

```text
- Rename the repository.
- Change the Cloudflare Pages project or public Pages URL.
- Choose and confirm the final public URL.
```

This note does not rename the repository, change Cloudflare Pages settings, or change the public runtime behavior.

---

## Pre-change URL smoke check

Before any public URL or Pages URL change, verify that the current site loads at these paths:

```text
/
/ja/
/cards/
/ja/cards/
```

Record the checked URL, date, and result in the later migration PR or manual migration log.

---

## Sitemap and robots timing

Do not regenerate `sitemap.xml` or `robots.txt` during this planning step.

Regenerate the sitemap and robots files only after the final public URL is chosen and ready to be used as the canonical public URL.
