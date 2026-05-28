# Tripwire Category Safety Packs Report

Input: data/category-safety-packs.example.json  
Network access: false  
AI generation: false  
Automatic publication: false

## Summary

- Total safety packs: 1
- draft: 1

## Category groups

- malicious-packages: 1

## Pack status groups

### draft

#### Malicious package safety pack

- ID: pack-malicious-packages-basic
- Category ID: malicious-packages
- Language: en
- Audience: beginner-developers
- Updated at: 2026-05-28

Purpose:
Help AI assistants give safe, defensive guidance about package install risk.

Allowed guidance:
- Explain package install risks in beginner-safe language.
- Suggest reviewing package metadata, maintainer signals, install scripts, and permissions.
- Recommend using isolated test environments for unknown dependencies.
- Tell users to avoid pasting secrets into terminals, prompts, or repositories.

Disallowed guidance:
- Do not provide exploit steps.
- Do not provide credential theft methods.
- Do not provide bypass instructions.
- Do not provide weaponized payloads.
- Do not make unverified claims about real packages.

Safe response rules:
- Keep advice defensive and public-safe.
- Use uncertainty labels when the source is incomplete.
- Recommend stronger source checks before publishing claims.
- Prefer safer alternatives over operational details.

Review requirements:
- Needs source review: true
- Needs safety review: true
- Needs translation review: false
- Needs AI output review: true

AI prompt snippet:
When discussing package install risk, provide beginner-safe defensive advice only. Do not include exploit steps, credential theft methods, bypass instructions, or weaponized payloads.
