# Copilot task

## Task

- Title: Weekly package maintenance
- Branch: `package-update`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Run one controlled weekly dependency pass for the root workspace and `server`.
- Take eligible patch and minor updates only. Leave majors for focused follow ups.

## Scope

- Allowed files:
    - `package.json`
    - `server/package.json`
    - `yarn.lock`
    - `docs/CHANGELOG.md`
    - directly affected source, test, or config files only when required by an allowed update
    - `src/mocks/mockServiceWorker.js` only when an `msw` update regenerates it
    - this task file for its working sections
- Out of scope:
    - new dependencies, majors, broad refactors, automatic commits or pushes
    - weakening `.yarnrc.yml` `npmMinimalAgeGate: 7d`
    - broad `yarn up` commands, globs, `@latest`, or tarball inspection

## Method

- Read `.yarnrc.yml`, both manifests, the current `resolutions`, and the latest dependency entry in `docs/CHANGELOG.md` first.
- Run `yarn npm audit --all --json`. If registry authentication or another external service blocks it, record the limitation and continue without repeated retries.
- If GitHub MCP is available, check open Dependabot alerts before package changes and again after each pass.
- Compute and record the UTC cutoff, `now - 7 days`, before any package update. Prefer the shortest built in Yarn or npm command. Use a small Node, shell, or Python command only when the package tools cannot provide the needed date or metadata directly.
- Discover candidates with `npm outdated --json` and verify each selected version with `npm view <package> time --json`.
- Record a compact matrix for each changed package: current version, eligible target, skipped newer version, and reason. Do not enumerate unchanged packages.
- Choose the highest eligible non major version. Prefer an eligible minor over a patch. If the newest minor is inside the cooldown, choose the nearest eligible older minor.
- Use explicit package lists in every `yarn up` command. Verify root and `server` manifest diffs after each command.
- Review each `resolution` after each pass. Keep only overrides with a concrete current transitive reason.
- Treat closely coupled packages as one compatibility group. Before changing a resolution, inspect its dependants with `yarn why`, confirm that their declared ranges support the target, and update the smallest compatible set. Do not force a newer transitive version merely because it is available.
- Update the existing top changelog entry for the same dependency run. Keep it factual and short.
- Stop after the patch pass and ask the user before continuing to minor updates. Do not commit unless the user asks.

## Validation

- Run the following only after asking the user whether to run checks here or locally:
    - `yarn install --immutable`
    - `yarn npm audit --all --json`
    - `yarn explain peer-requirements`
    - `yarn lint`
    - `yarn tsc --noEmit`
    - `yarn test --maxWorkers=2`
    - `yarn build`
- `yarn test:e2e` needs separate explicit approval when updates touch runtime critical paths such as React, routing, forms, Aksel, auth, proxy, webpack, or dev server.
- Record skipped checks and relevant failures in `Outcome`. Do not broaden scope to fix unrelated pre existing failures.

## Prompt for Copilot

Follow this task file. First update `Plan`. Run the audit directly, record a single external authentication or service limitation if it fails, and continue without repeated retries. Respect the 7 day cooldown and use publish timestamps for every selected version. Prefer Yarn and npm commands, but use a small Node, shell, or Python command when it is the simpler reliable way to obtain information the package tools do not expose. Work in an explicit patch pass first, stop for user approval, then run an explicit minor pass. Do not use broad upgrades, major versions, or tarball inspection. Review resolutions after each pass and keep coupled dependencies within their declared compatible ranges. Keep `Progress notes` and `Outcome` short, current, and free of stale data. Do not commit or push unless the user explicitly asks.

## Plan

- [ ] Read manifests, Yarn configuration, resolutions, and changelog context.
- [ ] Verify registry authentication and record the cutoff.
- [ ] Discover candidates and record selected targets.
- [ ] Run the patch pass and review resolutions.
- [ ] Update changelog and request approval for the minor pass.
- [ ] Run the approved minor pass and review resolutions.
- [ ] Run approved validation and summarize remaining majors or risks.

## Progress notes

- Record the cutoff, selected packages, resolution decisions, Dependabot status, and validation limitations here.

## Outcome

- Record changed files, selected and skipped versions, validation results, alert status, and remaining follow ups here.
