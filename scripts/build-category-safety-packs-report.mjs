import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/category-safety-packs.example.json";
const outputPath = process.argv[3] ?? "reports/category-safety-packs.example.md";

const REQUIRED_FIELDS = [
  "id",
  "category_id",
  "title",
  "language",
  "pack_status",
  "updated_at",
  "audience",
  "purpose",
  "allowed_guidance",
  "disallowed_guidance",
  "safe_response_rules",
  "ai_prompt_snippet",
  "review_requirements"
];
const REQUIRED_REVIEW_FIELDS = [
  "needs_source_review",
  "needs_safety_review",
  "needs_translation_review",
  "needs_ai_output_review"
];
const ALLOWED_VALUES = {
  pack_status: new Set(["draft", "reviewed", "needs-review", "archived"]),
  audience: new Set(["beginner-developers", "general-users", "maintainers", "other"])
};
const STATUS_ORDER = ["draft", "needs-review", "reviewed", "archived"];
const UNSAFE_TERMS = [
  "exploit steps",
  "credential theft",
  "bypass instructions",
  "weaponized payload",
  "malware payload",
  "steal tokens",
  "exfiltrate"
];
const PROHIBITION_PATTERN = /\b(do not|don't|never|must not|should not|cannot|avoid|prohibit|prohibited|without)\b/i;

function assertPlainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function validateRequiredFields(object, index, fields, label) {
  for (const field of fields) {
    if (!(field in object)) {
      throw new Error(`Pack ${index} is missing required ${label} field: ${field}`);
    }
  }
}

function validateStringField(object, index, field, label = "pack") {
  if (typeof object[field] !== "string" || object[field].trim() === "") {
    throw new Error(`Pack ${index} has invalid ${label}.${field}; expected non-empty string`);
  }
}

function validateGuidanceArray(pack, index, field) {
  if (!Array.isArray(pack[field]) || pack[field].length === 0) {
    throw new Error(`Pack ${index} has invalid ${field}; expected a non-empty array`);
  }

  pack[field].forEach((item, itemIndex) => {
    if (typeof item !== "string" || item.trim() === "") {
      throw new Error(`Pack ${index} has invalid ${field}[${itemIndex}]; expected non-empty string`);
    }
  });
}

function validateAllowedValue(pack, index, field) {
  if (!ALLOWED_VALUES[field].has(pack[field])) {
    throw new Error(`Pack ${index} has invalid ${field}: ${pack[field]}`);
  }
}

function validateReviewRequirements(pack, index) {
  assertPlainObject(pack.review_requirements, `Pack ${index} review_requirements`);
  validateRequiredFields(pack.review_requirements, index, REQUIRED_REVIEW_FIELDS, "review_requirements");

  for (const field of REQUIRED_REVIEW_FIELDS) {
    if (typeof pack.review_requirements[field] !== "boolean") {
      throw new Error(`Pack ${index} has invalid review_requirements.${field}; expected boolean`);
    }
  }
}

function hasUnsafeInstruction(text, term) {
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let searchFrom = 0;

  while (true) {
    const index = lowerText.indexOf(lowerTerm, searchFrom);
    if (index === -1) return false;

    const sentenceStart = Math.max(
      lowerText.lastIndexOf(".", index),
      lowerText.lastIndexOf("!", index),
      lowerText.lastIndexOf("?", index),
      lowerText.lastIndexOf("\n", index)
    );
    const sentencePrefix = text.slice(sentenceStart + 1, index);

    if (!PROHIBITION_PATTERN.test(sentencePrefix)) return true;

    searchFrom = index + lowerTerm.length;
  }
}

function validatePublicSafeText(pack, index, field) {
  const values = Array.isArray(pack[field]) ? pack[field] : [pack[field]];

  values.forEach((value, valueIndex) => {
    for (const term of UNSAFE_TERMS) {
      if (hasUnsafeInstruction(value, term)) {
        const location = Array.isArray(pack[field]) ? `${field}[${valueIndex}]` : field;
        throw new Error(`Pack ${index} has unsafe placeholder term in ${location}: ${term}`);
      }
    }
  });
}

function validatePack(pack, index) {
  assertPlainObject(pack, `Pack ${index}`);
  validateRequiredFields(pack, index, REQUIRED_FIELDS, "pack");

  for (const field of ["id", "category_id", "title", "language", "pack_status", "updated_at", "audience", "purpose", "ai_prompt_snippet"]) {
    validateStringField(pack, index, field);
  }
  if ("notes" in pack) validateStringField(pack, index, "notes");

  validateAllowedValue(pack, index, "pack_status");
  validateAllowedValue(pack, index, "audience");

  for (const field of ["allowed_guidance", "disallowed_guidance", "safe_response_rules"]) {
    validateGuidanceArray(pack, index, field);
  }

  validateReviewRequirements(pack, index);

  for (const field of ["allowed_guidance", "safe_response_rules", "ai_prompt_snippet"]) {
    validatePublicSafeText(pack, index, field);
  }
}

function countBy(items, key) {
  const counts = new Map();

  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) ?? 0) + 1);
  }

  return counts;
}

function renderList(items) {
  return items.map((item) => `- ${item}`);
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const packs = JSON.parse(rawInput);

if (!Array.isArray(packs)) {
  throw new Error("Input must be a JSON array of category safety packs");
}

packs.forEach((pack, index) => validatePack(pack, index));

const categoryCounts = countBy(packs, "category_id");
const statusCounts = countBy(packs, "pack_status");
const presentStatuses = STATUS_ORDER.filter((status) => statusCounts.has(status));
const sortedCategories = [...categoryCounts.keys()].sort((a, b) => a.localeCompare(b));

const lines = [
  "# Tripwire Category Safety Packs Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false  ",
  "AI generation: false  ",
  "Automatic publication: false",
  "",
  "## Summary",
  "",
  `- Total safety packs: ${packs.length}`,
  ...presentStatuses.map((status) => `- ${status}: ${statusCounts.get(status)}`),
  "",
  "## Category groups",
  ""
];

for (const category of sortedCategories) {
  lines.push(`- ${category}: ${categoryCounts.get(category)}`);
}

lines.push("", "## Pack status groups", "");

for (const status of presentStatuses) {
  lines.push(`### ${status}`, "");

  const packsForStatus = packs.filter((pack) => pack.pack_status === status);
  for (const pack of packsForStatus) {
    lines.push(
      `#### ${pack.title}`,
      "",
      `- ID: ${pack.id}`,
      `- Category ID: ${pack.category_id}`,
      `- Language: ${pack.language}`,
      `- Audience: ${pack.audience}`,
      `- Updated at: ${pack.updated_at}`,
      "",
      "Purpose:",
      pack.purpose,
      "",
      "Allowed guidance:",
      ...renderList(pack.allowed_guidance),
      "",
      "Disallowed guidance:",
      ...renderList(pack.disallowed_guidance),
      "",
      "Safe response rules:",
      ...renderList(pack.safe_response_rules),
      "",
      "Review requirements:",
      `- Needs source review: ${pack.review_requirements.needs_source_review}`,
      `- Needs safety review: ${pack.review_requirements.needs_safety_review}`,
      `- Needs translation review: ${pack.review_requirements.needs_translation_review}`,
      `- Needs AI output review: ${pack.review_requirements.needs_ai_output_review}`,
      "",
      "AI prompt snippet:",
      pack.ai_prompt_snippet,
      ""
    );
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n").trimEnd()}\n`);

console.log(`Wrote ${outputPath}`);
