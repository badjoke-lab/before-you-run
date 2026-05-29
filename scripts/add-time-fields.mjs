import { readFileSync, writeFileSync } from "node:fs";

const defaultPaths = ["data/threats.json", "data/threats-approved.json"];
const paths = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultPaths;

function isDateOnly(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isUtcDateTime(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value);
}

function sourcePrecision(value) {
  if (isUtcDateTime(value)) return "datetime";
  if (isDateOnly(value)) return "date";
  return "unknown";
}

function normalizeSource(source) {
  const published = source.published_at || source.source_published_original || null;
  const precision = sourcePrecision(published);

  source.source_published_original = source.source_published_original || published || null;
  source.source_time_precision = source.source_time_precision || precision;
  source.source_published_at = source.source_published_at || (precision === "datetime" ? published : null);
  source.source_published_date = source.source_published_date || (precision === "date" ? published : null);
  source.source_timezone = source.source_timezone ?? null;
  source.source_timezone_confidence = source.source_timezone_confidence || (precision === "datetime" ? "explicit" : "unknown");

  return source;
}

for (const path of paths) {
  const cards = JSON.parse(readFileSync(path, "utf8"));

  for (const card of cards) {
    const fallbackDate = card.updated_at || card.sources?.[0]?.checked_at || "2026-05-28";
    card.first_seen_at = card.first_seen_at || fallbackDate;
    card.checked_at = card.checked_at || card.sources?.[0]?.checked_at || fallbackDate;
    card.status = card.status || "active";
    card.freshness_label = card.freshness_label || "recent";

    if (Array.isArray(card.sources)) {
      card.sources = card.sources.map(normalizeSource);
    }
  }

  writeFileSync(path, `${JSON.stringify(cards, null, 2)}\n`);
  console.log(`Added time fields to ${path}`);
}
