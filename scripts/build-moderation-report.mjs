import fs from "node:fs";

const inputPath = process.argv[2] ?? "data/manual-intake.example.json";
const outputPath = process.argv[3] ?? "reports/candidate-moderation.example.md";

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

const ACTION_PRIORITY = [
  "reject-or-hold",
  "needs-source-check",
  "needs-safety-rewrite",
  "needs-translation",
  "ready-for-review",
  "manual-review"
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
}

function getSuggestedAction(item) {
  const flags = {
    rejectOrHold:
      (item.source_type === "signal" && item.confidence === "low") ||
      (item.needs_source_check === true && item.source_type === "signal"),
    needsSourceCheck: item.needs_source_check === true,
    needsSafetyRewrite: item.needs_safety_rewrite === true,
    needsTranslation: item.needs_translation === true,
    readyForReview:
      (item.source_type === "primary" || item.source_type === "reference") &&
      item.needs_source_check !== true &&
      item.needs_safety_rewrite !== true &&
      (item.confidence === "medium" || item.confidence === "high")
  };

  if (flags.rejectOrHold) return "reject-or-hold";
  if (flags.needsSourceCheck) return "needs-source-check";
  if (flags.needsSafetyRewrite) return "needs-safety-rewrite";
  if (flags.needsTranslation) return "needs-translation";
  if (flags.readyForReview) return "ready-for-review";
  return "manual-review";
}

function getReason(action) {
  switch (action) {
    case "reject-or-hold":
      return "Low-confidence signal or source-check needed before use.";
    case "needs-source-check":
      return "Source verification is required before review can continue.";
    case "needs-safety-rewrite":
      return "Safety rewrite is required before public-facing use.";
    case "needs-translation":
      return "Translation is needed before full moderation review.";
    case "ready-for-review":
      return "Item is suitable for standard moderation review.";
    default:
      return "Item requires manual moderation triage.";
  }
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of intake items");
}

const byAction = new Map();
const bySourceType = new Map();
for (const action of ACTION_PRIORITY) {
  byAction.set(action, []);
}

items.forEach((item, index) => {
  validateItem(item, index);
  const action = getSuggestedAction(item);
  byAction.get(action).push(item);

  if (!bySourceType.has(item.source_type)) {
    bySourceType.set(item.source_type, []);
  }
  bySourceType.get(item.source_type).push(item);
});

const presentActions = ACTION_PRIORITY.filter((action) => byAction.get(action).length > 0);

const lines = [
  "# Tripwire Candidate Moderation Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false",
  "",
  "## Summary",
  "",
  `- Total items: ${items.length}`,
  ...presentActions.map((action) => `- ${action}: ${byAction.get(action).length}`),
  "",
  "## Source type groups",
  ""
];

for (const [sourceType, groupItems] of bySourceType.entries()) {
  lines.push(`- ${sourceType}: ${groupItems.length}`);
}

lines.push("", "## Action buckets", "");

for (const action of presentActions) {
  lines.push(`### ${action}`, "");

  for (const item of byAction.get(action)) {
    lines.push(
      `#### ${item.title}`,
      "",
      `- ID: ${item.id}`,
      `- Source kind: ${item.source_kind}`,
      `- Source type: ${item.source_type}`,
      `- Confidence: ${item.confidence}`,
      `- Freshness: ${item.freshness}`,
      `- Severity hint: ${item.severity_hint}`,
      `- URL: ${item.url}`,
      `- Categories: ${item.candidate_categories.join(", ")}`,
      `- Needs translation: ${item.needs_translation === true}`,
      `- Needs source check: ${item.needs_source_check === true}`,
      `- Needs safety rewrite: ${item.needs_safety_rewrite === true}`,
      "",
      "Reason:",
      `${getReason(action)}`,
      "",
      "Public-safe summary:",
      `${item.raw_summary}`,
      ""
    );
  }
}

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote moderation report to ${outputPath}`);
