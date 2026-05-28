import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/social-signals.example.json";
const outputPath = process.argv[3] ?? "reports/social-signals.example.md";

const REQUIRED_FIELDS = [
  "id",
  "platform",
  "source_kind",
  "source_type",
  "signal_status",
  "source_url",
  "display_source",
  "language",
  "collected_at",
  "title",
  "public_safe_summary",
  "why_relevant",
  "candidate_categories",
  "confidence",
  "freshness",
  "severity_hint",
  "capture",
  "review_needs",
  "verification"
];

const REQUIRED_CAPTURE_FIELDS = [
  "capture_type",
  "screenshot_reference",
  "quoted_excerpt",
  "needs_redaction",
  "needs_screenshot_context"
];

const REQUIRED_REVIEW_NEEDS_FIELDS = [
  "needs_source_check",
  "needs_confirmation_source",
  "needs_safety_rewrite",
  "needs_translation",
  "needs_duplicate_check"
];

const REQUIRED_VERIFICATION_FIELDS = [
  "primary_source_found",
  "reference_source_found",
  "do_not_publish_as_confirmed",
  "verification_notes"
];

const ALLOWED = {
  platform: new Set(["x", "other-social"]),
  source_kind: new Set(["social-link", "screenshot-note", "manual-note"]),
  source_type: new Set(["signal"]),
  signal_status: new Set(["needs-verification", "watch", "rejected", "promoted-to-candidate"]),
  confidence: new Set(["low", "medium", "high"]),
  freshness: new Set(["new", "recent", "stale", "unknown"]),
  severity_hint: new Set(["high", "medium", "watch", "unknown"]),
  capture_type: new Set(["url-only", "screenshot-reference", "manual-note"])
};

const STATUS_ORDER = ["needs-verification", "watch", "rejected", "promoted-to-candidate"];
const PLATFORM_ORDER = ["x", "other-social"];

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

function validateStringArrayField(object, index, field, label = "item") {
  if (!Array.isArray(object[field]) || object[field].some((value) => typeof value !== "string" || value.trim() === "")) {
    throw new Error(`Item ${index} has invalid ${label}.${field}; expected array of non-empty strings`);
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
    "platform",
    "source_kind",
    "source_type",
    "signal_status",
    "source_url",
    "display_source",
    "language",
    "collected_at",
    "title",
    "public_safe_summary",
    "why_relevant",
    "confidence",
    "freshness",
    "severity_hint"
  ]) {
    validateStringField(item, index, field);
  }

  validateStringArrayField(item, index, "candidate_categories");
  if ("matched_keywords" in item) validateStringArrayField(item, index, "matched_keywords");
  if ("observed_at" in item) validateStringField(item, index, "observed_at");
  if ("notes" in item) validateStringField(item, index, "notes");

  for (const field of ["platform", "source_kind", "source_type", "signal_status", "confidence", "freshness", "severity_hint"]) {
    validateAllowedValue(item, index, field);
  }

  assertPlainObject(item.capture, `Item ${index} capture`);
  validateRequiredFields(item.capture, index, REQUIRED_CAPTURE_FIELDS, "capture");
  validateStringField(item.capture, index, "capture_type", "capture");
  validateStringField(item.capture, index, "screenshot_reference", "capture", true);
  validateStringField(item.capture, index, "quoted_excerpt", "capture");
  validateBooleanField(item.capture, index, "needs_redaction", "capture");
  validateBooleanField(item.capture, index, "needs_screenshot_context", "capture");
  if (!ALLOWED.capture_type.has(item.capture.capture_type)) {
    throw new Error(`Item ${index} has invalid capture.capture_type: ${item.capture.capture_type}`);
  }

  assertPlainObject(item.review_needs, `Item ${index} review_needs`);
  validateRequiredFields(item.review_needs, index, REQUIRED_REVIEW_NEEDS_FIELDS, "review_needs");
  for (const field of REQUIRED_REVIEW_NEEDS_FIELDS) {
    validateBooleanField(item.review_needs, index, field, "review_needs");
  }

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

function getSignalRiskNote(item) {
  if (item.source_type === "signal") {
    return "This is a signal-only item. Do not treat it as confirmed without stronger sources.";
  }

  return "Review source type before use.";
}

