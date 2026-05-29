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
const ALLOWED_SEVERITY = new Set(['high', 'medium', 'watch', 'unknown']);
const ALLOWED_TIME_PRECISION = new Set(['datetime', 'date', 'month', 'unknown']);
const ALLOWED_TIMEZONE_CONFIDENCE = new Set(['explicit', 'inferred', 'unknown']);

const DEFAULT_INPUT = 'data/candidate-review-queue.example.json';
const DEFAULT_OUTPUT_JSON = 'data/card-drafts.example.json';
const DEFAULT_OUTPUT_REPORT = 'reports/card-drafts.example.md';
const today = new Date().toISOString().slice(0, 10);

const inputPath = process.argv[2] || DEFAULT_INPUT;
const outputJsonPath = process.argv[3] || DEFAULT_OUTPUT_JSON;
const outputReportPath = process.argv[4] || DEFAULT_OUTPUT_REPORT;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function isDateOnly(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isUtcDateTime(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value);
}

function timeValueOrNull(value) {
  return isDateOnly(value) || isUtcDateTime(value) ? value : null;
}

function dateOrToday(value) {
  return isDateOnly(value) ? value : today;
}

function parseQueue(filePath) {
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

  const required = ['id', 'title', 'source_url', 'source_type', 'summary', 'review_decision'];
  parsed.forEach((item, index) => {
    const prefix = `Queue item at index ${index}`;
    if (item == null || typeof item !== 'object' || Array.isArray(item)) {
      fail(`${prefix} must be an object.`);
    }

    for (const field of required) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        fail(`${prefix} is missing required field: ${field}`);
      }
    }

    if (!ALLOWED_SOURCE_TYPE.has(item.source_type)) {
      fail(`${prefix} has invalid source_type: ${item.source_type}`);
    }
    if (item.status != null && !ALLOWED_STATUS.has(item.status)) {
      fail(`${prefix} has invalid status: ${item.status}`);
    }
    if (item.severity_hint != null && !ALLOWED_SEVERITY.has(item.severity_hint)) {
      fail(`${prefix} has invalid severity_hint: ${item.severity_hint}`);
    }
    if (item.source_time_precision != null && !ALLOWED_TIME_PRECISION.has(item.source_time_precision)) {
      fail(`${prefix} has invalid source_time_precision: ${item.source_time_precision}`);
    }
    if (item.source_timezone_confidence != null && !ALLOWED_TIMEZONE_CONFIDENCE.has(item.source_timezone_confidence)) {
      fail(`${prefix} has invalid source_timezone_confidence: ${item.source_timezone_confidence}`);
    }
  });

  return parsed;
}

