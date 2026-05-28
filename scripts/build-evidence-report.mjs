import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/evidence-notes.example.json";
const outputPath = process.argv[3] ?? "reports/evidence-notes.example.md";

const REQUIRED_FIELDS = [
  "id",
  "evidence_type",
  "evidence_status",
  "source_context",
  "platform",
  "language",
  "collected_at",
  "title",
  "public_safe_summary",
  "screenshot_reference",
  "source_url",
  "capture_notes",
  "redaction",
  "context_review",
  "verification"
];

const REQUIRED_REDACTION_FIELDS = [
  "needs_redaction",
  "possible_personal_data",
  "possible_secret_data",
  "redaction_notes"
];

const REQUIRED_CONTEXT_REVIEW_FIELDS = [
  "needs_original_source_check",
  "needs_date_check",
  "needs_thread_context",
  "needs_translation",
  "context_notes"
];

const REQUIRED_VERIFICATION_FIELDS = [
  "primary_source_found",
  "reference_source_found",
  "do_not_publish_as_confirmed",
  "verification_notes"
];

const ALLOWED = {
  evidence_type: new Set(["screenshot-reference", "manual-note", "url-with-note"]),
  evidence_status: new Set(["needs-review", "needs-redaction", "needs-context", "verified-reference", "rejected"]),
  source_context: new Set(["manual-social-signal", "manual-intake", "candidate-review", "other"]),
  platform: new Set(["x", "bluesky", "mastodon", "other-social", "web", "other"])
};

const EVIDENCE_STATUS_ORDER = ["needs-review", "needs-redaction", "needs-context", "verified-reference", "rejected"];
const EVIDENCE_TYPE_ORDER = ["screenshot-reference", "manual-note", "url-with-note"];

function assertPlainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function validateRequiredFields(object, index, fields, label) {
  for (const field of fields) {
    if (!(field in object)) {
      throw new Error(`Item ${index} is missing required ${label} field: ${field}`);
    }
  }
}

function validateStringField(object, index, field, label = "item", allowEmpty = false) {
  if (typeof object[field] !== "string" || (!allowEmpty && object[field].trim() === "")) {
    throw new Error(`Item ${index} has invalid ${label}.${field}; expected ${allowEmpty ? "string" : "non-empty string"}`);
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
  validateRequiredFields(item, index, REQUIRED_FIELDS, "item");

  for (const field of [
    "id",
    "evidence_type",
    "evidence_status",
    "source_context",
    "platform",
    "language",
    "collected_at",
    "title",
    "public_safe_summary",
    "screenshot_reference",
    "source_url",
    "capture_notes"
  ]) {
    validateStringField(item, index, field);
  }

  if ("observed_at" in item) validateStringField(item, index, "observed_at");
  if ("related_signal_id" in item) validateStringField(item, index, "related_signal_id", "item", true);
  if ("related_candidate_id" in item) validateStringField(item, index, "related_candidate_id", "item", true);
  if ("notes" in item) validateStringField(item, index, "notes");

  for (const field of ["evidence_type", "evidence_status", "source_context", "platform"]) {
    validateAllowedValue(item, index, field);
  }

  assertPlainObject(item.redaction, `Item ${index} redaction`);
  validateRequiredFields(item.redaction, index, REQUIRED_REDACTION_FIELDS, "redaction");
  for (const field of ["needs_redaction", "possible_personal_data", "possible_secret_data"]) {
    validateBooleanField(item.redaction, index, field, "redaction");
  }
  validateStringField(item.redaction, index, "redaction_notes", "redaction");

  assertPlainObject(item.context_review, `Item ${index} context_review`);
  validateRequiredFields(item.context_review, index, REQUIRED_CONTEXT_REVIEW_FIELDS, "context_review");
  for (const field of ["needs_original_source_check", "needs_date_check", "needs_thread_context", "needs_translation"]) {
    validateBooleanField(item.context_review, index, field, "context_review");
  }
  validateStringField(item.context_review, index, "context_notes", "context_review");

  assertPlainObject(item.verification, `Item ${index} verification`);
  validateRequiredFields(item.verification, index, REQUIRED_VERIFICATION_FIELDS, "verification");
  for (const field of ["primary_source_found", "reference_source_found", "do_not_publish_as_confirmed"]) {
    validateBooleanField(item.verification, index, field, "verification");
  }
  validateStringField(item.verification, index, "verification_notes", "verification");
}

function countBy(items, key) {
  const counts = new Map();

  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) ?? 0) + 1);
  }

  return counts;
}

