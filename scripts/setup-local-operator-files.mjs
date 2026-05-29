import fs from "node:fs";
import path from "node:path";

const FILES = [
  ["data/manual-intake.local.template.json", "data/manual-intake.local.json"],
  ["data/social-signals.local.template.json", "data/social-signals.local.json"],
  ["data/evidence-notes.local.template.json", "data/evidence-notes.local.json"],
  ["data/signal-verification-queue.local.template.json", "data/signal-verification-queue.local.json"],
  ["data/publish-review-checklist.local.template.json", "data/publish-review-checklist.local.json"]
];

for (const [templatePath, localPath] of FILES) {
  if (!fs.existsSync(templatePath)) {
    console.error(`Missing template: ${templatePath}`);
    process.exit(1);
  }

  if (fs.existsSync(localPath)) {
    console.log(`Skipped existing local file: ${localPath}`);
    continue;
  }

  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.copyFileSync(templatePath, localPath);
  console.log(`Created local file: ${localPath}`);
}
