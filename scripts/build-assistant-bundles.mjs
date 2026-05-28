import fs from "node:fs";
import path from "node:path";

const inputManifestPath = process.argv[2] ?? "downloads/ai-rules/manifest.example.json";
const outputDirectory = process.argv[3] ?? "downloads/assistant-bundles";
const reportPath = process.argv[4] ?? "reports/assistant-bundles.example.md";

const agentsOutputPath = path.join(outputDirectory, "AGENTS.example.md");
const cursorOutputPath = path.join(outputDirectory, "cursor-rules.example.md");
const bundleManifestPath = path.join(outputDirectory, "manifest.example.json");

const REQUIRED_MANIFEST_FIELDS = [
  "generated_at",
  "source",
  "network_access",
  "ai_generation",
  "rules"
];
const REQUIRED_RULE_FIELDS = [
  "pack_id",
  "category_id",
  "title",
  "language",
  "audience",
  "path",
  "updated_at"
];
const UNSAFE_TERMS = [
  "exploit steps",
  "credential theft",
  "bypass instructions",
  "weaponized payload",
  "malware payload",
  "steal tokens",
  "exfiltrate"
];
const PROHIBITION_PATTERNS = [
  /^-?\s*do not\b/i,
  /^-?\s*never\b/i,
  /^-?\s*avoid\b/i,
  /^-?\s*disallow(?:ed)?\b/i,
  /^-?\s*prohibit(?:ed)?\b/i,
  /^-?\s*must not\b/i,
  /^-?\s*do not include\b/i,
  /^-?\s*do not provide\b/i
];
const PROHIBITION_SECTION_HEADINGS = [
  "## disallowed guidance"
];

function assertPlainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function validateRequiredFields(object, fields, label) {
  for (const field of fields) {
    if (!(field in object)) {
      throw new Error(`${label} is missing required field: ${field}`);
    }
  }
}

function validateStringField(object, field, label) {
  if (typeof object[field] !== "string" || object[field].trim() === "") {
    throw new Error(`${label}.${field} must be a non-empty string`);
  }
}

function validateBooleanField(object, field, label) {
  if (typeof object[field] !== "boolean") {
    throw new Error(`${label}.${field} must be a boolean`);
  }
}