function getVerificationHelper(item) {
  const { primary_source_found: primarySourceFound, reference_source_found: referenceSourceFound } = item.verification;
  const notes = [];

  if (primarySourceFound === false && referenceSourceFound === false) {
    notes.push("No stronger source recorded yet. Hold for confirmation.");
  }

  if (primarySourceFound === true) {
    notes.push("Primary source recorded. Review scope/date before promotion.");
  }

  if (referenceSourceFound === true) {
    notes.push("Reference source recorded. Prefer primary confirmation before publication.");
  }

  return notes.join(" ");
}

function getSuggestedAction(item) {
  const matches = {
    reject: item.signal_status === "rejected",
    "hold-for-confirmation":
      item.verification.do_not_publish_as_confirmed === true ||
      item.review_needs.needs_confirmation_source === true ||
      item.confidence === "low",
    "needs-context-review":
      item.capture.needs_screenshot_context === true ||
      item.capture.needs_redaction === true ||
      item.review_needs.needs_safety_rewrite === true ||
      item.review_needs.needs_translation === true,
    watch: item.signal_status === "watch",
    "ready-for-candidate-review":
      item.signal_status === "promoted-to-candidate" &&
      (item.verification.primary_source_found === true || item.verification.reference_source_found === true) &&
      item.review_needs.needs_safety_rewrite !== true
  };

  for (const action of ["reject", "hold-for-confirmation", "needs-context-review", "watch", "ready-for-candidate-review"]) {
    if (matches[action]) return action;
  }

  return "hold-for-confirmation";
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of social signal items");
}

items.forEach((item, index) => validateItem(item, index));

const platformCounts = countBy(items, "platform");
const statusCounts = countBy(items, "signal_status");
const presentPlatforms = PLATFORM_ORDER.filter((platform) => platformCounts.has(platform));
const presentStatuses = STATUS_ORDER.filter((status) => statusCounts.has(status));

const lines = [
  "# Tripwire Manual Social Signal Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false  ",
  "Automatic publication: false",
  "",
  "## Summary",
  "",
  `- Total social signals: ${items.length}`,
  ...presentStatuses.map((status) => `- ${status}: ${statusCounts.get(status)}`),
  "",
  "## Platform groups",
  ""
];

for (const platform of presentPlatforms) {
  lines.push(`- ${platform}: ${platformCounts.get(platform)}`);
}

lines.push("", "## Signal status groups", "");

for (const status of presentStatuses) {
  lines.push(`### ${status}`, "");

  for (const item of items.filter((entry) => entry.signal_status === status)) {
    lines.push(
      `#### ${item.title}`,
      "",
      `- ID: ${item.id}`,
      `- Platform: ${item.platform}`,
      `- Source kind: ${item.source_kind}`,
      `- Source type: ${item.source_type}`,
      `- Signal status: ${item.signal_status}`,
      `- Suggested action: ${getSuggestedAction(item)}`,
      `- Confidence: ${item.confidence}`,
      `- Freshness: ${item.freshness}`,
      `- Severity hint: ${item.severity_hint}`,
      `- URL: ${item.source_url}`,
      `- Categories: ${item.candidate_categories.join(", ")}`,
      "",
      "Review needs:",
      `- Needs source check: ${item.review_needs.needs_source_check}`,
      `- Needs confirmation source: ${item.review_needs.needs_confirmation_source}`,
      `- Needs safety rewrite: ${item.review_needs.needs_safety_rewrite}`,
      `- Needs translation: ${item.review_needs.needs_translation}`,
      `- Needs duplicate check: ${item.review_needs.needs_duplicate_check}`,
      "",
      "Verification:",
      `- Primary source found: ${item.verification.primary_source_found}`,
      `- Reference source found: ${item.verification.reference_source_found}`,
      `- Do not publish as confirmed: ${item.verification.do_not_publish_as_confirmed}`,
      `- Notes: ${item.verification.verification_notes}`,
      "",
      "Helper notes:",
      `- Signal risk note: ${getSignalRiskNote(item)}`,
      `- Verification helper: ${getVerificationHelper(item)}`,
      "",
      "Public-safe summary:",
      `${item.public_safe_summary}`,
      "",
      "Why relevant:",
      `${item.why_relevant}`,
      ""
    );
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote social signal report to ${outputPath}`);
