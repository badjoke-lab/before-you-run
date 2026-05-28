import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_SOURCE_KIND = new Set(['article', 'official-advisory', 'blog', 'social-link', 'screenshot-note', 'manual-note', 'other']);
const ALLOWED_SOURCE_TYPE = new Set(['primary', 'reference', 'signal']);
const ALLOWED_CONFIDENCE = new Set(['low', 'medium', 'high']);
const ALLOWED_FRESHNESS = new Set(['new', 'recent', 'stale', 'unknown']);
const ALLOWED_SEVERITY = new Set(['high', 'medium', 'watch', 'unknown']);

const DEFAULT_INPUT = 'data/manual-intake.example.json';
const DEFAULT_RUN_OUTPUT = 'data/intake-runs.example.json';
const DEFAULT_REPORT_OUTPUT = 'reports/intake-run.example.md';

const inputPath = process.argv[2] || DEFAULT_INPUT;
const runOutputPath = process.argv[3] || DEFAULT_RUN_OUTPUT;
const reportOutputPath = process.argv[4] || DEFAULT_REPORT_OUTPUT;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseIntakeItems(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Input file not found: ${filePath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    fail(`Invalid JSON in input file: ${filePath}`);
  }

  if (!Array.isArray(parsed)) {
    fail('Input JSON top-level value must be an array.');
  }

  const requiredFields = [
    'id', 'source_kind', 'source_type', 'source_name', 'url', 'title', 'language', 'collected_at',
    'raw_summary', 'candidate_categories', 'confidence', 'freshness', 'severity_hint'
  ];

  parsed.forEach((item, index) => {
    const prefix = `Intake item at index ${index}`;

    if (item == null || typeof item !== 'object' || Array.isArray(item)) {
      fail(`${prefix} must be an object.`);
    }

    for (const field of requiredFields) {
      if (item[field] == null) {
        fail(`${prefix} is missing required field: ${field}`);
      }
    }

    for (const field of ['id', 'source_kind', 'source_type', 'source_name', 'url', 'title', 'language', 'collected_at', 'raw_summary', 'confidence', 'freshness', 'severity_hint']) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        fail(`${prefix} has invalid value for field: ${field}`);
      }
    }

    if (!Array.isArray(item.candidate_categories) || item.candidate_categories.length === 0) {
      fail(`${prefix} must include a non-empty candidate_categories array.`);
    }

    for (const field of ['needs_translation', 'needs_source_check', 'needs_safety_rewrite']) {
      if (item[field] != null && typeof item[field] !== 'boolean') {
        fail(`${prefix} has non-boolean optional field: ${field}`);
      }
    }

    if (!ALLOWED_SOURCE_KIND.has(item.source_kind)) {
      fail(`${prefix} has invalid source_kind: ${item.source_kind}`);
    }
    if (!ALLOWED_SOURCE_TYPE.has(item.source_type)) {
      fail(`${prefix} has invalid source_type: ${item.source_type}`);
    }
    if (!ALLOWED_CONFIDENCE.has(item.confidence)) {
      fail(`${prefix} has invalid confidence: ${item.confidence}`);
    }
    if (!ALLOWED_FRESHNESS.has(item.freshness)) {
      fail(`${prefix} has invalid freshness: ${item.freshness}`);
    }
    if (!ALLOWED_SEVERITY.has(item.severity_hint)) {
      fail(`${prefix} has invalid severity_hint: ${item.severity_hint}`);
    }
  });

  return parsed;
}

function buildReport(items, sourceLabel) {
  const lines = [
    '# Tripwire Intake Run',
    '',
    'Mode: manual-local  ',
    'Network access: false  ',
    `Input: ${sourceLabel}`,
    '',
    '## Summary',
    '',
    `- Items seen: ${items.length}`,
    `- Candidate-like items: ${items.length}`,
    '- Rejected items: 0',
    '',
    '## Candidate-like items'
  ];

  for (const item of items) {
    const labelNotes = item.label_notes && typeof item.label_notes === 'object'
      ? Object.entries(item.label_notes).map(([key, value]) => `${key}: ${value}`).join(' | ')
      : 'No label notes.';

    lines.push(
      '',
      `### ${item.title}`,
      '',
      `- Source: ${item.source_name}`,
      `- Source kind: ${item.source_kind}`,
      `- Source type: ${item.source_type}`,
      `- URL: ${item.url}`,
      `- Confidence: ${item.confidence}`,
      `- Freshness: ${item.freshness}`,
      `- Severity hint: ${item.severity_hint}`,
      `- Categories: ${item.candidate_categories.join(', ')}`,
      `- Needs translation: ${item.needs_translation ?? false}`,
      `- Needs source check: ${item.needs_source_check ?? false}`,
      `- Needs safety rewrite: ${item.needs_safety_rewrite ?? false}`,
      '',
      'Public-safe summary:',
      item.raw_summary,
      '',
      'Submitter note:',
      item.submitter_note || 'No submitter note.',
      '',
      'Quoted excerpt:',
      item.quoted_excerpt || 'No quoted excerpt.',
      '',
      'Screenshot reference:',
      item.screenshot_reference || 'No screenshot reference.',
      '',
      'Notes:',
      item.intake_notes || 'No additional notes.',
      '',
      'Label notes:',
      labelNotes
    );
  }

  return `${lines.join('\n')}\n`;
}

function buildRunOutput(items, sourceLabel, reportPath) {
  const runDate = new Date().toISOString().slice(0, 10);

  return [
    {
      run_id: `intake-run-example-${runDate}`,
      mode: 'manual-local',
      started_at: runDate,
      completed_at: runDate,
      input_path: sourceLabel,
      items_seen: items.length,
      items_accepted_as_candidates: items.length,
      items_rejected: 0,
      network_access: false,
      outputs: {
        candidate_digest: reportPath
      },
      notes: 'Example local intake run. No RSS/API/network access.'
    }
  ];
}

const intakeItems = parseIntakeItems(inputPath);
const report = buildReport(intakeItems, inputPath);
const runOutput = buildRunOutput(intakeItems, inputPath, reportOutputPath);

fs.mkdirSync(path.dirname(reportOutputPath), { recursive: true });
fs.writeFileSync(reportOutputPath, report, 'utf8');

fs.mkdirSync(path.dirname(runOutputPath), { recursive: true });
fs.writeFileSync(runOutputPath, `${JSON.stringify(runOutput, null, 2)}\n`, 'utf8');

console.log(`Wrote intake run report: ${reportOutputPath}`);
console.log(`Wrote intake run output: ${runOutputPath}`);
