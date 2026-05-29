import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REQUIRED_LOCAL_FILES = [
  "data/manual-intake.local.json",
  "data/social-signals.local.json",
  "data/evidence-notes.local.json",
  "data/signal-verification-queue.local.json",
  "data/publish-review-checklist.local.json"
];

const COMMANDS = [
  {
    label: "intake local report",
    args: ["scripts/run-intake-skeleton.mjs", "data/manual-intake.local.json", "data/intake-runs.local.json", "reports/intake-run.local.md"]
  },
  {
    label: "moderation local report",
    args: ["scripts/build-moderation-report.mjs", "data/manual-intake.local.json", "reports/candidate-moderation.local.md"]
  },
  {
    label: "freshness/severity local report",
    args: ["scripts/build-freshness-severity-report.mjs", "data/manual-intake.local.json", "reports/freshness-severity.local.md"]
  },
  {
    label: "duplicate local report",
    args: ["scripts/build-duplicate-report.mjs", "data/manual-intake.local.json", "reports/duplicates.local.md"]
  },
  {
    label: "source credibility local report",
    args: ["scripts/build-source-credibility-report.mjs", "data/manual-intake.local.json", "reports/source-credibility.local.md"]
  },
  {
    label: "social signal local report",
    args: ["scripts/build-social-signal-report.mjs", "data/social-signals.local.json", "reports/social-signals.local.md"]
  },
  {
    label: "evidence local report",
    args: ["scripts/build-evidence-report.mjs", "data/evidence-notes.local.json", "reports/evidence-notes.local.md"]
  },
  {
    label: "signal verification local report",
    args: ["scripts/build-signal-verification-report.mjs", "data/signal-verification-queue.local.json", "reports/signal-verification-queue.local.md"]
  },
  {
    label: "publish review local report",
    args: ["scripts/build-publish-review-report.mjs", "data/publish-review-checklist.local.json", "reports/publish-review.local.md"]
  }
];

function writeWorkflowReport(outputPath) {
  const lines = [
    "# Tripwire Local Operator Workflow Report",
    "",
    "Network access: false  ",
    "AI generation: false  ",
    "Automatic publication: false  ",
    "data/threats.json modified: false",
    "",
    "## Local files",
    "",
    ...REQUIRED_LOCAL_FILES.map((filePath) => `- ${filePath}: ${fs.existsSync(filePath) ? "present" : "missing"}`),
    "",
    "## Commands run",
    "",
    ...COMMANDS.map((command) => `- ${command.label}`),
    "",
    "## Next manual step",
    "",
    "Review generated local reports. Do not copy anything into `data/threats.json` unless source, safety, duplicate, credibility, freshness, and publish review checks are acceptable."
  ];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
}

const missingFiles = REQUIRED_LOCAL_FILES.filter((filePath) => !fs.existsSync(filePath));

if (missingFiles.length > 0) {
  console.error("Missing required local operator files:");
  for (const filePath of missingFiles) {
    console.error(`- ${filePath}`);
  }
  console.error("");
  console.error("Run `npm run operator:setup` before running the local operator workflow.");
  process.exit(1);
}

for (const command of COMMANDS) {
  console.log(`Running ${command.label}...`);
  const result = spawnSync(process.execPath, command.args, { stdio: "inherit" });

  if (result.error) {
    console.error(`Failed to run ${command.label}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`${command.label} exited with status ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

writeWorkflowReport("reports/operator-workflow.local.md");
console.log("Wrote local operator workflow report: reports/operator-workflow.local.md");
