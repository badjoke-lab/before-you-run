# Public URL migration note

Status: active migration note  
Last updated: 2026-05-30

---

## Purpose

This note records the public URL migration after the repository rename to `badjoke-lab/before-you-run` and the creation of the new Cloudflare Pages URL.
It is intentionally public-safe and does not change hosting settings by itself.

---

## Naming boundary

The public product name is **Before You Run**.

**Tripwire** remains only as:

```text
- the previous provisional name
- the previous Cloudflare Pages URL while it is still reachable
```

Do not introduce Tripwire as a new public product name in user-facing copy.

---

## Completed manual migration steps

The repository has been renamed to:

```text
badjoke-lab/before-you-run
```

The canonical public Pages URL is now:

```text
https://before-you-run.pages.dev/
```

The previous Pages URL was:

```text
https://tripwire-3gk.pages.dev/
```

---

## Remaining manual migration steps

These steps are intentionally deferred and must be handled separately:

```text
- Decide whether the previous Pages URL should remain available or redirect elsewhere.
- If a custom domain is added later, update canonical references after it is confirmed.
```

This note does not change Cloudflare Pages settings or the public runtime behavior.

---

## Post-change URL smoke check

After any public URL or Pages URL change, verify that the current site loads at these paths:

```text
/
/ja/
/cards/
/ja/cards/
```

Record the checked URL, date, and result in the later migration PR or manual migration log.

---

## Sitemap and robots timing

Use `https://before-you-run.pages.dev/` for `sitemap.xml`, `robots.txt`, and generated sitemap reports until a custom domain is confirmed.
