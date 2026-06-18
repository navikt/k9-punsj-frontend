# Copilot task

## Task

- Title: Weekly package maintenance with 7 day cooldown precheck
- Branch: `chore/weekly-package-maintenance`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Run the weekly dependency maintenance pass without wasting time on versions blocked by Yarn's 7 day cooldown.
- Handle updates in staged passes with explicit stop points after validation, before any commit, and before any higher risk upgrade tier.

## Scope

- Allowed files:
    - `package.json`
    - `yarn.lock`
    - `docs/CHANGELOG.md`
    - directly affected source, test, or config files only when needed to keep an allowed dependency bump green
    - `copilot-tasks/weekly-package-maintenance.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
    - adding new dependencies without a concrete need
    - bypassing or weakening `.yarnrc.yml` `npmMinimalAgeGate: 7d`
    - auto commit or push
    - broad refactors unrelated to dependency fallout
    - archiving, renaming, or deleting this task file
- Constraints:
    - Read `.yarnrc.yml` first and treat `npmMinimalAgeGate: 7d` as mandatory.
    - Before any `yarn up` or manifest edit, compute the UTC cutoff timestamp as `now - 7 days` and write it in `Progress notes`.
    - Use a deterministic command for the cutoff, for example `node -e "const cutoff=new Date(Date.now()-7*24*60*60*1000); console.log(cutoff.toISOString())"`.
    - For every direct dependency, devDependency, or `resolutions` candidate, inspect publish timestamps first with `npm view <package> time --json` or an equivalent registry command.
    - Choose the newest stable version older than the cutoff. Ignore prereleases unless the repo already uses one.
    - If the freshest version is inside the cooldown window, or Yarn reports `No candidates found`, treat that as expected. Step down to the nearest older stable version instead of retrying blocked versions.
    - Follow this exact order:
        - direct dependency and devDependency patch updates
        - existing `resolutions` patch updates or removals when the graph no longer needs an override
        - validation
        - stop and ask the user whether to commit the patch pass
        - direct dependency and devDependency minor updates
        - validation
        - stop and ask the user whether to continue to majors
        - major updates only when patch and minor are green and each major has a small explicit blast radius
    - Review `resolutions` deliberately. Do not keep stale overrides only because they already exist. Do not add new overrides without a concrete transitive reason and the same 7 day date check.
    - Keep each stage narrow. Do not mix unrelated major work into the patch or minor pass.

## Validation

- Commands:
    - `yarn explain peer-requirements`
    - `yarn lint`
    - `yarn tsc --noEmit`
    - `yarn test --maxWorkers=2`
    - `yarn build`
    - `yarn test:e2e` only when updated packages touch runtime critical paths such as `react`, `react-dom`, `react-router`, form libraries, Aksel, webpack, dev server, auth, or proxy behavior
- Skip or limitation note:
    - If a command is skipped or fails for a pre existing reason, record that clearly in `Outcome` instead of broadening scope silently.

## Prompt for Copilot

Follow this task file. First update `Plan`, then work in staged passes. Read `.yarnrc.yml` before doing anything else, confirm that `npmMinimalAgeGate: 7d` is active, compute the UTC cutoff timestamp for `now - 7 days`, and write that cutoff into `Progress notes`. For every package candidate, check publish timestamps first with `npm view <package> time --json` or an equivalent registry command. Do not try `@latest` first when the latest release is newer than the cutoff, and do not keep retrying versions that Yarn blocks with `No candidates found`. Pick the nearest older stable version outside the cooldown window on purpose.

Start with direct dependency and devDependency patch updates, then review existing `resolutions` for patch level bumps or safe removals, and run the full validation list. After the patch pass, update `Outcome` with exact versions chosen, versions skipped because of the cooldown window, changed files, validation results, and remaining risks, then stop and ask the user whether to commit the patch pass. Do not commit unless the user explicitly asks.

Only after explicit user approval, continue with a minor pass under the same rules and run validation again. After the minor pass, stop and ask whether to continue to majors. Major updates are optional and should only be attempted one by one when patch and minor are both green and the major has a small isolated blast radius. If a major looks migration heavy, document it and stop instead of forcing it into the weekly pass.

Suggested starter prompt:

- `Follow copilot-tasks/weekly-package-maintenance.md. First update Plan, then run the patch pass with the 7 day cooldown precheck before any install attempt.`

## Plan

- Verify `.yarnrc.yml` still enforces `npmMinimalAgeGate: 7d`.
- Compute a fresh UTC cutoff timestamp for `now - 7 days` and record it in `Progress notes` before any install attempt.
- Build the direct dependency and devDependency candidate list from `package.json` and check publish timestamps before selecting versions.
- Execute patch pass only: direct deps, devDeps, then existing `resolutions` review.
- Run full validation for patch pass and document results.
- Stop and ask user whether to commit patch pass.
- Continue to minor pass only after explicit approval, then validate and stop before majors.
- Attempt majors only if explicitly approved after patch and minor are green.

## Progress notes

- Add short factual notes for the current run only.
- 2026-06-18: Confirmed `.yarnrc.yml` has `npmMinimalAgeGate: 7d`.
- 2026-06-18: UTC cutoff for this run is `2026-06-11T07:47:20.571Z`.
- 2026-06-18: Checked publish timestamps with `npm view <package> versions --json time` before selecting update targets.
- 2026-06-18: Applied patch-only direct/devDependency upgrades and reviewed `resolutions`.
- 2026-06-18: Updated `resolutions.systeminformation` to `5.31.7` and removed stale `resolutions.protobufjs` after `yarn why protobufjs` returned no active consumers.
- 2026-06-18: Reverted unintended `server/package.json` major bump (`@sentry/cli`) to keep patch pass scoped.

## Outcome

- Changed files: `package.json`, `yarn.lock`, `copilot-tasks/weekly-package-maintenance.md`.
- Patch pass:
    - `@babel/runtime` `7.29.2 -> 7.29.7`
    - `@grafana/faro-web-sdk` `2.7.0 -> 2.7.1`
    - `@grafana/faro-web-tracing` `2.7.0 -> 2.7.1`
    - `@tanstack/react-query` `5.100.11 -> 5.100.14`
    - `dayjs` `1.11.20 -> 1.11.21`
    - `react` `19.2.6 -> 19.2.7`
    - `react-dom` `19.2.6 -> 19.2.7`
    - `react-hook-form` `7.76.0 -> 7.76.1`
    - `react-intl` `10.1.8 -> 10.1.13`
    - `@babel/core` `7.29.0 -> 7.29.7`
    - `@babel/plugin-transform-runtime` `7.29.0 -> 7.29.7`
    - `@babel/preset-env` `7.29.5 -> 7.29.7`
    - `@sentry/cli` `3.4.2 -> 3.4.3`
    - `@storybook/react` `10.4.0 -> 10.4.3`
    - `@storybook/react-webpack5` `10.4.0 -> 10.4.3`
    - `@types/node` `25.9.1 -> 25.9.3`
    - `@types/react` `19.2.15 -> 19.2.17`
    - `eslint-import-resolver-typescript` `4.4.4 -> 4.4.5`
    - `eslint-plugin-prettier` `5.5.5 -> 5.5.6`
    - `lint-staged` `17.0.5 -> 17.0.7`
    - `prettier` `3.8.3 -> 3.8.4`
    - `storybook` `10.4.0 -> 10.4.3`
    - `terser-webpack-plugin` `5.6.0 -> 5.6.1`
    - `webpack` `5.107.0 -> 5.107.2`
    - `resolutions.systeminformation` `5.31.6 -> 5.31.7`
    - removed stale `resolutions.protobufjs`
- Minor pass: not started (awaiting explicit approval after patch pass).
- Major pass: not started (awaiting explicit approval after patch and minor).
- Validation:
    - `yarn explain peer-requirements`: completed, pre-existing peer notices remain.
    - `yarn lint`: passed.
    - `yarn tsc --noEmit`: passed.
    - `yarn test --maxWorkers=2`: passed (`62/62` suites, `442/442` tests).
    - `yarn build`: passed.
    - `yarn test:e2e`: passed (all e2e specs completed).
- Skipped versions still inside cooldown:
    - `@sentry/react@10.58.0`
    - `react-router@8.0.0`
    - `react-router-dom@7.18.0`
    - `tailwindcss@4.3.1`
    - `@tailwindcss/postcss@4.3.1`
    - `@typescript-eslint/parser@8.61.1`
    - `typescript-eslint@8.61.1`
    - `webpack-dev-server@5.2.5`
    - `eslint@10.5.0`
    - `@babel/preset-react@8.0.1`
    - `@babel/preset-typescript@8.0.1`
- Remaining follow ups:
    - `npm view` lookups for `@navikt/*` packages returned `401` from configured registry in this shell, so those candidates were not version-checked in this pass.
