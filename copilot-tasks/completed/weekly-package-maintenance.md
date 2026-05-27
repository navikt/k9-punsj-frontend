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

- Confirm `.yarnrc.yml` still enforces `npmMinimalAgeGate: 7d`.
- Compute a fresh UTC cutoff timestamp for `now - 7 days` and record it in `Progress notes` before any install attempt.
- Build a direct dependency and devDependency candidate list for minor updates and precheck publish timestamps.
- Revisit `msw` only after the related Cypress instability is fixed and validate with full e2e before keeping any bump.
- Apply only minor-level updates that are stable and older than cutoff.
- Run full validation (`peer requirements`, `lint`, `tsc`, `test`, `build`, and `test:e2e` when runtime-critical packages are changed).
- Update `Outcome` with exact versions selected, skipped cooldown versions, validation results, and remaining risks.
- Stop before any major update and ask whether to continue to majors.

## Progress notes

- UTC cutoff for this run (`now - 7 days`): `2026-05-20T10:45:11.160Z`.
- UTC cutoff for minor pass (`now - 7 days`): `2026-05-20T11:35:24.089Z`.
- Latest versions blocked by cooldown and stepped down in patch pass:
    - `@tanstack/react-query`: latest `5.100.14` (2026-05-23) -> used `5.100.11` (2026-05-18)
    - `react-intl`: latest `10.1.9` (2026-05-22) -> used `10.1.8` (2026-05-19)
    - `@sentry/cli`: latest `3.4.3` (2026-05-21) -> used `3.4.2` (2026-05-11)
    - `@typescript-eslint/parser`: latest `8.60.0` (2026-05-25) -> used `8.59.4` (2026-05-18)
    - `typescript-eslint`: latest `8.60.0` (2026-05-25) -> used `8.59.4` (2026-05-18)
    - `stylelint`: latest `17.12.0` (2026-05-20T10:45:18Z) -> used `17.11.1` (2026-05-14)
- `msw@2.14.6` passed the 7 day age gate but regressed Cypress startup in this repo by causing `Failed to fetch` during `/envVariables` bootstrap in `SendBrevIAvsluttetSak`, so the patch pass deliberately kept `msw` at `2.14.2`.
- Minor pass ran with the same cutoff discipline and explicit `msw` pin. `msw` stayed on `2.14.2` and was not retried.
- After stabilizing the affected e2e path, `msw@2.14.6` was retested and passed full `yarn test:e2e`, including `SendBrevIAvsluttetSak`.

## Outcome

- Changed files:
    - `package.json`
    - `yarn.lock`
    - `copilot-tasks/weekly-package-maintenance.md`
- Patch pass:
    - dependencies:
        - `@tanstack/react-query` `5.100.10` -> `5.100.11`
        - `react-intl` `10.1.5` -> `10.1.8`
        - `react-router` `7.15.0` -> `7.15.1`
        - `react-router-dom` `7.15.0` -> `7.15.1`
    - devDependencies:
        - `@sentry/cli` `3.4.1` -> `3.4.2`
        - `@types/react` `19.2.14` -> `19.2.15`
        - `@typescript-eslint/parser` `8.59.3` -> `8.59.4`
        - `lint-staged` `17.0.4` -> `17.0.5`
        - `postcss` `8.5.14` -> `8.5.15`
        - `stylelint` `17.11.0` -> `17.11.1`
        - `typescript-eslint` `8.59.3` -> `8.59.4`
    - resolutions:
        - `postcss` `8.5.14` -> `8.5.15`
        - `protobufjs` `8.2.0` -> `8.2.1`
        - `qs` `6.15.1` -> `6.15.2`
- Minor pass:
    - dependencies:
        - `@reduxjs/toolkit` `2.11.2` -> `2.12.0`
        - `@sentry/react` `10.51.0` -> `10.53.1`
        - `date-fns` `4.1.0` -> `4.2.1`
        - `react-hook-form` `7.75.0` -> `7.76.0`
        - `react-redux` `9.2.0` -> `9.3.0`
    - devDependencies:
        - `@jest/globals` `30.3.0` -> `30.4.1`
        - `@storybook/react` `10.3.6` -> `10.4.0`
        - `@storybook/react-webpack5` `10.3.6` -> `10.4.0`
        - `@types/node` `25.7.0` -> `25.9.1`
        - `cypress` `15.14.2` -> `15.15.0`
        - `eslint-import-resolver-node` `0.3.10` -> `0.4.0`
        - `msw` `2.14.2` -> `2.14.6`
        - `storybook` `10.3.6` -> `10.4.0`
        - `stylelint` `17.11.1` -> `17.12.0`
        - `webpack` `5.106.2` -> `5.107.0`
- Major pass:
    - Not started (stopped before majors).
- Validation:
    - `yarn explain peer-requirements`: exit 0, still reports unresolved peer entries (`p14842d`, `pfb46d5`, `p8d41ad`, `pc25b84`, `p44ced1`, `pcf81cb`, `ped69b5`, `pa1ede3`)
    - `yarn lint`: exit 0
    - `yarn tsc --noEmit`: exit 0
    - `yarn test --maxWorkers=2`: exit 0, 62 suites passed
    - `yarn build`: exit 0
    - `yarn test:e2e`: first attempt was blocked by missing local Cypress binary after the `cypress` minor bump, then `yarn cypress install` fixed the binary setup. A follow-up full rerun finished green with `29/29` spec files passed and `372/372` tests passed. A later rerun with `msw@2.14.6` also finished green with `29/29` spec files passed and `374` passing tests plus `1` pending.
- Skipped versions still inside cooldown:
    - Minor pass used only stable versions older than cutoff; latest versions inside cooldown were intentionally skipped.
- Remaining follow ups:
    - `SendBrevIAvsluttetSak` had both package-level and spec-level instability during the maintenance pass. Keep those failure classes separate if the spec starts flaking again in future runs.
    - Stop point reached before majors.
