import { readFileSync } from "node:fs";

const errors = [];

function addError(message) {
  errors.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    addError(`${path} could not be read as JSON`);
    return null;
  }
}

function isDateOnly(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isUtcDateTime(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value);
}

function isSupportedTimeValue(value) {
  return isDateOnly(value) || isUtcDateTime(value);
}

function validateTimeValue(value, path) {
  if (value === undefined || value === null || value === "") return;
  if (!isSupportedTimeValue(value)) {
    addError(`${path} must be YYYY-MM-DD or UTC ISO 8601`);
  }
}

function validateEnum(value, allowed, path) {
  if (value === undefined || value === null || value === "") return;
  if (!allowed.has(value)) {
    addError(`${path} has unsupported value: ${value}`);
  }
}

function validateThreatTimes() {
  const path = "data/threats.json";
  const cards = readJson(path);
  if (!Array.isArray(cards)) return;

  const precisionValues = new Set(["datetime", "date", "month", "unknown"]);
  const confidenceValues = new Set(["explicit", "inferred", "unknown"]);

  cards.forEach((card, index) => {
    const cardPath = `${path}[${index}]`;
    if (!card || typeof card !== "object" || Array.isArray(card)) return;

    validateTimeValue(card.first_seen_at, `${cardPath}.first_seen_at`);
    validateTimeValue(card.checked_at, `${cardPath}.checked_at`);
    validateTimeValue(card.updated_at, `${cardPath}.updated_at`);

    validateEnum(card.source_time_precision, precisionValues, `${cardPath}.source_time_precision`);
    validateEnum(card.source_timezone_confidence, confidenceValues, `${cardPath}.source_timezone_confidence`);

    if (Array.isArray(card.sources)) {
      card.sources.forEach((source, sourceIndex) => {
        const sourcePath = `${cardPath}.sources[${sourceIndex}]`;
        if (!source || typeof source !== "object" || Array.isArray(source)) return;

        validateTimeValue(source.published_at, `${sourcePath}.published_at`);
        validateTimeValue(source.checked_at, `${sourcePath}.checked_at`);
        validateTimeValue(source.source_published_at, `${sourcePath}.source_published_at`);
        validateTimeValue(source.source_published_date, `${sourcePath}.source_published_date`);
        validateEnum(source.source_time_precision, precisionValues, `${sourcePath}.source_time_precision`);
        validateEnum(source.source_timezone_confidence, confidenceValues, `${sourcePath}.source_timezone_confidence`);
      });
    }
  });
}

validateThreatTimes();

if (errors.length > 0) {
  console.error("Tripwire time policy validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Tripwire time policy validation passed.");
