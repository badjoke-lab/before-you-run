import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const DEFAULT_SOURCES = 'data/candidate-sources.json';
const today = new Date().toISOString().slice(0, 10);
const DEFAULT_QUEUE = `data/candidate-review-queue.generated.json`;
const DEFAULT_DIGEST = `reports/candidate-digest-${today}.md`;
const DEFAULT_RUN = `reports/candidate-collection-run-${today}.md`;

const sourcePath = process.argv[2] || DEFAULT_SOURCES;
const queuePath = process.argv[3] || DEFAULT_QUEUE;
const digestPath = process.argv[4] || DEFAULT_DIGEST;
const runPath = process.argv[5] || DEFAULT_RUN;

const STRONG_TERMS = [
  'signing key',
  'remote code execution',
  'vulnerability',
  'vulnerabilities',
  'cve',
  'advisory',
  'advisories',
  'malware',
  'malicious package',
  'malicious packages',
  'supply chain',
  'osv',
  'exposed',
  'scan for vulnerabilities',
  'credential',
  'credentials',
  'token',
  'tokens',
  'secret',
  'secrets',
  'permission',
  'permissions',
  'package',
  'dependency',
  'dependencies',
  'github actions',
  'workflow',
  'runner'
];

const SUPPORT_TERMS = [
  'ai',
  'agent',
  'repository',
  'github',
  'code',
  'open source',
  'developer',
  'npm',
  'pypi',
  'ruby',
  'rust',
  'node.js',
  'nodejs'
];

const NOISE_TERMS = [
  'bug bounty program',
  'secure code game',
  'game',
  'investing in the people',
  'application security coverage',
  'detections',
  'quality, shared responsibility',
  'for free',
  'announcing',
  'roadmap',
  'survey',
  'newsletter'
];

const NON_DEVELOPER_CISA_TERMS = [
  'ics advisory',
  'medical advisory',
  'industrial control systems',
  'siemens',
  'schneider electric',
  'advantech',
  'mitsubishi electric',
  'hikvision',
  'dahua',
  'cctv',
  'router',
  'camera'
];

const RELEASE_ONLY_TERMS = [
  'released',
  'release',
  'releases',
  'stable',
  'beta',
  'version',
  'minor',
  'patch'
];

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) fail(`Input file not found: ${filePath}`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    fail(`Invalid JSON: ${filePath}`);
  }
}

function stripTags(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? stripTags(match[1]) : '';
}

function getLink(block) {
  const direct = getTag(block, 'link');
  if (direct) return direct;
  const href = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return href ? href[1].trim() : '';
}

function parseFeed(text) {
  const itemBlocks = [...text.matchAll(/<item[\s\S]*?<\/item>/gi)].map((m) => m[0]);
  const entryBlocks = [...text.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((m) => m[0]);
  const blocks = itemBlocks.length > 0 ? itemBlocks : entryBlocks;

  return blocks.map((block) => {
    const title = getTag(block, 'title');
    const url = getLink(block);
    const summary = getTag(block, 'description') || getTag(block, 'summary') || getTag(block, 'content');
    const published = getTag(block, 'pubDate') || getTag(block, 'updated') || getTag(block, 'published');
    return { title, url, summary, published };
  }).filter((item) => item.title && item.url);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'candidate';
}

function findTerms(haystack, terms) {
  return terms.filter((term) => haystack.includes(term));
}

function hasAny(haystack, terms) {
  return terms.some((term) => haystack.includes(term));
}

function parseSourceTime(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) {
    return {
      published_at: 'unknown',
      source_published_original: 'unknown',
      source_time_precision: 'unknown',
      source_published_at: null,
      source_published_date: null,
      source_timezone: null,
      source_timezone_confidence: 'unknown'
    };
  }

  const dateMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  const rfcDate = Date.parse(raw);
  const hasTime = /\d{1,2}:\d{2}/.test(raw) || /T\d{2}:\d{2}/.test(raw);
  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:?\d{2}|\bUTC\b|\bGMT\b)/i.test(raw);

  if (hasTime && hasExplicitTimezone && Number.isFinite(rfcDate)) {
    const iso = new Date(rfcDate).toISOString().replace(/\.\d{3}Z$/, 'Z');
    return {
      published_at: iso,
      source_published_original: raw,
      source_time_precision: 'datetime',
      source_published_at: iso,
      source_published_date: iso.slice(0, 10),
      source_timezone: hasExplicitTimezone ? 'explicit-in-source' : null,
      source_timezone_confidence: 'explicit'
    };
  }

  if (dateMatch) {
    const date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    return {
      published_at: date,
      source_published_original: raw,
      source_time_precision: 'date',
      source_published_at: null,
      source_published_date: date,
      source_timezone: null,
      source_timezone_confidence: 'unknown'
    };
  }

  if (Number.isFinite(rfcDate) && !hasTime) {
    const date = new Date(rfcDate).toISOString().slice(0, 10);
    return {
      published_at: date,
      source_published_original: raw,
      source_time_precision: 'date',
      source_published_at: null,
      source_published_date: date,
      source_timezone: null,
      source_timezone_confidence: 'unknown'
    };
  }

  return {
    published_at: 'unknown',
    source_published_original: raw,
    source_time_precision: 'unknown',
    source_published_at: null,
    source_published_date: null,
    source_timezone: null,
    source_timezone_confidence: 'unknown'
  };
}

