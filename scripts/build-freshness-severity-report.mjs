import fs from "node:fs";

const inputPath = process.argv[2] ?? "data/manual-intake.example.json";
const outputPath = process.argv[3] ?? "reports/freshness-severity.example.md";

const REQUIRED_FIELDS = [
  "id",
  "source_kind",
  "source_type",
  "title",
  "url",
  "language",
  "collected_at",
  "raw_summary",
  "candidate_categories",
  "confidence",
  "freshness",
  "severity_hint"
];

const ALLOWED = {
  source_kind: new Set(["article", "official-advisory", "blog", "social-link", "screenshot-note", "manual-note", "other"]),
  source_type: new Set(["primary", "reference", "signal"]),
  confidence: new Set(["low", "medium", "high"]),
  freshness: new Set(["new", "recent", "stale", "unknown"]),
  severity_hint: new Set(["high", "medium", "watch", "unknown"])
};

const FRESHNESS_NOTES = {
  new: "Fresh item. Review soon while context is current.",
  recent: "Recent item. Suitable for review, but confirm if newer sources exist.",
  stale: "Stale item. Re-check source before using.",
  unknown: "Freshness unknown. Confirm source date before review."
};

const SEVERITY_NOTES = {
  high: "High severity hint. Prioritize review, but confirm source quality.",
  medium: "Medium severity hint. Review after high-priority items.",
  watch: "Watch item. Monitor or hold unless source confidence improves.",
  unknown: "Severity unknown. Assign only after source review."
};

const SEVERITY_PRIORITY = new Map([
  ["high", 0],
  ["medium", 1],
  ["watch", 2],
  ["unknown", 3]
]);

function validateItem(item, index) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in item)) {
      throw new Error(`Item ${index} is missing required field: ${field}`);
    }
  }

  for (const [field, allowedSet] of Object.entries(ALLOWED)) {
    if (!allowedSet.has(item[field])) {
      throw new Error(`Item ${index} has invalid ${field}: ${item[field]}`);
    }
  }

  if (!Array.isArray(item.candidate_categories)) {
    throw new Error(`Item ${index} has invalid candidate_categories; expected array`);
  }
}

function getCautionFlags(item) {
  const flags = [];

  if (item.source_type === "signal" && item.confidence === "low") flags.push("signal-low-confidence");
  if (item.freshness === "stale" && item.severity_hint === "high") flags.push("stale-high-severity");
  if (item.freshness === "unknown") flags.push("unknown-freshness");
  if (item.needs_source_check === true) flags.push("source-check-needed");
  if (item.needs_safety_rewrite === true) flags.push("safety-rewrite-needed");
  if (item.needs_translation === true) flags.push("translation-needed");

  return flags;
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of intake items");
}

items.forEach(validateItem);

const sortedItems = items
  .map((item, index) => ({ item, index }))
  .sort((a, b) => {
    const bySeverity = SEVERITY_PRIORITY.get(a.item.severity_hint) - SEVERITY_PRIORITY.get(b.item.severity_hint);
    if (bySeverity !== 0) return bySeverity;
    return a.index - b.index;
  })
  .map(({ item }) => item);

const summary = {
  total: items.length,
  high: items.filter((item) => item.severity_hint === "high").length,
  medium: items.filter((item) => item.severity_hint === "medium").length,
  watch: items.filter((item) => item.severity_hint === "watch").length,
  stale: items.filter((item) => item.freshness === "stale").length,
  unknownFreshness: items.filter((item) => item.freshness === "unknown").length
};

const lines = [
  "# Tripwire Freshness / Severity Helper Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false",
  "",
  "## Summary",
  "",
  `- Total items: ${summary.total}`,
  `- High severity hints: ${summary.high}`,
  `- Medium severity hints: ${summary.medium}`,
  `- Watch severity hints: ${summary.watch}`,
  `- Stale items: ${summary.stale}`,
  `- Unknown freshness items: ${summary.unknownFreshness}`,
  "",
  "## Items",
  ""
];

for (const item of sortedItems) {
  const cautionFlags = getCautionFlags(item);
  lines.push(
    `### ${item.title}`,
    "",
    `- ID: ${item.id}`,
    `- Source type: ${item.source_type}`,
    `- Confidence: ${item.confidence}`,
    `- Freshness: ${item.freshness}`,
    `- Severity hint: ${item.severity_hint}`,
    `- URL: ${item.url}`,
    `- Categories: ${item.candidate_categories.join(", ")}`,
    `- Caution flags: ${cautionFlags.length > 0 ? cautionFlags.join(", ") : "none"}`,
    "",
    "Freshness note:",
    FRESHNESS_NOTES[item.freshness],
    "",
    "Severity note:",
    SEVERITY_NOTES[item.severity_hint],
    "",
    "Public-safe summary:",
    item.raw_summary,
    ""
  );
}

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote freshness/severity helper report to ${outputPath}`);
