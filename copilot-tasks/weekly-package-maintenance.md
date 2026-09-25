# Copilot task

## Task

- Title: Weekly package maintenance
- Branch: the current feature branch; do not work on `master`
- Suggested agent: default coding agent
- Prompt language: English

## Goal

- Update direct dependencies in the root workspace and `server` to the newest eligible stable patch or minor version in their current major line.
- Complete selection, updates, and validation in one pass. Leave major upgrades and unrelated changes for separate tasks.

## Scope

- Change `package.json`, `server/package.json`, `yarn.lock`, and a dated entry near the top of `docs/CHANGELOG.md`. Change source, tests, or config only if an eligible update requires it. Update this reusable task file only in `Plan`, `Progress notes`, and `Outcome`; do not create another task file.
- Keep `.yarnrc.yml`, new dependencies, broad refactors, and automatic commits or pushes out of scope.

## Rules

- Read `.yarnrc.yml`, both manifests, the existing `resolutions`, and the latest dependency changelog entry. Work on the feature branch, not `master`.
- Use `npm outdated --json` once at the repository root for read-only candidate discovery. Confirm that it covers `server`; inspect `server` separately only if it does not. Its `latest` and `wanted` values are not the final version choice.
- For each outdated direct dependency, check registry version and publish-date metadata once and reuse the result. Query independent packages concurrently where possible. Select the highest stable version newer than the current version within the current major that was published before the UTC cutoff (`now - 7 days`). An eligible minor wins over patches in the previous minor line; if no minor is eligible, select the highest eligible patch. If the registry's latest is a major, still check for eligible releases in the current major. Do not investigate major migration in this run.
- Apply the cutoff only to packages subject to Yarn's `npmMinimalAgeGate: 7d`. Packages matching `npmPreapprovedPackages` in `.yarnrc.yml` (currently `@navikt/*`) are exempt; select their newest stable patch or minor within the current major. Never bypass the gate for other packages.
- Make one compact target list before editing. Update the chosen packages together with explicit `yarn up package@version` arguments; do not use globs, `@latest`, broad upgrades, or a patch pass followed by a minor pass. If Yarn rejects a target, investigate that package once and adjust or defer it; do not retry the same blocked version.
- Review `resolutions` once after the direct updates. Use `yarn why` only for an override you propose to change or remove. Keep related packages within compatible declared ranges; leave unrelated overrides alone.
- Add one short, dated dependency entry near the top of `docs/CHANGELOG.md`. Do not append package updates to an entry about a different change.

## Validation

- After the updates, run `yarn install --immutable`, `yarn lint`, `yarn tsc --noEmit`, `yarn test --maxWorkers=2`, and `yarn build` once. Inspect peer requirements only if Yarn reports a relevant peer warning.
- Run `yarn npm audit --all --json` once after updating. Report actionable findings without expanding this task into a security remediation. If the audit fails because of registry access, note it once and continue.
- Ask before `yarn test:e2e`. Report any skipped or failed check and its reason. Review the diff for every changed file. Do not commit or push.

## Prompt for Copilot

Follow `copilot-tasks/weekly-package-maintenance.md`. Update `Plan` first, then complete the weekly package update in one pass using the version-selection and validation rules above. Reuse discovery results instead of repeating registry queries. Keep `Progress notes` and `Outcome` short and factual. Do not commit or push.

## Plan

- [x] Read the configuration and manifests.
- [x] Discover candidates once and select one target per package.
- [x] Update eligible packages together, review affected resolutions, and add one changelog entry.
- [x] Validate once, review changed-file diffs, and summarize results.

## Progress notes

- Cutoff: 2026-09-18T08:31:11Z. Selected eligible targets: @sentry/cli 3.8.0, @sentry/react 10.75.0, @tanstack/react-query 5.103.1, @testing-library/dom 10.4.2, @types/node 26.6.1, @types/react 19.3.0, @types/react-dom 19.3.0, autoprefixer 10.6.1, cypress 15.21.1, lint-staged 17.5.1, morgan 1.12.1, prettier 3.9.8, react 19.3.0, react-dom 19.3.0, react-hook-form 7.88.0, react-intl 10.2.2, react-router 8.4.0, and webpack 5.111.0.
- Deferred major-only, cooldown-blocked, and no-target packages; npm outdated covered server workspace entries. Deferred react-router 8.4.0 after Jest ESM failures and retained 8.3.1.
- Yarn still reports the existing eslint 9.39.5 versus @eslint/js 10.0.1 peer mismatch; no resolution changed.
- Audit reports eslint 9.39.5 as deprecated (moderate); no vulnerability remediation was included.

## Outcome

- Changed root/server manifests, yarn.lock, docs/CHANGELOG.md, and this task file. Immutable install, lint, TypeScript, 476 unit tests, and production build pass. Audit reports only the existing eslint deprecation; E2E was not run because it requires approval.