function scoreItem(item, source) {
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  const strong = findTerms(haystack, STRONG_TERMS);
  const support = findTerms(haystack, SUPPORT_TERMS);
  const noise = findTerms(haystack, NOISE_TERMS);
  const cisaNoise = source.id === 'cisa-advisories' && hasAny(haystack, NON_DEVELOPER_CISA_TERMS);
  const releaseOnly = ['ruby-news', 'rust-blog', 'nodejs-blog'].includes(source.id)
    && hasAny(haystack, RELEASE_ONLY_TERMS)
    && !hasAny(haystack, ['security', 'cve', 'vulnerability', 'advisory', 'malware', 'supply chain']);
  const score = (strong.length * 3) + support.length - (noise.length * 4) - (cisaNoise ? 8 : 0) - (releaseOnly ? 8 : 0);
  const matched = [...new Set([...strong, ...support])];
  return { score, matched, strong, support, noise, cisaNoise, releaseOnly };
}

function buildSummary(item) {
  const raw = item.summary || item.title;
  const summary = stripTags(raw).slice(0, 420);
  return summary || item.title;
}

function buildCandidate(item, source, index) {
  const scored = scoreItem(item, source);
  const sourceTime = parseSourceTime(item.published);
  const id = `${source.id}-${slugify(item.title)}-${index + 1}`.slice(0, 96);
  const hasStrongSignal = scored.strong.length > 0;
  const hasNoise = scored.noise.length > 0 || scored.cisaNoise || scored.releaseOnly;
  const shouldDraft = hasStrongSignal && !hasNoise && scored.score >= 4;
  const status = shouldDraft ? 'candidate' : hasStrongSignal ? 'maybe-relevant' : 'rejected';
  const priority = scored.score >= 8 ? 'high' : scored.score >= 4 ? 'medium' : 'low';
  const blockingIssues = [];

  if (!hasStrongSignal) {
    blockingIssues.push('No strong card signal matched.');
  }
  if (scored.noise.length > 0) {
    blockingIssues.push(`Likely non-card topic: ${scored.noise.join(', ')}.`);
  }
  if (scored.cisaNoise) {
    blockingIssues.push('CISA item appears focused on non-developer hardware/ICS context.');
  }
  if (scored.releaseOnly) {
    blockingIssues.push('Looks like a routine release post without a clear security/card angle.');
  }

  return {
    id,
    status,
    review_priority: priority,
    title: item.title,
    source_url: item.url,
    source_id: source.id,
    source_type: source.source_type || 'reference',
    language: source.language || 'en',
    collected_at: today,
    first_seen_at: today,
    checked_at: today,
    updated_at: today,
    freshness_label: 'recent',
    source_published_at: sourceTime.source_published_at,
    source_published_date: sourceTime.source_published_date,
    source_published_original: sourceTime.source_published_original,
    source_time_precision: sourceTime.source_time_precision,
    source_timezone: sourceTime.source_timezone,
    source_timezone_confidence: sourceTime.source_timezone_confidence,
    published_at: sourceTime.published_at,
    candidate_categories: Array.isArray(source.default_categories) && source.default_categories.length > 0 ? source.default_categories : ['needs-review'],
    matched_keywords: scored.matched,
    confidence: source.source_type === 'primary' ? 'high' : 'medium',
    freshness: 'new',
    severity_hint: scored.score >= 8 ? 'high' : scored.score >= 4 ? 'medium' : 'watch',
    summary: buildSummary(item),
    why_relevant: scored.matched.length > 0
      ? `Matched review terms: ${scored.matched.join(', ')}.`
      : 'Collected from a configured source and requires manual relevance review.',
    review_questions: [
      'Is this useful as beginner-safe guidance?',
      'Is the source strong enough?',
      'Can this be rewritten without operational detail?'
    ],
    safe_card_angle: item.title,
    blocking_issues: blockingIssues,
    review_decision: shouldDraft ? 'draft-card' : 'undecided',
    review_notes: 'Generated by candidate collection. Requires human review before publication.',
    label_notes: {
      confidence: source.trust_note || 'Generated from configured source.',
      freshness: `Collected on ${today}.`,
      severity_hint: `Term score: ${scored.score}; strong terms: ${scored.strong.length}; support terms: ${scored.support.length}; noise terms: ${scored.noise.length}.`
    }
  };
}

