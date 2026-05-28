import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/card-update-history.example.json";
const outputPath = process.argv[3] ?? "reports/card-update-history.example.md";

const REQUIRED_FIELDS = [
  "id",
  "card_id",
  "card_title",
  "language",
  "history_status",
  "updated_at",
  "reviewed_at",
  "source_rechecked_at",
  "change_type",
  "change_summary",
  "change_reason",
  "source_review",
  "editorial_review",
  "review_decision",
  "next_review_after"
];

const REQUIRED_SOURCE_REVIEW_FIELDS = [
  "source_count",
  "primary_sources",
  "reference_sources",
  "signal_sources",
  "needs_stronger_source",
  "source_notes"
];

const REQUIRED_EDITORIAL_REVIEW_FIELDS = [
  "needs_safety_rewrite",
  "needs_translation_review",
  "needs_severity_review",
  "editorial_notes"
];

const ALLOWED = {
  history_status: new Set(["draft", "reviewed", "needs-review", "archived"]),
  change_type: new Set(["content-update", "source-review", "severity-update", "translation-update", "metadata-update", "archive-note"]),
  review_decision: new Set(["keep", "keep-with-notes", "needs-update", "needs-source-check", "archive"])
};

const CHANGE_TYPE_ORDER = [
  "content-update",
  "source-review",
  "severity-update",
  "translation-update",
  "metadata-update",
  "archive-note"
];

const REVIEW_DECISION_ORDER = [
  "keep",
  "keep-with-notes",
  "needs-update",
  "needs-source-check",
  "archive"
];

function assertPlainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function validateStringField(item, index, field) {
  if (typeof item[field] !== "string" || item[field].trim() === "") {
    throw new Error(`Item ${index} has invalid ${field}; expected non-empty string`);
  }
}

function validateIntegerField(object, index, field, label) {
  if (!Number.isInteger(object[field]) || object[field] < 0) {
    throw new Error(`Item ${index} has invalid ${label}.${field}; expected non-negative integer`);
  }
}

function validateBooleanField(object, index, field, label) {
  if (typeof object[field] !== "boolean") {
    throw new Error(`Item ${index} has invalid ${label}.${field}; expected boolean`);
  }
}

function validateAllowedValue(item, index, field) {
  if (!ALLOWED[field].has(item[field])) {
    throw new Error(`Item ${index} has invalid ${field}: ${item[field]}`);
  }
}

function validateItem(item, index) {
  assertPlainObject(item, `Item ${index}`);

  for (const field of REQUIRED_FIELDS) {
    if (!(field in item)) {
      throw new Error(`Item ${index} is missing required field: ${field}`);
    }
  }

  for (const field of [
    "id",
    "card_id",
    "card_title",
    "language",
    "history_status",
    "updated_at",
    "reviewed_at",
    "source_rechecked_at",
    "change_type",
    "change_summary",
    "change_reason",
    "review_decision",
    "next_review_after"
  ]) {
    validateStringField(item, index, field);
  }

  for (const field of Object.keys(ALLOWED)) {
    validateAllowedValue(item, index, field);
  }

  assertPlainObject(item.source_review, `Item ${index} source_review`);
  for (const field of REQUIRED_SOURCE_REVIEW_FIELDS) {
    if (!(field in item.source_review)) {
      throw new Error(`Item ${index} is missing required source_review field: ${field}`);
    }
  }

  for (const field of ["source_count", "primary_sources", "reference_sources", "signal_sources"]) {
    validateIntegerField(item.source_review, index, field, "source_review");
  }
  validateBooleanField(item.source_review, index, "needs_stronger_source", "source_review");
  if (typeof item.source_review.source_notes !== "string") {
    throw new Error(`Item ${index} has invalid source_review.source_notes; expected string`);
  }

  assertPlainObject(item.editorial_review, `Item ${index} editorial_review`);
  for (const field of REQUIRED_EDITORIAL_REVIEW_FIELDS) {
    if (!(field in item.editorial_review)) {
      throw new Error(`Item ${index} is missing required editorial_review field: ${field}`);
    }
  }

  for (const field of ["needs_safety_rewrite", "needs_translation_review", "needs_severity_review"]) {
    validateBooleanField(item.editorial_review, index, field, "editorial_review");
  }
  if (typeof item.editorial_review.editorial_notes !== "string") {
    throw new Error(`Item ${index} has invalid editorial_review.editorial_notes; expected string`);
  }
}

function countBy(items, key) {
  const counts = new Map();

  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) ?? 0) + 1);
  }

  return counts;
}

function appendEntry(lines, item) {
  lines.push(
    `#### ${item.card_title}`,
    "",
    `- Card ID: ${item.card_id}`,
    `- History status: ${item.history_status}`,
    `- Change type: ${item.change_type}`,
    `- Updated at: ${item.updated_at}`,
    `- Reviewed at: ${item.reviewed_at}`,
    `- Source rechecked at: ${item.source_rechecked_at}`,
    `- Next review after: ${item.next_review_after}`,
    "",
    "Change summary:",
    item.change_summary,
    "",
    "Change reason:",
    item.change_reason,
    "",
    "Source review:",
    `- Source count: ${item.source_review.source_count}`,
    `- Primary sources: ${item.source_review.primary_sources}`,
    `- Reference sources: ${item.source_review.reference_sources}`,
    `- Signal sources: ${item.source_review.signal_sources}`,
    `- Needs stronger source: ${item.source_review.needs_stronger_source}`,
    `- Notes: ${item.source_review.source_notes}`,
    "",
    "Editorial review:",
    `- Needs safety rewrite: ${item.editorial_review.needs_safety_rewrite}`,
    `- Needs translation review: ${item.editorial_review.needs_translation_review}`,
    `- Needs severity review: ${item.editorial_review.needs_severity_review}`,
    `- Notes: ${item.editorial_review.editorial_notes}`,
    ""
  );
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of card update history entries");
}

items.forEach(validateItem);

const changeTypeCounts = countBy(items, "change_type");
const reviewDecisionCounts = countBy(items, "review_decision");

const lines = [
  "# Tripwire Card Update History Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false",
  "",
  "## Summary",
  "",
  `- Total history entries: ${items.length}`,
  ...REVIEW_DECISION_ORDER
    .map((decision) => ({ decision, count: reviewDecisionCounts.get(decision) ?? 0 }))
    .filter(({ count }) => count > 0)
    .map(({ decision, count }) => `- ${decision}: ${count}`),
  "",
  "## Change type groups",
  ""
];

for (const changeType of CHANGE_TYPE_ORDER) {
  const count = changeTypeCounts.get(changeType) ?? 0;
  if (count > 0) {
    lines.push(`- ${changeType}: ${count}`);
  }
}

lines.push("", "## Review decision groups", "");

for (const decision of REVIEW_DECISION_ORDER) {
  const groupItems = items.filter((item) => item.review_decision === decision);
  if (groupItems.length === 0) continue;

  lines.push(`### ${decision}`, "");
  for (const item of groupItems) {
    appendEntry(lines, item);
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n").trimEnd()}\n`);
console.log(`Wrote ${outputPath}`);