function buildDraft(item) {
  const idBase = slugify(item.safe_card_angle || item.title || item.id || 'draft-card');
  const sourcePublishedAt = timeValueOrNull(item.source_published_at);
  const sourcePublishedDate = isDateOnly(item.source_published_date) ? item.source_published_date : null;
  const publishedAt = item.published_at === 'unknown' ? 'unknown' : timeValueOrNull(item.published_at) || 'unknown';
  const sourceTimePrecision = ALLOWED_TIME_PRECISION.has(item.source_time_precision) ? item.source_time_precision : 'unknown';
  const sourceTimezoneConfidence = ALLOWED_TIMEZONE_CONFIDENCE.has(item.source_timezone_confidence) ? item.source_timezone_confidence : 'unknown';

  return {
    draft_id: `draft-${idBase}`,
    source_candidate_id: item.id,
    draft_status: 'draft',
    needs_editorial_review: true,
    id: idBase,
    title: item.safe_card_angle || item.title,
    title_ja: '要編集: 日本語タイトルを追加してください',
    severity: item.severity_hint || 'unknown',
    categories: Array.isArray(item.candidate_categories) && item.candidate_categories.length > 0
      ? item.candidate_categories
      : ['needs-categorization'],
    audience: ['beginner', 'indie-dev', 'ai-coding'],
    summary: item.summary,
    summary_ja: '要編集: 日本語サマリーを追加してください。',
    dangerous_actions: [
      item.safe_card_angle || item.title
    ],
    dangerous_actions_ja: [
      '要編集: 危険操作の日本語説明を追加してください。'
    ],
    avoid_now: [
      'Review source trust and command/script behavior before execution',
      'Use isolation and ask for confirmation before risky actions'
    ],
    avoid_now_ja: [
      '実行前にソース信頼性とコマンド/スクリプト挙動を確認する',
      '高リスク操作の前に隔離環境を使い、確認を取る'
    ],
    first_seen_at: dateOrToday(item.first_seen_at),
    checked_at: dateOrToday(item.checked_at),
    updated_at: dateOrToday(item.updated_at),
    status: 'active',
    freshness_label: item.freshness_label || 'recent',
    draft_labels: {
      source_confidence: item.confidence || 'medium',
      source_freshness: item.freshness || 'new',
      severity_hint: item.severity_hint || 'medium',
      label_notes: item.label_notes && typeof item.label_notes === 'object' ? item.label_notes : {}
    },
    sources: [
      {
        title: item.title,
        url: item.source_url,
        publisher: item.source_id || 'Manual candidate',
        source_type: item.source_type,
        published_at: publishedAt,
        checked_at: dateOrToday(item.checked_at),
        source_published_original: item.source_published_original || 'unknown',
        source_time_precision: sourceTimePrecision,
        source_published_at: sourcePublishedAt,
        source_published_date: sourcePublishedDate,
        source_timezone: item.source_timezone || null,
        source_timezone_confidence: sourceTimezoneConfidence
      }
    ],
    ai_output: {
      risk_summary: item.summary,
      do_not: [
        'Do not execute risky commands from unfamiliar sources without review.'
      ],
      check_first: [
        'Check source trust, scripts, permissions, and likely side effects.'
      ],
      safe_actions: [
        'Use isolated environments and explicit approvals for risky steps.'
      ],
      ask_user_before: [
        'Running install/build/test commands',
        'Executing project-defined scripts'
      ],
      agent_instruction: 'Provide a short risk summary, list checks completed, and request explicit confirmation before risky execution.',
      checklist: [
        'Checked source trust',
        'Checked commands/scripts',
        'Checked permissions and side effects',
        'Asked user before execution'
      ]
    },
    ai_output_ja: {
      risk_summary: '要編集: 日本語リスク要約を追加してください。',
      do_not: [
        '要編集: 日本語の禁止事項を追加してください。'
      ],
      check_first: [
        '要編集: 日本語の事前確認項目を追加してください。'
      ],
      safe_actions: [
        '要編集: 日本語の安全行動を追加してください。'
      ],
      ask_user_before: [
        '要編集: 日本語のユーザー確認項目を追加してください。'
      ],
      agent_instruction: '要編集: 日本語のエージェント向け指示を追加してください。',
      checklist: [
        '要編集: 日本語チェックリストを追加してください。'
      ]
    }
  };
}

function buildReport(drafts, sourceLabel) {
  const lines = [
    '# Tripwire Card Drafts',
    '',
    `Source: ${sourceLabel}`,
    '',
    '## Summary',
    '',
    `- Draft cards generated: ${drafts.length}`
  ];

  for (const draft of drafts) {
    lines.push(
      '',
      `## Draft: ${draft.title}`,
      '',
      `- Draft ID: ${draft.draft_id}`,
      `- Source candidate: ${draft.source_candidate_id}`,
      `- Severity: ${draft.severity}`,
      `- Categories: ${draft.categories.join(', ')}`,
      `- First seen: ${draft.first_seen_at}`,
      `- Checked: ${draft.checked_at}`,
      `- Updated: ${draft.updated_at}`,
      `- Freshness label: ${draft.freshness_label}`,
      `- Source time precision: ${draft.sources[0]?.source_time_precision || 'unknown'}`,
      `- Needs editorial review: ${draft.needs_editorial_review ? 'true' : 'false'}`,
      '',
      'Editorial notes:',
      'This is a generated draft and must be reviewed before publication.'
    );
  }

  return `${lines.join('\n')}\n`;
}

const queue = parseQueue(inputPath);
const drafts = queue
  .filter((item) => item.review_decision === 'draft-card')
  .map(buildDraft);

fs.mkdirSync(path.dirname(outputJsonPath), { recursive: true });
fs.writeFileSync(outputJsonPath, `${JSON.stringify(drafts, null, 2)}\n`, 'utf8');

const report = buildReport(drafts, inputPath);
fs.mkdirSync(path.dirname(outputReportPath), { recursive: true });
fs.writeFileSync(outputReportPath, report, 'utf8');

console.log(`Wrote draft cards JSON: ${outputJsonPath}`);
console.log(`Wrote draft cards report: ${outputReportPath}`);
