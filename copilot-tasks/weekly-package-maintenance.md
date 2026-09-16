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
    - broad `yarn up` commands, globs, `@latest`, Python scripts, custom registry scripts, or tarball inspection

## Method

- Read `.yarnrc.yml`, both manifests, the current `resolutions`, and the latest dependency entry in `docs/CHANGELOG.md` first.
- Run `yarn npm whoami --scope navikt` before audit. If it fails, record the limitation once and do not retry audit commands until the user refreshes the token.
- If GitHub MCP is available, check open Dependabot alerts before package changes and again after each pass.
- Compute and record the UTC cutoff, `now - 7 days`, before any package update. Use only `node -e "const cutoff=new Date(Date.now()-7*24*60*60*1000); console.log(cutoff.toISOString())"` as an ad hoc script.
- Discover candidates with `npm outdated --json` and verify each selected version with `npm view <package> time --json`.
- Record a compact matrix for each changed package: current version, eligible target, skipped newer version, and reason. Do not enumerate unchanged packages.
- Choose the highest eligible non major version. Prefer an eligible minor over a patch. If the newest minor is inside the cooldown, choose the nearest eligible older minor.
- Use explicit package lists in every `yarn up` command. Verify root and `server` manifest diffs after each command.
- Review each `resolution` after each pass. Keep only overrides with a concrete current transitive reason.
- Treat OpenTelemetry as a synchronized runtime graph. Faro `2.11.0` uses instrumentation `^0.221.0`, which uses OpenTelemetry `2.10.0`. Do not raise `@opentelemetry/core` alone or move this graph to `2.11.0` until Faro supports instrumentation `0.222.x`. When a single version is required, align `core`, `resources`, `sdk-trace`, `sdk-trace-base`, and `sdk-trace-web`, then verify with `yarn why`.
- Update the existing top changelog entry for the same dependency run. Keep it factual and short.
- Stop after the patch pass and ask the user before continuing to minor updates. Do not commit unless the user asks.

## Validation

- Run the following only after asking the user whether to run checks here or locally:
    - `yarn install --immutable`
    - `yarn npm audit --all --json` when registry authentication works
    - `yarn explain peer-requirements`
    - `yarn lint`
    - `yarn tsc --noEmit`
    - `yarn test --maxWorkers=2`
    - `yarn build`
- `yarn test:e2e` needs separate explicit approval when updates touch runtime critical paths such as React, routing, forms, Aksel, auth, proxy, webpack, or dev server.
- Record skipped checks and relevant failures in `Outcome`. Do not broaden scope to fix unrelated pre existing failures.

## Prompt for Copilot

Follow this task file. First update `Plan`. Use Yarn and npm commands only, except for the stated Node cutoff command. Verify GitHub Packages authentication with `yarn npm whoami --scope navikt` before audit, record one authentication limitation if it fails, and continue without repeated audit attempts. Respect the 7 day cooldown and use publish timestamps for every selected version. Work in an explicit patch pass first, stop for user approval, then run an explicit minor pass. Do not use broad upgrades, major versions, custom scripts, Python, or tarball inspection. Review resolutions after each pass, including the OpenTelemetry and Faro compatibility rule. Keep `Progress notes` and `Outcome` short, current, and free of stale data. Do not commit or push unless the user explicitly asks.

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
