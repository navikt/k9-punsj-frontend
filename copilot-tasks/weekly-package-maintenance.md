# Copilot task

## Task

- Title: Weekly package maintenance
- Branch: `package-update`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Update eligible patch and minor dependencies in the root workspace and `server`.
- Keep majors, new dependencies, broad refactors, and automatic commits or pushes out of scope.

## Rules

- Read `.yarnrc.yml`, both manifests, `resolutions`, and the latest dependency changelog entry first. Keep `npmMinimalAgeGate: 7d` unchanged.
- Run `yarn npm audit --all --json`. If it fails because of an external service or authentication, note it once and continue.
- Record the UTC cutoff, `now - 7 days`, before changing packages.
- Run `npm outdated --json` once in root and once in `server`. Make one decision per package before installing anything: patch, minor, or defer.
- If an eligible minor exists, update it in the minor pass only. Do not install its patch first. Defer major-only candidates without further investigation.
- Check publish dates only for packages that can change. Select the newest stable version outside the cutoff.
- Use one explicit `yarn up` command per pass. No globs, `@latest`, broad upgrades, or tarball inspection.
- Before changing a resolution, inspect its dependants with `yarn why`. Keep coupled dependencies within declared compatible ranges and update the smallest compatible set.
- Update the existing top changelog entry with one short line: eligible patch and minor updates. Add a second line only for a meaningful compatibility issue, blocked check, or deferred security follow up.
- Stop after the patch pass for user approval. Do not commit or push unless the user asks.

## Validation

- Ask the user whether to run checks here or locally before running:
    - `yarn install --immutable`
    - `yarn explain peer-requirements`
    - `yarn lint`
    - `yarn tsc --noEmit`
    - `yarn test --maxWorkers=2`
    - `yarn build`
- `yarn test:e2e` requires separate explicit approval.

## Prompt for Copilot

Follow this task file. First update `Plan`. Use the rules above and keep commands to the minimum needed to select and apply the updates. Do not rediscover candidates between patch and minor passes. Keep `Progress notes` and `Outcome` short. Do not commit or push unless the user explicitly asks.

## Plan

- [ ] Read context, audit, and record the cutoff.
- [ ] Discover candidates and select one action per package.
- [ ] Run patch pass and request approval for minor pass.
- [ ] Run approved minor pass, validate, and summarize follow ups.

## Progress notes

- Record selected packages, exceptions, and skipped validation only.

## Outcome

- Record changed files, validation, and remaining follow ups only.
