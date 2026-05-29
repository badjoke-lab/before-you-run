import { readFileSync } from "node:fs";

const errors = [];
let totalCardCount = 0;

function addError(message) {
  errors.push(message);
}

function readJson(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    addError(`${path} is missing`);
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    addError(`${path} is not valid JSON`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function validateAiOutput(value, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    addError(`${path} is required`);
    return;
  }

  if (!isNonEmptyString(value.risk_summary)) addError(`${path}.risk_summary is required`);
  if (!isNonEmptyArray(value.do_not)) addError(`${path}.do_not is required`);
  if (!isNonEmptyArray(value.check_first)) addError(`${path}.check_first is required`);
  if (!isNonEmptyArray(value.safe_actions)) addError(`${path}.safe_actions is required`);
  if (!isNonEmptyArray(value.ask_user_before)) addError(`${path}.ask_user_before is required`);
  if (!isNonEmptyString(value.agent_instruction)) addError(`${path}.agent_instruction is required`);
  if (!isNonEmptyArray(value.checklist)) addError(`${path}.checklist is required`);
}

function validateThreatArray(path, options = {}) {
  const { validateCardShape = true } = options;
  const data = readJson(path);
  if (data === null) return;

  if (!Array.isArray(data)) {
    addError(`${path} must be a top-level array`);
    return;
  }

  totalCardCount += data.length;

  if (!validateCardShape) return;

  const ids = new Set();
  const allowedSeverity = new Set(["high", "medium", "watch"]);
  const allowedSourceTypes = new Set(["primary", "reference", "signal", "blog", "official-advisory", "official-project-blog", "reference"]);

  data.forEach((card, i) => {
    const p = `${path}[${i}]`;
    if (!card || typeof card !== "object" || Array.isArray(card)) {
      addError(`${p} must be an object`);
      return;
    }

    if (!isNonEmptyString(card.id)) {
      addError(`${p}.id is required`);
    } else if (ids.has(card.id)) {
      addError(`${path} duplicate id: ${card.id}`);
    } else {
      ids.add(card.id);
    }

    if (!isNonEmptyString(card.title)) addError(`${p}.title is required`);
    if (!isNonEmptyString(card.title_ja)) addError(`${p}.title_ja is required`);
    if (!allowedSeverity.has(card.severity)) addError(`${p}.severity must be one of: high, medium, watch`);
    if (!isNonEmptyArray(card.categories)) addError(`${p}.categories is required`);
    if (!isNonEmptyArray(card.audience)) addError(`${p}.audience is required`);
    if (!isNonEmptyString(card.summary)) addError(`${p}.summary is required`);
    if (!isNonEmptyString(card.summary_ja)) addError(`${p}.summary_ja is required`);
    if (!isNonEmptyArray(card.dangerous_actions)) addError(`${p}.dangerous_actions is required`);
    if (!isNonEmptyArray(card.dangerous_actions_ja)) addError(`${p}.dangerous_actions_ja is required`);
    if (!isNonEmptyArray(card.avoid_now)) addError(`${p}.avoid_now is required`);
    if (!isNonEmptyArray(card.avoid_now_ja)) addError(`${p}.avoid_now_ja is required`);
    if (!isNonEmptyString(card.updated_at)) addError(`${p}.updated_at is required`);

    if (!isNonEmptyArray(card.sources)) {
      addError(`${p}.sources is required`);
    } else {
      card.sources.forEach((source, j) => {
        const sp = `${p}.sources[${j}]`;
        if (!source || typeof source !== "object" || Array.isArray(source)) {
          addError(`${sp} must be an object`);
          return;
        }
        if (!isNonEmptyString(source.title)) addError(`${sp}.title is required`);
        if (!isNonEmptyString(source.url)) addError(`${sp}.url is required`);
        if (!isNonEmptyString(source.publisher)) addError(`${sp}.publisher is required`);
        if (!allowedSourceTypes.has(source.source_type)) {
          addError(`${sp}.source_type must be one of: primary, reference, signal, blog, official-advisory, official-project-blog`);
        }
      });
    }

    validateAiOutput(card.ai_output, `${p}.ai_output`);
    if (card.ai_output_ja !== undefined) {
      validateAiOutput(card.ai_output_ja, `${p}.ai_output_ja`);
    }
  });
}

function validateThreats() {
  validateThreatArray("data/threats.json");
  validateThreatArray("data/threats-approved.json");

  if (totalCardCount < 1) {
    addError("data/threats.json and data/threats-approved.json must contain at least one card in total");
  }
}

function validateCategories() {
  const path = "data/categories.json";
  const data = readJson(path);
  if (data === null) return;

  if (!Array.isArray(data)) {
    addError(`${path} must be a top-level array`);
    return;
  }

  const ids = new Set();
  data.forEach((item, i) => {
    const p = `${path}[${i}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      addError(`${p} must be an object`);
      return;
    }

    if (!isNonEmptyString(item.id)) {
      addError(`${p}.id is required`);
    } else if (ids.has(item.id)) {
      addError(`${path} duplicate id: ${item.id}`);
    } else {
      ids.add(item.id);
    }

    if (!isNonEmptyString(item.label)) addError(`${p}.label is required`);
    if (!isNonEmptyString(item.label_ja)) addError(`${p}.label_ja is required`);
    if (!isNonEmptyString(item.description)) addError(`${p}.description is required`);
    if (!isNonEmptyString(item.description_ja)) addError(`${p}.description_ja is required`);
  });
}

function validateSourceTiers() {
  const path = "data/source-tiers.json";
  const data = readJson(path);
  if (data === null) return;

  if (!Array.isArray(data)) {
    addError(`${path} must be a top-level array`);
    return;
  }

  const requiredIds = new Set(["primary", "reference", "signal"]);
  data.forEach((item, i) => {
    const p = `${path}[${i}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      addError(`${p} must be an object`);
      return;
    }

    if (!isNonEmptyString(item.id)) {
      addError(`${p}.id is required`);
    } else {
      requiredIds.delete(item.id);
    }
    if (!isNonEmptyString(item.label)) addError(`${p}.label is required`);
    if (!isNonEmptyString(item.label_ja)) addError(`${p}.label_ja is required`);
    if (!isNonEmptyString(item.description)) addError(`${p}.description is required`);
  });

  for (const id of requiredIds) {
    addError(`${path} missing required id: ${id}`);
  }
}

function validateSignalLabels() {
  const path = "data/signal-labels.json";
  const data = readJson(path);
  if (data === null) return;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    addError(`${path} must be a top-level object`);
    return;
  }

  const groups = {
    confidence: new Set(["low", "medium", "high"]),
    freshness: new Set(["new", "recent", "stale", "unknown"]),
    severity_hint: new Set(["high", "medium", "watch", "unknown"])
  };

  for (const [group, requiredIds] of Object.entries(groups)) {
    const value = data[group];
    if (!Array.isArray(value)) {
      addError(`${path}.${group} must be an array`);
      continue;
    }

    value.forEach((item, i) => {
      const p = `${path}.${group}[${i}]`;
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        addError(`${p} must be an object`);
        return;
      }

      if (!isNonEmptyString(item.id)) {
        addError(`${p}.id is required`);
      } else {
        requiredIds.delete(item.id);
      }
      if (!isNonEmptyString(item.label)) addError(`${p}.label is required`);
      if (!isNonEmptyString(item.label_ja)) addError(`${p}.label_ja is required`);
      if (!isNonEmptyString(item.description)) addError(`${p}.description is required`);
    });

    for (const id of requiredIds) {
      addError(`${path}.${group} missing required id: ${id}`);
    }
  }
}

validateThreats();
validateCategories();
validateSourceTiers();
validateSignalLabels();

if (errors.length > 0) {
  console.error("Tripwire data validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Tripwire data validation passed.");
