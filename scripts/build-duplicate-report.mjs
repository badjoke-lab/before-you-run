import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "data/manual-intake.example.json";
const outputPath = process.argv[3] ?? "reports/duplicates.example.md";

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

const TRACKED_UTM_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
]);

const SIMILAR_TITLE_THRESHOLD = 0.75;

function validateItem(item, index) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in item)) {
      throw new Error(`Item ${index} is missing required field: ${field}`);
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

function normalizeUrl(rawUrl, index) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch (error) {
    throw new Error(`Item ${index} has invalid url: ${rawUrl}`);
  }

  parsed.hostname = parsed.hostname.toLowerCase();

  for (const param of TRACKED_UTM_PARAMS) {
    parsed.searchParams.delete(param);
  }

  if (parsed.pathname.length > 1) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }

  return parsed.toString();
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\p{P}\p{S}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleTokens(normalizedTitle) {
  return new Set(normalizedTitle.split(" ").filter(Boolean));
}

function titleSimilarity(firstTitle, secondTitle) {
  const firstTokens = titleTokens(firstTitle);
  const secondTokens = titleTokens(secondTitle);

  if (firstTokens.size === 0 || secondTokens.size === 0) return 0;

  let shared = 0;
  for (const token of firstTokens) {
    if (secondTokens.has(token)) shared += 1;
  }

  return shared / Math.max(firstTokens.size, secondTokens.size);
}

function groupedDuplicates(items, keyName) {
  const groups = new Map();

  for (const item of items) {
    if (!groups.has(item[keyName])) groups.set(item[keyName], []);
    groups.get(item[keyName]).push(item);
  }

  return [...groups.entries()]
    .filter(([, groupItems]) => groupItems.length > 1)
    .map(([key, groupItems]) => ({ key, items: groupItems }));
}

function buildSameSourceTitleWarnings(items) {
  const warnings = [];

  for (let firstIndex = 0; firstIndex < items.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < items.length; secondIndex += 1) {
      const first = items[firstIndex];
      const second = items[secondIndex];

      if (first.source_name !== second.source_name) continue;
      if (first.normalizedTitle === second.normalizedTitle) continue;

      const similarity = titleSimilarity(first.normalizedTitle, second.normalizedTitle);
      if (similarity >= SIMILAR_TITLE_THRESHOLD) {
        warnings.push({ first, second, similarity });
      }
    }
  }

  return warnings;
}

function pushItemLines(lines, item) {
  lines.push(
    `- ${item.id}`,
    `  - Title: ${item.title}`,
    `  - Source: ${item.source_name}`,
    `  - URL: ${item.url}`
  );
}

const rawInput = fs.readFileSync(inputPath, "utf8");
const parsedItems = JSON.parse(rawInput);

if (!Array.isArray(parsedItems)) {
  throw new Error("Input must be a JSON array of intake items");
}

parsedItems.forEach(validateItem);

const items = parsedItems.map((item, index) => ({
  ...item,
  normalizedUrl: normalizeUrl(item.url, index),
  normalizedTitle: normalizeTitle(item.title)
}));

const exactUrlDuplicates = groupedDuplicates(items, "normalizedUrl");
const normalizedTitleDuplicates = groupedDuplicates(items, "normalizedTitle");
const sameSourceTitleWarnings = buildSameSourceTitleWarnings(items);
const likelyDuplicateCount = exactUrlDuplicates.length + normalizedTitleDuplicates.length + sameSourceTitleWarnings.length;

const lines = [
  "# Tripwire Duplicate Detection Report",
  "",
  `Input: ${inputPath}  `,
  "Network access: false",
  "",
  "## Summary",
  "",
  `- Total items: ${items.length}`,
  `- exact-url-duplicates: ${exactUrlDuplicates.length}`,
  `- normalized-title-duplicates: ${normalizedTitleDuplicates.length}`,
  `- same-source-title-warnings: ${sameSourceTitleWarnings.length}`,
  ""
];

if (likelyDuplicateCount === 0) {
  lines.push("No likely duplicates found.", "");
} else {
  lines.push("## exact-url-duplicates", "");

  if (exactUrlDuplicates.length === 0) {
    lines.push("None found.", "");
  } else {
    for (const group of exactUrlDuplicates) {
      lines.push(`### ${group.key}`, "");
      for (const item of group.items) pushItemLines(lines, item);
      lines.push("");
    }
  }

  lines.push("## normalized-title-duplicates", "");

  if (normalizedTitleDuplicates.length === 0) {
    lines.push("None found.", "");
  } else {
    for (const group of normalizedTitleDuplicates) {
      lines.push(`### ${group.key}`, "");
      for (const item of group.items) pushItemLines(lines, item);
      lines.push("");
    }
  }

  lines.push("## same-source-title-warnings", "");

  if (sameSourceTitleWarnings.length === 0) {
    lines.push("None found.", "");
  } else {
    for (const warning of sameSourceTitleWarnings) {
      lines.push(
        `### ${warning.first.source_name}`,
        "",
        `- Similarity: ${warning.similarity.toFixed(2)}`,
        `- First ID: ${warning.first.id}`,
        `- First title: ${warning.first.title}`,
        `- First URL: ${warning.first.url}`,
        `- Second ID: ${warning.second.id}`,
        `- Second title: ${warning.second.title}`,
        `- Second URL: ${warning.second.url}`,
        ""
      );
    }
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote duplicate detection report to ${outputPath}`);
