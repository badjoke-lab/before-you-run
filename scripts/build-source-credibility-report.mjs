import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/manual-intake.example.json";
const outputPath = process.argv[3] ?? "reports/source-credibility.example.md";

const REQUIRED_FIELDS = [
  "id",
  "source_kind",
  "source_type",
  "source_name",
  "url",
  "title",
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

const SOURCE_TYPE_NOTES = {
  primary: "Likely strongest source type, but still confirm scope, date, and publisher identity.",
  reference: "Useful context source. Prefer checking against a primary source before publication.",
  signal: "Early or indirect signal. Do not treat as confirmed without stronger verification."
};

const SOURCE_KIND_NOTES = {
  "official-advisory": "Usually suitable for primary verification if URL and publisher are valid.",
  article: "Useful for context. Needs source and date review.",
  blog: "Useful for context. Needs author/publisher review.",
  "social-link": "Signal only unless confirmed elsewhere.",
  "screenshot-note": "Manual evidence reference. Needs source/context verification.",
  "manual-note": "Operator note. Requires supporting source before publication.",
  other: "Needs manual review."
};

const ACTION_PRIORITY = [
  "hold-for-confirmation",
  "needs-source-check",
  "needs-context-review",
  "credible-but-review",
  "ready-for-editorial-review"
];

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

  for (const field of ["id", "source_kind", "source_type", "source_name", "url", "title", "language", "collected_at", "raw_summary", "confidence", "freshness", "severity_hint"]) {
    if (typeof item[field] !== "string" || item[field].trim() === "") {
      throw new Error(`Item ${index} has invalid ${field}; expected non-empty string`);
    }
  }
}

function getCredibilityFlags(item) {
  const flags = [];

  if (item.source_type === "signal") flags.push("signal-needs-confirmation");
  if (item.confidence === "low") flags.push("low-confidence-source");
  if (item.needs_source_check === true) flags.push("source-check-required");
  if (item.source_kind === "social-link") flags.push("social-signal");
  if (item.source_kind === "screenshot-note") flags.push("screenshot-needs-context");
  if (item.source_kind === "manual-note") flags.push("manual-note-needs-source");
  if (item.source_type === "primary" && item.needs_safety_rewrite === true) flags.push("primary-but-rewrite-needed");

  return flags;
}

function getSuggestedAction(item) {
  const actionChecks = {
    "hold-for-confirmation":
      item.source_type === "signal" ||
      item.source_kind === "social-link" ||
      (item.confidence === "low" && item.needs_source_check === true),
    "needs-source-check":
      item.needs_source_check === true ||
      item.source_kind === "manual-note" ||
      item.source_kind === "screenshot-note",
    "needs-context-review":
      item.source_kind === "article" ||
      item.source_kind === "blog" ||
      item.source_type === "reference",
    "credible-but-review":
      item.source_type === "primary" ||
      item.confidence === "medium" ||
      item.confidence === "high",
    "ready-for-editorial-review":
      item.source_type === "primary" &&
      item.confidence === "high" &&
      item.needs_source_check !== true &&
      item.needs_safety_rewrite !== true
  };

  return ACTION_PRIORITY.find((action) => actionChecks[action]) ?? "needs-context-review";
}

function countBy(items, key) {
  const counts = new Map();

  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) ?? 0) + 1);
  }

  return counts;
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of intake items");
}

items.forEach(validateItem);

const reviewedItems = items.map((item, index) => ({
  ...item,
  originalIndex: index,
  credibilityFlags: getCredibilityFlags(item),
  suggestedAction: getSuggestedAction(item)
}));

const sortedItems = [...reviewedItems].sort((first, second) => {
  const actionDifference = ACTION_PRIORITY.indexOf(first.suggestedAction) - ACTION_PRIORITY.indexOf(second.suggestedAction);
  if (actionDifference !== 0) return actionDifference;
  return first.originalIndex - second.originalIndex;
});

const sourceTypeCounts = countBy(reviewedItems, "source_type");
const lines = [
  "# Tripwire Source Credibility Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false",
  "",
  "## Summary",
  "",
  `- Total items: ${reviewedItems.length}`,
  ...ACTION_PRIORITY
    .map((action) => ({ action, count: reviewedItems.filter((item) => item.suggestedAction === action).length }))
    .filter(({ count }) => count > 0)
    .map(({ action, count }) => `- ${action}: ${count}`),
  "",
  "## Source type groups",
  ""
];

for (const sourceType of ["primary", "reference", "signal"]) {
  lines.push(`- ${sourceType}: ${sourceTypeCounts.get(sourceType) ?? 0}`);
}

lines.push("", "## Items", "");

for (const item of sortedItems) {
  lines.push(
    `### ${item.title}`,
    "",
    `- ID: ${item.id}`,
    `- Source kind: ${item.source_kind}`,
    `- Source type: ${item.source_type}`,
    `- Confidence: ${item.confidence}`,
    `- Freshness: ${item.freshness}`,
    `- Severity hint: ${item.severity_hint}`,
    `- Suggested action: ${item.suggestedAction}`,
    `- Credibility flags: ${item.credibilityFlags.length > 0 ? item.credibilityFlags.join(", ") : "none"}`,
    `- URL: ${item.url}`,
    "",
    "Credibility note:",
    SOURCE_TYPE_NOTES[item.source_type],
    "",
    "Source kind note:",
    SOURCE_KIND_NOTES[item.source_kind],
    "",
    "Public-safe summary:",
    item.raw_summary,
    ""
  );
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote source credibility report to ${outputPath}`);
