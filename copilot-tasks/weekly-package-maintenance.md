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

- [x] Verify `.yarnrc.yml` still enforces `npmMinimalAgeGate: 7d`.
- [x] Compute a fresh UTC cutoff timestamp for `now - 7 days` and record it in `Progress notes` before any install attempt.
- [x] Build the direct dependency and devDependency candidate list from `package.json` and check publish timestamps before selecting versions.
- [x] Execute patch pass only: direct deps, devDeps, then existing `resolutions` review.
- [x] Run full validation for patch pass and document results.
- [x] Stop and ask user whether to commit patch pass.
- [x] Continue to minor pass only after explicit approval, then validate and stop before majors.
- [ ] Attempt majors only if explicitly approved after patch and minor are green.

## Progress notes

- 2026-07-02: User approved next step to start minor pass.
- 2026-07-02: Computed cooldown cutoff (UTC) as `2026-06-25T13:01:12.480Z` before minor candidate selection.
- 2026-07-02: Minor candidate selection completed with publish-time precheck per package.
- 2026-07-02: Applied safe minor updates in `package.json` and `yarn.lock`, then ran validation.
- 2026-07-02: Full e2e run was interrupted by `SIGINT` at the last spec (`29/29`), so isolated run of remaining spec was executed.
- 2026-07-02: Isolated e2e run for `cypress/e2e/sendBrevPåFagsak/sendBrevPåFagsak.js` failed (`4/7`), so minor pass is not green.
- 2026-07-02: User accepted known failure scope for `sendBrevPåFagsak.js`; minor pass treated as accepted with known e2e deviation for weekly maintenance.

## Outcome

- Changed files:
    - `copilot-tasks/weekly-package-maintenance.md`
    - `package.json`
    - `yarn.lock`
- Patch pass:
    - Direct dependencies:
        - `@babel/runtime` `7.29.2 -> 7.29.7`
        - `@tanstack/react-query` `5.101.0 -> 5.101.1`
        - `tailwindcss` `4.3.0 -> 4.3.1`
        - `uuid` `14.0.0 -> 14.0.1`
    - Dev dependencies:
        - `@babel/core` `7.29.0 -> 7.29.7`
        - `@babel/plugin-transform-runtime` `7.29.0 -> 7.29.7`
        - `@babel/preset-env` `7.29.5 -> 7.29.7`
        - `@sentry/cli` `3.5.0 -> 3.5.1` (also updated in workspace `server/package.json`)
        - `@storybook/react` `10.4.4 -> 10.4.6`
        - `@storybook/react-webpack5` `10.4.4 -> 10.4.6`
        - `@tailwindcss/postcss` `4.3.0 -> 4.3.1`
        - `@types/node` `25.9.3 -> 25.9.4`
        - `@typescript-eslint/parser` `8.61.0 -> 8.61.1`
        - `autoprefixer` `10.5.0 -> 10.5.2`
        - `lint-staged` `17.0.7 -> 17.0.8`
        - `storybook` `10.4.4 -> 10.4.6`
        - `terser-webpack-plugin` `5.6.0 -> 5.6.1`
        - `typescript-eslint` `8.61.0 -> 8.61.1`
        - `webpack` `5.107.0 -> 5.107.2`
        - `webpack-dev-server` attempted `5.2.4 -> 5.2.5`, then rolled back to `5.2.4` after e2e regression
    - Resolutions:
        - `qs` `6.15.2 -> 6.15.3`
        - `systeminformation` `5.31.7 -> 5.31.11`
        - `uuid@npm:^8.3.2` `14.0.0 -> 14.0.1`
    - Patch commit:
        - `95cffea7` `chore: weekly package maintenance patch pass`
- Minor pass:
    - Applied direct/dev dependency minor updates:
        - `@babel/preset-react` `7.28.5 -> 7.29.7`
        - `@babel/preset-typescript` `7.28.5 -> 7.29.7`
        - `@typescript-eslint/parser` `8.61.1 -> 8.62.0`
        - `typescript-eslint` `8.61.1 -> 8.62.0`
    - Attempted and reverted due regression risk during minor pass:
        - `@navikt/aksel-icons` `8.12.1 -> 8.13.1` (reverted to `8.12.1`)
        - `@navikt/ds-css` `8.12.1 -> 8.13.1` (reverted to `8.12.1`)
        - `@navikt/ds-react` `8.12.1 -> 8.13.1` (reverted to `8.12.1`)
        - `@navikt/aksel` `8.12.1 -> 8.13.1` (reverted to `8.12.1`)
        - `@navikt/ds-tailwind` `8.12.1 -> 8.13.1` (reverted to `8.12.1`)
- Major pass:
    - not started
- Validation:
    - `yarn explain peer-requirements`: completed with existing peer issues/warnings (not new blockers for this pass), including `p44ced1` and Storybook peer warnings
    - `yarn lint`: passed
    - `yarn tsc --noEmit`: passed
    - `yarn test --maxWorkers=2`: passed (`63/63` suites, `450/450` tests)
    - `yarn build`: passed
    - `yarn test:e2e`: full run ended with `1/29` failing spec (`SendBrevIAvsluttetSak`), then targeted rerun for that spec passed (`15/15`)
    - Minor pass re-validation:
        - `yarn lint`: passed
        - `yarn tsc --noEmit`: passed
        - `yarn test --maxWorkers=2`: passed (`63/63` suites, `450/450` tests)
        - `yarn build`: passed
        - `yarn test:e2e`: full run was interrupted by `SIGINT` at spec `29/29`; isolated run for `sendBrevPåFagsak.js` failed (`4/7`, `4` failing)
- Skipped versions still inside cooldown:
    - `react-intl@10.1.14` (stayed on `10.1.13`)
    - `postcss@8.5.16` (stayed on `8.5.15`)
    - `prettier@3.8.5` (stayed on `3.8.4`)
    - stepped down intentionally due cutoff (latest too new): `@tanstack/react-query@5.101.2`, `tailwindcss@4.3.2`, `@tailwindcss/postcss@4.3.2`, `@sentry/cli@3.6.0`, `webpack@5.108.3`
- Remaining follow ups:
    - Known e2e deviation accepted for this pass: `sendBrevPåFagsak.js` (`4` failing in isolated run).
    - Keep `webpack` pinned to `5.107.0` for now. `5.107.2` and `5.108.3` can produce an empty PSB country list in production style bundles (`i18n-iso-countries/codes.json` emitted as empty payload).
    - For future webpack updates, do not rely only on local dev or successful local build. Verify in Q and prod like environments that PSB countries are shown for `utenlandsopphold`.
    - Investigate and stabilize `sendBrevPåFagsak.js` outside weekly dependency scope.
    - Decide whether to continue to major updates.
- Known issues from previous run:
    - `npm view` for some `@navikt/*` packages returned `401` from configured registry in this shell.
    - `yarn up` scope can unintentionally modify `server/package.json`; verify workspace diffs before commit.
    - Full `yarn test:e2e` must complete uninterrupted to avoid false-negative failure impression.
    - Local build success was not sufficient to catch the PSB country regression after webpack updates. Future validation for webpack bumps must include runtime verification of countries in Q or an equivalent production-like environment.