function getSuggestedAction(item) {
  const matches = {
    reject: item.evidence_status === "rejected",
    "needs-redaction":
      item.redaction.needs_redaction === true ||
      item.redaction.possible_secret_data === true ||
      item.redaction.possible_personal_data === true,
    "needs-context":
      item.context_review.needs_original_source_check === true ||
      item.context_review.needs_date_check === true ||
      item.context_review.needs_thread_context === true ||
      item.context_review.needs_translation === true,
    "hold-for-verification":
      item.verification.do_not_publish_as_confirmed === true ||
      (item.verification.primary_source_found === false && item.verification.reference_source_found === false),
    "ready-for-reference-review":
      item.evidence_status === "verified-reference" &&
      (item.verification.primary_source_found === true || item.verification.reference_source_found === true)
  };

  for (const action of [
    "reject",
    "needs-redaction",
    "needs-context",
    "hold-for-verification",
    "ready-for-reference-review"
  ]) {
    if (matches[action]) return action;
  }

  return "hold-for-verification";
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of evidence notes");
}

items.forEach((item, index) => validateItem(item, index));

const typeCounts = countBy(items, "evidence_type");
const statusCounts = countBy(items, "evidence_status");
const presentTypes = EVIDENCE_TYPE_ORDER.filter((type) => typeCounts.has(type));
const presentStatuses = EVIDENCE_STATUS_ORDER.filter((status) => statusCounts.has(status));

const lines = [
  "# Tripwire Screenshot / Manual Evidence Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false  ",
  "Image processing: false  ",
  "OCR: false  ",
  "Automatic publication: false",
  "",
  "## Summary",
  "",
  `- Total evidence notes: ${items.length}`,
  ...presentStatuses.map((status) => `- ${status}: ${statusCounts.get(status)}`),
  "",
  "## Evidence type groups",
  ""
];

for (const type of presentTypes) {
  lines.push(`- ${type}: ${typeCounts.get(type)}`);
}

lines.push("", "## Evidence status groups", "");

for (const status of presentStatuses) {
  lines.push(`### ${status}`, "");

  for (const item of items.filter((entry) => entry.evidence_status === status)) {
    lines.push(
      `#### ${item.title}`,
      "",
      `- ID: ${item.id}`,
      `- Evidence type: ${item.evidence_type}`,
      `- Evidence status: ${item.evidence_status}`,
      `- Source context: ${item.source_context}`,
      `- Related signal ID: ${item.related_signal_id ?? ""}`,
      `- Platform: ${item.platform}`,
      `- Suggested action: ${getSuggestedAction(item)}`,
      `- Source URL: ${item.source_url}`,
      `- Screenshot reference: ${item.screenshot_reference}`,
      "",
      "Redaction:",
      `- Needs redaction: ${item.redaction.needs_redaction}`,
      `- Possible personal data: ${item.redaction.possible_personal_data}`,
      `- Possible secret data: ${item.redaction.possible_secret_data}`,
      `- Notes: ${item.redaction.redaction_notes}`,
      "",
      "Context review:",
      `- Needs original source check: ${item.context_review.needs_original_source_check}`,
      `- Needs date check: ${item.context_review.needs_date_check}`,
      `- Needs thread context: ${item.context_review.needs_thread_context}`,
      `- Needs translation: ${item.context_review.needs_translation}`,
      `- Notes: ${item.context_review.context_notes}`,
      "",
      "Verification:",
      `- Primary source found: ${item.verification.primary_source_found}`,
      `- Reference source found: ${item.verification.reference_source_found}`,
      `- Do not publish as confirmed: ${item.verification.do_not_publish_as_confirmed}`,
      `- Notes: ${item.verification.verification_notes}`,
      "",
      "Public-safe summary:",
      `${item.public_safe_summary}`,
      ""
    );
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote evidence report to ${outputPath}`);
