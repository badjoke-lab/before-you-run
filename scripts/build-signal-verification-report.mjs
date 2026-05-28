import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/signal-verification-queue.example.json";
const outputPath = process.argv[3] ?? "reports/signal-verification-queue.example.md";

const REQUIRED_FIELDS = [
  "id",
  "queue_status",
  "priority",
  "platform",
  "source_type",
  "source_kind",
  "title",
  "language",
  "created_at",
  "public_safe_summary",
  "verification_needs",
  "verification_state",
  "review_decision",
  "decision_reason",
  "next_action"
];

const REQUIRED_VERIFICATION_NEEDS_FIELDS = [
  "needs_primary_source",
  "needs_reference_source",
  "needs_original_context",
  "needs_duplicate_check",
  "needs_safety_rewrite",
  "needs_translation",
  "needs_redaction_review"
];

const REQUIRED_VERIFICATION_STATE_FIELDS = [
  "primary_source_found",
  "reference_source_found",
  "original_context_checked",
  "duplicate_checked",
  "redaction_checked",
  "safe_to_promote",
  "do_not_publish_as_confirmed"
];

const ALLOWED = {
  queue_status: new Set(["needs-verification", "in-review", "blocked", "ready-for-candidate-review", "rejected"]),
  priority: new Set(["high", "medium", "low", "watch"]),
  platform: new Set(["x", "bluesky", "mastodon", "other-social", "web", "other"]),
  source_type: new Set(["signal"]),
  source_kind: new Set(["social-link", "screenshot-note", "manual-note", "url-with-note"]),
  review_decision: new Set(["hold", "promote-to-candidate-review", "needs-more-context", "needs-redaction", "reject"])
};

const QUEUE_STATUS_ORDER = ["needs-verification", "in-review", "blocked", "ready-for-candidate-review", "rejected"];
const PLATFORM_ORDER = ["x", "bluesky", "mastodon", "other-social", "web", "other"];

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
    "queue_status",
    "priority",
    "platform",
    "source_type",
    "source_kind",
    "title",
    "language",
    "created_at",
    "public_safe_summary",
    "review_decision",
    "decision_reason",
    "next_action"
  ]) {
    validateStringField(item, index, field);
  }

  if ("source_signal_id" in item) validateStringField(item, index, "source_signal_id", "item", true);
  if ("source_evidence_id" in item) validateStringField(item, index, "source_evidence_id", "item", true);
  if ("last_reviewed_at" in item) validateStringField(item, index, "last_reviewed_at");
  if ("notes" in item) validateStringField(item, index, "notes");

  for (const field of ["queue_status", "priority", "platform", "source_type", "source_kind", "review_decision"]) {
    validateAllowedValue(item, index, field);
  }

  assertPlainObject(item.verification_needs, `Item ${index} verification_needs`);
  validateRequiredFields(item.verification_needs, index, REQUIRED_VERIFICATION_NEEDS_FIELDS, "verification_needs");
  for (const field of REQUIRED_VERIFICATION_NEEDS_FIELDS) {
    validateBooleanField(item.verification_needs, index, field, "verification_needs");
  }

  assertPlainObject(item.verification_state, `Item ${index} verification_state`);
  validateRequiredFields(item.verification_state, index, REQUIRED_VERIFICATION_STATE_FIELDS, "verification_state");
  for (const field of REQUIRED_VERIFICATION_STATE_FIELDS) {
    validateBooleanField(item.verification_state, index, field, "verification_state");
  }
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
    reject: item.queue_status === "rejected" || item.review_decision === "reject",
    "needs-redaction":
      item.verification_needs.needs_redaction_review === true && item.verification_state.redaction_checked !== true,
    "needs-context":
      item.verification_needs.needs_original_context === true && item.verification_state.original_context_checked !== true,
    "needs-source-confirmation":
      (item.verification_needs.needs_primary_source === true && item.verification_state.primary_source_found !== true) ||
      (item.verification_needs.needs_reference_source === true && item.verification_state.reference_source_found !== true) ||
      item.verification_state.do_not_publish_as_confirmed === true,
    "needs-duplicate-check":
      item.verification_needs.needs_duplicate_check === true && item.verification_state.duplicate_checked !== true,
    "ready-for-candidate-review":
      item.queue_status === "ready-for-candidate-review" &&
      item.review_decision === "promote-to-candidate-review" &&
      item.verification_state.safe_to_promote === true &&
      item.verification_state.do_not_publish_as_confirmed !== true
  };

  for (const action of [
    "reject",
    "needs-redaction",
    "needs-context",
    "needs-source-confirmation",
    "needs-duplicate-check",
    "ready-for-candidate-review"
  ]) {
    if (matches[action]) return action;
  }

  return "hold";
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const items = JSON.parse(rawInput);

