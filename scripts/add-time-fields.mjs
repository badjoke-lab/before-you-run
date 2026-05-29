import { readFileSync, writeFileSync } from "node:fs";

const path = "data/threats.json";
const cards = JSON.parse(readFileSync(path, "utf8"));

for (const card of cards) {
  const fallbackDate = card.updated_at || "2026-05-28";
  card.first_seen_at = card.first_seen_at || fallbackDate;
  card.checked_at = card.checked_at || card.sources?.[0]?.checked_at || fallbackDate;
  card.status = card.status || "active";
  card.freshness_label = card.freshness_label || "recent";

  if (Array.isArray(card.sources)) {
    for (const source of card.sources) {
      const published = source.published_at || source.source_published_original || null;
      source.source_published_original = source.source_published_original || published;
      source.source_time_precision = source.source_time_precision || (published ? "date" : "unknown");
      source.source_published_date = source.source_published_date || published;
      source.source_timezone = source.source_timezone ?? null;
      source.source_timezone_confidence = source.source_timezone_confidence || "unknown";
    }
  }
}

writeFileSync(path, `${JSON.stringify(cards, null, 2)}\n`);
console.log(`Added time fields to ${path}`);
