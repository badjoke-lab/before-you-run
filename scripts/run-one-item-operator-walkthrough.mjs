import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const COMMANDS = [
  {
    label: "intake walkthrough report",
    args: [
      "scripts/run-intake-skeleton.mjs",
      "data/operator-walkthrough.manual-intake.example.json",
      "data/operator-walkthrough.intake-runs.local.json",
      "reports/operator-walkthrough.intake-run.local.md"
    ]
  },
  {
    label: "moderation walkthrough report",
    args: [
      "scripts/build-moderation-report.mjs",
      "data/operator-walkthrough.manual-intake.example.json",
      "reports/operator-walkthrough.candidate-moderation.local.md"
    ]
  },
  {
    label: "freshness/severity walkthrough report",
    args: [
      "scripts/build-freshness-severity-report.mjs",
      "data/operator-walkthrough.manual-intake.example.json",
      "reports/operator-walkthrough.freshness-severity.local.md"
    ]
  },
  {
    label: "duplicate walkthrough report",
    args: [
      "scripts/build-duplicate-report.mjs",
      "data/operator-walkthrough.manual-intake.example.json",
      "reports/operator-walkthrough.duplicates.local.md"
    ]
  },
  {
    label: "source credibility walkthrough report",
    args: [
      "scripts/build-source-credibility-report.mjs",
      "data/operator-walkthrough.manual-intake.example.json",
      "reports/operator-walkthrough.source-credibility.local.md"
    ]
  },
  {
    label: "social signal walkthrough report",
    args: [
      "scripts/build-social-signal-report.mjs",
      "data/operator-walkthrough.social-signals.example.json",
      "reports/operator-walkthrough.social-signals.local.md"
    ]
  },
  {
    label: "evidence walkthrough report",
    args: [
      "scripts/build-evidence-report.mjs",
      "data/operator-walkthrough.evidence-notes.example.json",
      "reports/operator-walkthrough.evidence-notes.local.md"
    ]
  },
  {
    label: "signal verification walkthrough report",
    args: [
      "scripts/build-signal-verification-report.mjs",
      "data/operator-walkthrough.signal-verification-queue.example.json",
      "reports/operator-walkthrough.signal-verification-queue.local.md"
    ]
  },
  {
    label: "publish review walkthrough report",
    args: [
      "scripts/build-publish-review-report.mjs",
      "data/operator-walkthrough.publish-review-checklist.example.json",
      "reports/operator-walkthrough.publish-review.local.md"
    ]
  }
];

function writeSummaryReport() {
  const outputPath = "reports/operator-walkthrough.example.md";
  const lines = [
    "# Tripwire One-item Local Operation Walkthrough Report",
    "",
    "Network access: false  ",
    "AI generation: false  ",
    "Automatic publication: false  ",
    "Public card data modified: false",
    "",
    "## Walkthrough item",
    "",
    "- Topic: Review unknown repositories before running scripts",
    "- Category: unknown-repository",
    "- Final walkthrough decision: hold-for-stronger-source",
    "",
    "## Commands run",
    "",
    ...COMMANDS.map((command) => `- ${command.label}`),
    "",
    "## Result",
    "",
    "The example item is intentionally held. It should not be moved into public card data until stronger source and context checks are complete.",
    "",
    "## Operator lesson",
    "",
    "A local item can be useful, public-safe, and still not ready to publish."
  ];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${outputPath}`);
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

writeSummaryReport();