function buildDigest(candidates, sources, errors) {
  const draftCards = candidates.filter((candidate) => candidate.review_decision === 'draft-card');
  const lines = [
    '# Tripwire Candidate Digest',
    '',
    `Date: ${today}  `,
    `Sources configured: ${sources.length}  `,
    `Candidates generated: ${candidates.length}  `,
    `Draft-card candidates: ${draftCards.length}  `,
    '',
    '## Operator result',
    '',
    '- Network collection: true',
    '- AI generation: false',
    '- Automatic publication: false',
    '- data/threats.json modified: false',
    '',
    '## Review instruction',
    '',
    'Paste this digest or data/candidate-review-queue.generated.json into ChatGPT. Ask for public card drafts, publish/reject review, and final JSON patches for selected items only.',
    '',
    '## Candidates'
  ];

  for (const c of candidates) {
    lines.push(
      '',
      `### ${c.title}`,
      '',
      `- ID: ${c.id}`,
      `- Status: ${c.status}`,
      `- Review priority: ${c.review_priority}`,
      `- Review decision: ${c.review_decision}`,
      `- Source: ${c.source_id}`,
      `- URL: ${c.source_url}`,
      `- Published: ${c.published_at}`,
      `- Source time precision: ${c.source_time_precision}`,
      `- Confidence: ${c.confidence}`,
      `- Freshness: ${c.freshness}`,
      `- Freshness label: ${c.freshness_label}`,
      `- Severity hint: ${c.severity_hint}`,
      `- Matched keywords: ${c.matched_keywords.length > 0 ? c.matched_keywords.join(', ') : 'none'}`,
      `- Blocking issues: ${c.blocking_issues.length > 0 ? c.blocking_issues.join(' | ') : 'none'}`,
      '',
      'Why relevant:',
      c.why_relevant,
      '',
      'Public-safe summary:',
      c.summary
    );
  }

  if (errors.length > 0) {
    lines.push('', '## Source errors');
    for (const e of errors) lines.push('', `- ${e.source_id}: ${e.message}`);
  }

  return `${lines.join('\n')}\n`;
}

async function collect() {
  const sources = readJson(sourcePath);
  if (!Array.isArray(sources) || sources.length === 0) fail('Sources JSON must be a non-empty array.');

  const candidates = [];
  const errors = [];

  for (const source of sources) {
    if (!source.id || !source.url) {
      errors.push({ source_id: source.id || 'unknown', message: 'Missing id or url.' });
      continue;
    }

    try {
      const response = await fetch(source.url, {
        headers: { 'user-agent': 'Tripwire candidate collector' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const items = parseFeed(text).slice(0, source.limit || 12);
      items.forEach((item, index) => candidates.push(buildCandidate(item, source, index)));
      await delay(250);
    } catch (error) {
      errors.push({ source_id: source.id, message: error.message || String(error) });
    }
  }

  const seen = new Set();
  const unique = candidates.filter((candidate) => {
    const key = candidate.source_url || candidate.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  fs.mkdirSync(path.dirname(queuePath), { recursive: true });
  fs.writeFileSync(queuePath, `${JSON.stringify(unique, null, 2)}\n`, 'utf8');

  fs.mkdirSync(path.dirname(digestPath), { recursive: true });
  fs.writeFileSync(digestPath, buildDigest(unique, sources, errors), 'utf8');

  fs.mkdirSync(path.dirname(runPath), { recursive: true });
  fs.writeFileSync(runPath, `# Candidate collection run\n\nDate: ${today}\n\n- Sources: ${sources.length}\n- Candidates: ${unique.length}\n- Errors: ${errors.length}\n- Queue: ${queuePath}\n- Digest: ${digestPath}\n\n`, 'utf8');

  console.log(`Wrote candidate queue: ${queuePath}`);
  console.log(`Wrote candidate digest: ${digestPath}`);
  console.log(`Wrote collection run report: ${runPath}`);
}

collect().catch((error) => fail(error.message || String(error)));