if (!Array.isArray(items)) {
  throw new Error("Input must be a JSON array of signal verification queue items");
}

items.forEach((item, index) => validateItem(item, index));

const platformCounts = countBy(items, "platform");
const statusCounts = countBy(items, "queue_status");
const presentPlatforms = PLATFORM_ORDER.filter((platform) => platformCounts.has(platform));
const presentStatuses = QUEUE_STATUS_ORDER.filter((status) => statusCounts.has(status));

const lines = [
  "# Tripwire Signal Verification Queue Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false  ",
  "Automatic publication: false",
  "",
  "## Summary",
  "",
  `- Total queue items: ${items.length}`,
  ...presentStatuses.map((status) => `- ${status}: ${statusCounts.get(status)}`),
  "",
  "## Platform groups",
  ""
];

for (const platform of presentPlatforms) {
  lines.push(`- ${platform}: ${platformCounts.get(platform)}`);
}

lines.push("", "## Queue status groups", "");

for (const status of presentStatuses) {
  lines.push(`### ${status}`, "");

  for (const item of items.filter((entry) => entry.queue_status === status)) {
    lines.push(
      `#### ${item.title}`,
      "",
      `- ID: ${item.id}`,
      `- Priority: ${item.priority}`,
      `- Platform: ${item.platform}`,
      `- Source type: ${item.source_type}`,
      `- Source kind: ${item.source_kind}`,
      `- Source signal ID: ${item.source_signal_id ?? ""}`,
      `- Source evidence ID: ${item.source_evidence_id ?? ""}`,
      `- Review decision: ${item.review_decision}`,
      `- Suggested action: ${getSuggestedAction(item)}`,
      `- Created at: ${item.created_at}`,
      `- Last reviewed at: ${item.last_reviewed_at ?? ""}`,
      "",
      "Verification needs:",
      `- Needs primary source: ${item.verification_needs.needs_primary_source}`,
      `- Needs reference source: ${item.verification_needs.needs_reference_source}`,
      `- Needs original context: ${item.verification_needs.needs_original_context}`,
      `- Needs duplicate check: ${item.verification_needs.needs_duplicate_check}`,
      `- Needs safety rewrite: ${item.verification_needs.needs_safety_rewrite}`,
      `- Needs translation: ${item.verification_needs.needs_translation}`,
      `- Needs redaction review: ${item.verification_needs.needs_redaction_review}`,
      "",
      "Verification state:",
      `- Primary source found: ${item.verification_state.primary_source_found}`,
      `- Reference source found: ${item.verification_state.reference_source_found}`,
      `- Original context checked: ${item.verification_state.original_context_checked}`,
      `- Duplicate checked: ${item.verification_state.duplicate_checked}`,
      `- Redaction checked: ${item.verification_state.redaction_checked}`,
      `- Safe to promote: ${item.verification_state.safe_to_promote}`,
      `- Do not publish as confirmed: ${item.verification_state.do_not_publish_as_confirmed}`,
      "",
      "Decision reason:",
      `${item.decision_reason}`,
      "",
      "Next action:",
      `${item.next_action}`,
      "",
      "Public-safe summary:",
      `${item.public_safe_summary}`,
      ""
    );
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote signal verification queue report to ${outputPath}`);
