import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/category-safety-packs.example.json";
const outputDirectory = process.argv[3] ?? "downloads/ai-rules";
const reportPath = process.argv[4] ?? "reports/downloadable-ai-rules.example.md";

const manifestPath = path.join(outputDirectory, "manifest.example.json");

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
const EXPORTABLE_STATUS = "reviewed";
const SKIPPED_STATUS_REASON = "Only reviewed packs are exported.";
const UNSAFE_TERMS = [
  "exploit steps",
  "attack instructions",
  "credential theft",
  "credential theft methods",
  "bypass instructions",
  "weaponized payload",
  "weaponized payloads",
  "malware payload",
  "malware payloads",
  "steal tokens",
  "exfiltrate"
];

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

function validateReviewRequirements(pack, index) {
  assertPlainObject(pack.review_requirements, `Pack ${index} review_requirements`);
  validateRequiredFields(pack.review_requirements, index, REQUIRED_REVIEW_FIELDS, "review_requirements");

  for (const field of REQUIRED_REVIEW_FIELDS) {
    if (pack.review_requirements[field] !== false) {
      throw new Error(`Pack ${index} is not exportable; review_requirements.${field} must be false`);
    }
  }
}

function validatePackShape(pack, index) {
  assertPlainObject(pack, `Pack ${index}`);
  validateRequiredFields(pack, index, REQUIRED_FIELDS, "pack");

  for (const field of ["id", "category_id", "title", "language", "pack_status", "updated_at", "audience", "purpose", "ai_prompt_snippet"]) {
    validateStringField(pack, index, field);
  }

  for (const field of ["allowed_guidance", "disallowed_guidance", "safe_response_rules"]) {
    validateGuidanceArray(pack, index, field);
  }

  assertPlainObject(pack.review_requirements, `Pack ${index} review_requirements`);
  validateRequiredFields(pack.review_requirements, index, REQUIRED_REVIEW_FIELDS, "review_requirements");

  for (const field of REQUIRED_REVIEW_FIELDS) {
    if (typeof pack.review_requirements[field] !== "boolean") {
      throw new Error(`Pack ${index} has invalid review_requirements.${field}; expected boolean`);
    }
  }
}

function slugifyCategory(categoryId) {
  return categoryId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderRuleMarkdown(pack) {
  return `${[
    `# ${pack.title}`,
    "",
    `Category: ${pack.category_id}  `,
    `Audience: ${pack.audience}  `,
    `Language: ${pack.language}  `,
    `Updated: ${pack.updated_at}`,
    "",
    "## Purpose",
    "",
    pack.purpose,
    "",
    "## Allowed guidance",
    "",
    markdownList(pack.allowed_guidance),
    "",
    "## Disallowed guidance",
    "",
    markdownList(pack.disallowed_guidance),
    "",
    "## Safe response rules",
    "",
    markdownList(pack.safe_response_rules),
    "",
    "## AI prompt snippet",
    "",
    pack.ai_prompt_snippet
  ].join("\n").trimEnd()}\n`;
}

function removeDisallowedSections(markdown) {
  return markdown.replace(/## Disallowed guidance[\s\S]*?(?=\n## |$)/g, "");
}

function validatePublicSafeMarkdown(markdown, outputPath) {
  const safeSections = removeDisallowedSections(markdown).toLowerCase();

  for (const term of UNSAFE_TERMS) {
    if (safeSections.includes(term.toLowerCase())) {
      throw new Error(`${outputPath} contains unsafe instruction term outside disallowed sections: ${term}`);
    }
  }
}

function validateExportablePack(pack, index) {
  if (pack.pack_status !== EXPORTABLE_STATUS) {
    throw new Error(`Pack ${index} is not exportable; pack_status must be reviewed`);
  }

  validateReviewRequirements(pack, index);
}

function renderReport(input, outputDir, packs, exportedRules, skippedPacks) {
  const lines = [
    "# Tripwire Downloadable AI Rules Report",
    "",
    `Input: ${input}  `,
    `Output directory: ${outputDir}  `,
    "Network access: false  ",
    "AI generation: false",
    "",
    "## Summary",
    "",
    `- Total packs: ${packs.length}`,
    `- Exported reviewed packs: ${exportedRules.length}`,
    `- Skipped packs: ${skippedPacks.length}`,
    "",
    "## Exported rules",
    ""
  ];

  if (exportedRules.length === 0) {
    lines.push("No reviewed packs were exported.", "");
  } else {
    for (const rule of exportedRules) {
      lines.push(
        `### ${rule.title}`,
        "",
        `- Pack ID: ${rule.pack_id}`,
        `- Category ID: ${rule.category_id}`,
        `- Language: ${rule.language}`,
        `- Audience: ${rule.audience}`,
        `- Output: ${rule.path}`,
        ""
      );
    }
  }

  lines.push("## Skipped packs", "");

  if (skippedPacks.length === 0) {
    lines.push("No packs were skipped.", "");
  } else {
    for (const skipped of skippedPacks) {
      lines.push(
        `### ${skipped.title}`,
        "",
        `- Pack ID: ${skipped.id}`,
        `- Status: ${skipped.pack_status}`,
        `- Reason: ${SKIPPED_STATUS_REASON}`,
        ""
      );
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const packs = JSON.parse(rawInput);

if (!Array.isArray(packs)) {
  throw new Error("Input must be a JSON array of category safety packs");
}

packs.forEach((pack, index) => validatePackShape(pack, index));

const reviewedPacks = packs.filter((pack) => pack.pack_status === EXPORTABLE_STATUS);
const skippedPacks = packs.filter((pack) => pack.pack_status !== EXPORTABLE_STATUS);
const exportedRules = [];

fs.mkdirSync(outputDirectory, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

reviewedPacks.forEach((pack) => {
  const index = packs.indexOf(pack);
  validateExportablePack(pack, index);

  const fileName = `${slugifyCategory(pack.category_id)}-basic.md`;
  const rulePath = path.join(outputDirectory, fileName);
  const normalizedRulePath = rulePath.split(path.sep).join("/");
  const markdown = renderRuleMarkdown(pack);

  validatePublicSafeMarkdown(markdown, normalizedRulePath);
  fs.writeFileSync(rulePath, markdown);

  exportedRules.push({
    pack_id: pack.id,
    category_id: pack.category_id,
    title: pack.title,
    language: pack.language,
    audience: pack.audience,
    path: normalizedRulePath,
    updated_at: pack.updated_at
  });
});

const generatedAt = exportedRules.map((rule) => rule.updated_at).sort().at(-1) ?? new Date().toISOString().slice(0, 10);
const manifest = {
  generated_at: generatedAt,
  source: inputPath,
  network_access: false,
  ai_generation: false,
  rules: exportedRules
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(reportPath, renderReport(inputPath, outputDirectory, packs, exportedRules, skippedPacks));

console.log(`Exported ${exportedRules.length} reviewed AI rule file(s) to ${outputDirectory}`);
console.log(`Wrote ${manifestPath}`);
console.log(`Wrote ${reportPath}`);