function validateManifest(manifest, manifestPath) {
  assertPlainObject(manifest, "Source manifest");
  validateRequiredFields(manifest, REQUIRED_MANIFEST_FIELDS, "Source manifest");

  validateStringField(manifest, "generated_at", "Source manifest");
  validateStringField(manifest, "source", "Source manifest");
  validateBooleanField(manifest, "network_access", "Source manifest");
  validateBooleanField(manifest, "ai_generation", "Source manifest");

  if (manifest.network_access !== false) {
    throw new Error(`${manifestPath} must declare network_access: false`);
  }

  if (manifest.ai_generation !== false) {
    throw new Error(`${manifestPath} must declare ai_generation: false`);
  }

  if (!Array.isArray(manifest.rules) || manifest.rules.length === 0) {
    throw new Error(`${manifestPath} must include at least one reviewed rule`);
  }

  manifest.rules.forEach((rule, index) => {
    assertPlainObject(rule, `Source manifest rule ${index}`);
    validateRequiredFields(rule, REQUIRED_RULE_FIELDS, `Source manifest rule ${index}`);

    for (const field of REQUIRED_RULE_FIELDS) {
      validateStringField(rule, field, `Source manifest rule ${index}`);
    }
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeOutputPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function readSourceRules(rules) {
  return rules.map((rule, index) => {
    if (!fs.existsSync(rule.path)) {
      throw new Error(`Source manifest rule ${index} references missing file: ${rule.path}`);
    }

    const content = fs.readFileSync(rule.path, "utf8").trimEnd();

    if (content.trim() === "") {
      throw new Error(`Source manifest rule ${index} references an empty file: ${rule.path}`);
    }

    return {
      ...rule,
      content
    };
  });
}

function renderRuleSections(sourceRules) {
  return sourceRules
    .map((rule) => [`### ${rule.title}`, "", rule.content].join("\n"))
    .join("\n\n");
}

function renderAgentsMarkdown(sourceRules) {
  return `${[
    "# Tripwire Assistant Rules",
    "",
    "Generated from reviewed Tripwire AI rules.",
    "",
    "Network access: false  ",
    "AI generation: false  ",
    "Automatic publication: false",
    "",
    "## Global safety boundary",
    "",
    "- Provide defensive, beginner-safe guidance only.",
    "- Do not provide exploit steps.",
    "- Do not provide credential theft methods.",
    "- Do not provide bypass instructions.",
    "- Do not provide weaponized payloads.",
    "- Do not make unverified claims about real repositories, packages, people, or organizations.",
    "- Prefer safer alternatives and manual review steps.",
    "",
    "## Rule packs",
    "",
    renderRuleSections(sourceRules)
  ].join("\n").trimEnd()}\n`;
}

function renderCursorMarkdown(sourceRules) {
  return `${[
    "# Tripwire Cursor Rules Example",
    "",
    "Use these rules as a reviewable starting point before copying into editor-specific configuration.",
    "",
    "## Behavior",
    "",
    "- Keep all security guidance defensive and public-safe.",
    "- Avoid operational attack detail.",
    "- Flag uncertain or unverified claims.",
    "- Recommend manual review before running unfamiliar code.",
    "- Avoid secrets in prompts, terminals, and repositories.",
    "",
    "## Included rule packs",
    "",
    renderRuleSections(sourceRules)
  ].join("\n").trimEnd()}\n`;
}

function lineHasUnsafeTerm(line) {
  const normalizedLine = line.toLowerCase();
  return UNSAFE_TERMS.find((term) => normalizedLine.includes(term.toLowerCase()));
}

function isProhibitionLine(line) {
  const trimmedLine = line.trim();
  return PROHIBITION_PATTERNS.some((pattern) => pattern.test(trimmedLine));
}

function validatePublicSafeBundle(markdown, outputPath) {
  let inProhibitionSection = false;
  const lines = markdown.split("\n");

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const normalizedHeading = trimmedLine.toLowerCase();

    if (trimmedLine.startsWith("## ")) {
      inProhibitionSection = PROHIBITION_SECTION_HEADINGS.includes(normalizedHeading);
    }

    const unsafeTerm = lineHasUnsafeTerm(line);
    if (!unsafeTerm) {
      return;
    }

    if (isProhibitionLine(trimmedLine) || inProhibitionSection) {
      return;
    }

    throw new Error(`${outputPath} contains unsafe instruction term outside prohibition context on line ${index + 1}: ${unsafeTerm}`);
  });
}

function renderBundleManifest(sourceManifestPath, generatedAt, sourceRules) {
  const sourceRulePaths = sourceRules.map((rule) => rule.path);

  return {
    generated_at: generatedAt,
    source_manifest: sourceManifestPath,
    network_access: false,
    ai_generation: false,
    bundles: [
      {
        type: "agents-md",
        path: normalizeOutputPath(agentsOutputPath),
        source_rules: sourceRulePaths
      },
      {
        type: "cursor-rules",
        path: normalizeOutputPath(cursorOutputPath),
        source_rules: sourceRulePaths
      }
    ]
  };
}

function renderReport(sourceManifestPath, outputDir, sourceRules) {
  return `${[
    "# Tripwire Assistant Bundles Report",
    "",
    `Input manifest: ${sourceManifestPath}  `,
    `Output directory: ${outputDir}  `,
    "Network access: false  ",
    "AI generation: false",
    "",
    "## Summary",
    "",
    `- Source rules: ${sourceRules.length}`,
    "- Bundles generated: 2",
    "",
    "## Generated bundles",
    "",
    "### AGENTS.example.md",
    "",
    "- Type: agents-md",
    `- Output: ${normalizeOutputPath(agentsOutputPath)}`,
    `- Source rules: ${sourceRules.length}`,
    "",
    "### cursor-rules.example.md",
    "",
    "- Type: cursor-rules",
    `- Output: ${normalizeOutputPath(cursorOutputPath)}`,
    `- Source rules: ${sourceRules.length}`,
    "",
    "## Source rules",
    "",
    ...sourceRules.map((rule) => `- ${rule.path}`)
  ].join("\n").trimEnd()}\n`;
}

function writeTextFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

const manifest = readJson(inputManifestPath);
validateManifest(manifest, inputManifestPath);

const sourceRules = readSourceRules(manifest.rules);
const agentsMarkdown = renderAgentsMarkdown(sourceRules);
const cursorMarkdown = renderCursorMarkdown(sourceRules);

validatePublicSafeBundle(agentsMarkdown, agentsOutputPath);
validatePublicSafeBundle(cursorMarkdown, cursorOutputPath);

const bundleManifest = renderBundleManifest(inputManifestPath, manifest.generated_at, sourceRules);
const reportMarkdown = renderReport(inputManifestPath, outputDirectory, sourceRules);

writeTextFile(agentsOutputPath, agentsMarkdown);
writeTextFile(cursorOutputPath, cursorMarkdown);
writeTextFile(bundleManifestPath, `${JSON.stringify(bundleManifest, null, 2)}\n`);
writeTextFile(reportPath, reportMarkdown);

console.log(`Wrote ${agentsOutputPath}`);
console.log(`Wrote ${cursorOutputPath}`);
console.log(`Wrote ${bundleManifestPath}`);
console.log(`Wrote ${reportPath}`);
