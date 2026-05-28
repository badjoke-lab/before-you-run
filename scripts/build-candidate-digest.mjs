import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_STATUS = new Set([
  'candidate',
  'high-priority-candidate',
  'maybe-relevant',
  'needs-verification',
  'rejected',
  'published',
  'updated'
]);
const ALLOWED_SOURCE_TYPE = new Set(['primary', 'reference', 'signal']);
const ALLOWED_CONFIDENCE = new Set(['low', 'medium', 'high']);
const ALLOWED_FRESHNESS = new Set(['new', 'recent', 'stale', 'unknown']);
const ALLOWED_SEVERITY = new Set(['high', 'medium', 'watch', 'unknown']);

const DEFAULT_INPUT = 'data/manual-candidates.example.json';
const today = new Date().toISOString().slice(0, 10);
const DEFAULT_OUTPUT = `reports/candidate-digest-${today}.md`;

const inputPath = process.argv[2] || DEFAULT_INPUT;
const outputPath = process.argv[3] || DEFAULT_OUTPUT;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseCandidates(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Input file not found: ${filePath}`);
  }

  let parsed;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    parsed = JSON.parse(raw);
  } catch {
    fail(`Invalid JSON in input file: ${filePath}`);
  }

  if (!Array.isArray(parsed)) {
    fail('Input JSON top-level value must be an array.');
  }

  const requiredFields = ['id', 'title', 'url', 'status', 'source_type', 'summary', 'why_relevant'];

  parsed.forEach((candidate, index) => {
    const prefix = `Candidate at index ${index}`;

    if (candidate == null || typeof candidate !== 'object' || Array.isArray(candidate)) {
      fail(`${prefix} must be an object.`);
    }

    for (const field of requiredFields) {
      if (typeof candidate[field] !== 'string' || candidate[field].trim() === '') {
        fail(`${prefix} is missing required field: ${field}`);
      }
    }

    if (!ALLOWED_STATUS.has(candidate.status)) {
      fail(`${prefix} has invalid status: ${candidate.status}`);
    }
    if (!ALLOWED_SOURCE_TYPE.has(candidate.source_type)) {
      fail(`${prefix} has invalid source_type: ${candidate.source_type}`);
    }

    if (candidate.confidence != null && !ALLOWED_CONFIDENCE.has(candidate.confidence)) {
      fail(`${prefix} has invalid confidence: ${candidate.confidence}`);
    }
    if (candidate.freshness != null && !ALLOWED_FRESHNESS.has(candidate.freshness)) {
      fail(`${prefix} has invalid freshness: ${candidate.freshness}`);
    }
    if (candidate.severity_hint != null && !ALLOWED_SEVERITY.has(candidate.severity_hint)) {
      fail(`${prefix} has invalid severity_hint: ${candidate.severity_hint}`);
    }
  });

  return parsed;
}

function buildDigest(candidates, sourceLabel) {
  const counts = new Map();
  const byStatus = new Map();

  for (const candidate of candidates) {
    counts.set(candidate.status, (counts.get(candidate.status) || 0) + 1);
    if (!byStatus.has(candidate.status)) {
      byStatus.set(candidate.status, []);
    }
    byStatus.get(candidate.status).push(candidate);
  }

  const lines = [
    '# Tripwire Candidate Digest',
    '',
    `Date: ${today}  `,
    `Source: ${sourceLabel}`,
    '',
    '## Summary',
    '',
    `- Total candidates: ${candidates.length}`
  ];

  for (const [status, count] of counts) {
    lines.push(`- ${status}: ${count}`);
  }

  for (const [status, group] of byStatus) {
    lines.push('', `## ${status}`);

    for (const c of group) {
      const categories = Array.isArray(c.candidate_categories) && c.candidate_categories.length > 0
        ? c.candidate_categories.join(', ')
        : 'none';

      lines.push(
        '',
        `### ${c.title}`,
        '',
        `- Status: ${c.status}`,
        `- Source type: ${c.source_type}`,
        `- Confidence: ${c.confidence || 'unknown'}`,
        `- Freshness: ${c.freshness || 'unknown'}`,
        `- Severity hint: ${c.severity_hint || 'unknown'}`,
        `- Categories: ${categories}`,
        `- URL: ${c.url}`,
        '',
        'Why relevant:',
        c.why_relevant,
        '',
        'Public-safe summary:',
        c.summary
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

const candidates = parseCandidates(inputPath);
const digest = buildDigest(candidates, inputPath);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, digest, 'utf8');

console.log(`Wrote candidate digest: ${outputPath}`);
