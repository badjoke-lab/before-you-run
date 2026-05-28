import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/publish-review-checklist.example.json";
const outputPath = process.argv[3] ?? "reports/publish-review.example.md";

const REQUIRED_FIELDS = [
  "id",
  "source_candidate_id",
  "draft_id",
  "target_card_id",
  "target_title",
  "language",
  "review_status",
  "reviewed_at",
  "reviewer",
  "gates",
  "source_summary",
  "editorial_summary",
  "decision",
  "decision_reason",
  "next_action"
];

const REQUIRED_GATE_FIELDS = [
  "source_checked",
  "source_url_present",
  "duplicate_checked",
  "freshness_checked",
  "severity_checked",
  "credibility_checked",
  "safety_rewrite_checked",
  "translation_checked",
  "ai_output_checked",
  "unsafe_detail_removed"
];

const REQUIRED_SOURCE_SUMMARY_FIELDS = [
  "source_count",
  "primary_sources",
  "reference_sources",
  "signal_sources",
  "needs_stronger_source",
  "source_notes"
];

const REQUIRED_EDITORIAL_SUMMARY_FIELDS = [
  "public_safe",
  "beginner_safe",
  "contains_unverified_claims",
  "contains_operational_detail",
  "needs_manual_copyedit",
  "editorial_notes"
];

const ALLOWED = {
  review_status: new Set(["draft", "ready-for-final-review", "blocked", "approved", "published", "archived"]),
  decision: new Set([
    "approve-for-manual-publish",
    "hold-for-stronger-source",
    "needs-safety-rewrite",
    "needs-translation-review",
    "needs-duplicate-review",
    "needs-severity-review",
    "reject"
  ])
};

const DECISION_ORDER = [
  "approve-for-manual-publish",
  "hold-for-stronger-source",
  "needs-safety-rewrite",
  "needs-translation-review",
  "needs-duplicate-review",
  "needs-severity-review",
  "reject"
];

const GATE_LABELS = {
  source_checked: "Source checked",
  source_url_present: "Source URL present",
  duplicate_checked: "Duplicate checked",
  freshness_checked: "Freshness checked",
  severity_checked: "Severity checked",
  credibility_checked: "Credibility checked",
  safety_rewrite_checked: "Safety rewrite checked",
  translation_checked: "Translation checked",
  ai_output_checked: "AI output checked",
  unsafe_detail_removed: "Unsafe detail removed"
};

function assertPlainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function validateStringField(object, index, field, label = "item") {
  if (typeof object[field] !== "string" || object[field].trim() === "") {
    throw new Error(`Item ${index} has invalid ${label}.${field}; expected non-empty string`);
  }
}

function validateBooleanField(object, index, field, label) {
  if (typeof object[field] !== "boolean") {
    throw new Error(`Item ${index} has invalid ${label}.${field}; expected boolean`);
  }
}

function validateIntegerField(object, index, field, label) {
  if (!Number.isInteger(object[field]) || object[field] < 0) {
    throw new Error(`Item ${index} has invalid ${label}.${field}; expected non-negative integer`);
  }
}

function validateRequiredFields(object, index, fields, label) {
  for (const field of fields) {
    if (!(field in object)) {
      throw new Error(`Item ${index} is missing required ${label} field: ${field}`);
    }
  }
}

function validateAllowedValue(item, index, field) {
  if (!ALLOWED[field].has(item[field])) {
    throw new Error(`Item ${index} has invalid ${field}: ${item[field]}`);
  }
}

function validateItem(item, index) {
  assertPlainObject(item, `Item ${index}`);
  validateRequiredFields(item, index, REQUIRED_FIELDS, "item");

  for (const field of [
    "id",
    "source_candidate_id",
    "draft_id",
    "target_card_id",
    "target_title",
    "language",
    "review_status",
    "reviewed_at",
    "reviewer",
    "decision",
    "decision_reason",
    "next_action"
  ]) {
    validateStringField(item, index, field);
  }

  for (const field of Object.keys(ALLOWED)) {
    validateAllowedValue(item, index, field);
  }

  assertPlainObject(item.gates, `Item ${index} gates`);
  validateRequiredFields(item.gates, index, REQUIRED_GATE_FIELDS, "gates");
  for (const field of REQUIRED_GATE_FIELDS) {
    validateBooleanField(item.gates, index, field, "gates");
  }

  assertPlainObject(item.source_summary, `Item ${index} source_summary`);
  validateRequiredFields(item.source_summary, index, REQUIRED_SOURCE_SUMMARY_FIELDS, "source_summary");
  for (const field of ["source_count", "primary_sources", "reference_sources", "signal_sources"]) {
    validateIntegerField(item.source_summary, index, field, "source_summary");
  }
  validateBooleanField(item.source_summary, index, "needs_stronger_source", "source_summary");
  if (typeof item.source_summary.source_notes !== "string") {
    throw new Error(`Item ${index} has invalid source_summary.source_notes; expected string`);
  }

  assertPlainObject(item.editorial_summary, `Item ${index} editorial_summary`);
  validateRequiredFields(item.editorial_summary, index, REQUIRED_EDITORIAL_SUMMARY_FIELDS, "editorial_summary");
  for (const field of [
    "public_safe",
    "beginner_safe",
    "contains_unverified_claims",
    "contains_operational_detail",
    "needs_manual_copyedit"
  ]) {
    validateBooleanField(item.editorial_summary, index, field, "editorial_summary");
  }
  if (typeof item.editorial_summary.editorial_notes !== "string") {
    throw new Error(`Item ${index} has invalid editorial_summary.editorial_notes; expected string`);
  }
}

