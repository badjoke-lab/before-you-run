# Public URL migration note

Status: planning note  
Last updated: 2026-05-30

---

## Purpose

This note records the remaining public URL migration plan after the repository rename to `badjoke-lab/before-you-run`.
It is intentionally public-safe and does not perform any hosting migration work.

---

## Naming boundary

The public product name is **Before You Run**.

**Tripwire** remains only as:

```text
- the previous provisional name
- the existing Cloudflare Pages URL while it is still in use
```

Do not introduce Tripwire as a new public product name in user-facing copy.

---

## Completed manual migration steps

The repository has been renamed to:

```text
badjoke-lab/before-you-run
```

---

## Deferred manual migration steps

These steps are intentionally deferred and must be handled manually in a later migration:

```text
- Change the Cloudflare Pages project or public Pages URL.
- Choose and confirm the final public URL.
```

This note does not change Cloudflare Pages settings or the public runtime behavior.

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