function getBlockedGates(item) {
  return REQUIRED_GATE_FIELDS.filter((field) => item.gates[field] !== true);
}

function getHelperNote(item) {
  const blockedGates = getBlockedGates(item);

  if (
    item.editorial_summary.public_safe !== true ||
    item.editorial_summary.contains_operational_detail === true ||
    item.gates.unsafe_detail_removed !== true
  ) {
    return "blocked-unsafe";
  }

  if (
    item.gates.source_checked !== true ||
    item.gates.source_url_present !== true ||
    item.source_summary.needs_stronger_source === true
  ) {
    return "blocked-source";
  }

  if (blockedGates.length > 0) {
    return "blocked-review";
  }

  if (item.editorial_summary.needs_manual_copyedit === true) {
    return "manual-copyedit";
  }

  if (
    blockedGates.length === 0 &&
    item.editorial_summary.public_safe === true &&
    item.editorial_summary.contains_unverified_claims === false &&
    item.editorial_summary.contains_operational_detail === false &&
    item.source_summary.needs_stronger_source !== true
  ) {
    return "ready-for-manual-publish";
  }

  return "blocked-review";
}

function countBy(items, key) {
  const counts = new Map();

  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) ?? 0) + 1);
  }

  return counts;
}

function appendReviewItem(lines, item) {
  const blockedGates = getBlockedGates(item);

  lines.push(
    `#### ${item.target_title}`,
    "",
    `- Target card ID: ${item.target_card_id}`,
    `- Draft ID: ${item.draft_id}`,
    `- Source candidate ID: ${item.source_candidate_id}`,
    `- Review status: ${item.review_status}`,
    `- Reviewed at: ${item.reviewed_at}`,
    `- Helper note: ${item.helperNote}`
  );

  if (blockedGates.length > 0) {
    lines.push(`- Blocked gates: ${blockedGates.map((gate) => GATE_LABELS[gate]).join(", ")}`);
  }

  lines.push(
    "",
    "Gate status:",
    ...REQUIRED_GATE_FIELDS.map((field) => `- ${GATE_LABELS[field]}: ${item.gates[field]}`),
    "",
    "Source summary:",
    `- Source count: ${item.source_summary.source_count}`,
    `- Primary sources: ${item.source_summary.primary_sources}`,
    `- Reference sources: ${item.source_summary.reference_sources}`,
    `- Signal sources: ${item.source_summary.signal_sources}`,
    `- Needs stronger source: ${item.source_summary.needs_stronger_source}`,
    `- Notes: ${item.source_summary.source_notes}`,
    "",
    "Editorial summary:",
    `- Public safe: ${item.editorial_summary.public_safe}`,
    `- Beginner safe: ${item.editorial_summary.beginner_safe}`,
    `- Contains unverified claims: ${item.editorial_summary.contains_unverified_claims}`,
    `- Contains operational detail: ${item.editorial_summary.contains_operational_detail}`,
    `- Needs manual copyedit: ${item.editorial_summary.needs_manual_copyedit}`,
    `- Notes: ${item.editorial_summary.editorial_notes}`,
    "",
    "Decision reason:",
    item.decision_reason,
    "",
    "Next action:",
    item.next_action,
    ""
  );
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of publish review items");
}

items.forEach(validateItem);

const reviewedItems = items.map((item) => ({
  ...item,
  helperNote: getHelperNote(item)
}));

const decisionCounts = countBy(reviewedItems, "decision");

const lines = [
  "# Tripwire Publish Review Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false  ",
  "Automatic publication: false",
  "",
  "## Summary",
  "",
  `- Total review items: ${reviewedItems.length}`,
  ...DECISION_ORDER
    .map((decision) => ({ decision, count: decisionCounts.get(decision) ?? 0 }))
    .filter(({ count }) => count > 0)
    .map(({ decision, count }) => `- ${decision}: ${count}`),
  "",
  "## Decision groups",
  ""
];

for (const decision of DECISION_ORDER) {
  const groupItems = reviewedItems.filter((item) => item.decision === decision);
  if (groupItems.length === 0) continue;

  lines.push(`### ${decision}`, "");
  for (const item of groupItems) {
    appendReviewItem(lines, item);
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n").trimEnd()}\n`);
console.log(`Wrote ${outputPath}`);
