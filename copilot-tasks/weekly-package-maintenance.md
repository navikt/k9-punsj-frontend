# Copilot task

## Task

- Title: Weekly package maintenance with 7 day cooldown precheck
- Branch: `pkgUpd`
- Prompt language: `English`

## Goal

- Run the weekly dependency maintenance pass without wasting time on versions blocked by Yarn's 7 day cooldown.
- Handle patch and minor updates in staged passes with explicit stop points after validation and before any commit.

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
    - major dependency upgrades in this task
    - broad refactors unrelated to dependency fallout
    - archiving, renaming, or deleting this task file
- Constraints:
    - Read `.yarnrc.yml` first and treat `npmMinimalAgeGate: 7d` as mandatory.
    - Before any `yarn up` or manifest edit, compute the UTC cutoff timestamp as `now - 7 days` and write it in `Progress notes`.
    - Use a deterministic command for the cutoff, for example `node -e "const cutoff=new Date(Date.now()-7*24*60*60*1000); console.log(cutoff.toISOString())"`.
    - For every direct dependency, devDependency, or `resolutions` candidate, inspect publish timestamps first with `npm view <package> time --json` or an equivalent registry command.
    - Before changing any package, build a full eligible-version matrix per candidate:
        - newest eligible patch in the current minor line
        - newest eligible minor in the current major line
        - newest eligible major
    - Choose the newest stable version older than the cutoff. Ignore prereleases unless the repo already uses one.
    - If the freshest version is inside the cooldown window, or Yarn reports `No candidates found`, treat that as expected. Step down to the nearest older stable version instead of retrying blocked versions.
    - A package should normally be upgraded only once in the staged run. Do not spend the patch pass on a package if an eligible minor or major already exists outside the cooldown window.
    - In patch pass, update only packages whose highest eligible tier is patch.
    - In minor pass, update only packages whose highest eligible tier is minor.
    - If an eligible major exists, leave the package unchanged in this task, and record that it requires a separate focused task.
    - Follow this exact order:
        - direct dependency and devDependency patch updates
        - existing `resolutions` patch updates or removals when the graph no longer needs an override
        - validation
        - stop and ask the user whether to commit the patch pass
        - direct dependency and devDependency minor updates
        - validation
        - stop and summarize any major candidates that should be handled separately
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

Follow this task file. First update `Plan`, then work in staged passes. Read `.yarnrc.yml` before doing anything else, confirm that `npmMinimalAgeGate: 7d` is active, compute the UTC cutoff timestamp for `now - 7 days`, and write that cutoff into `Progress notes`. For every package candidate, check publish timestamps first with `npm view <package> time --json` or an equivalent registry command. Build a full eligible-version matrix for each package before making changes: highest eligible patch, highest eligible minor, and highest eligible major outside the cooldown window. Do not try `@latest` first when the latest release is newer than the cutoff, and do not keep retrying versions that Yarn blocks with `No candidates found`. Pick the nearest older stable version outside the cooldown window on purpose.

Start with direct dependency and devDependency patch updates, then review existing `resolutions` for patch level bumps or safe removals, and run the full validation list. In the patch pass, only update packages whose highest eligible tier is patch. If a package already has an eligible minor or major outside the cooldown window, skip it in the patch pass and leave it for the later tier instead of updating it twice. After the patch pass, update `Outcome` with exact versions chosen, versions skipped because of the cooldown window, packages intentionally deferred to minor or major, changed files, validation results, and remaining risks, then stop and ask the user whether to commit the patch pass. Do not commit unless the user explicitly asks.

Only after explicit user approval, continue with a minor pass under the same rules and run validation again. In the minor pass, update only packages whose highest eligible tier is minor. If an eligible major already exists, leave that package unchanged and record it as a separate follow up. After the minor pass, stop and summarize any major candidates that deserve their own focused task. Do not attempt major upgrades in this weekly pass.

Suggested starter prompt:

- `Follow copilot-tasks/weekly-package-maintenance.md. First update Plan, then run the patch pass with the 7 day cooldown precheck before any install attempt.`

## Carry forward notes

- Keep `webpack` pinned to `5.107.0` until the PSB country-list regression is resolved. `5.107.2` and `5.108.3` can emit `i18n-iso-countries/codes.json` as an empty payload in production style bundles.
- For future `webpack` updates, do not rely only on local dev or a successful local build. Verify in Q or another production-like environment that PSB countries are shown for `utenlandsopphold`, and explicitly check that the country dropdown is populated.
- Avoid forcing transitive major jumps through broad `resolutions`. A previous `uuid@npm:^8.3.2 -> 14.0.1` override looked tidy in `yarn why`, but it overrode `sockjs` onto a different major than requested.
- Current targeted security overrides that should be revisited in later runs are `form-data@4.0.6`, `http-proxy-middleware@2.0.10`, `undici@6.27.0`, and `@opentelemetry/core@2.8.0`. Remove them once the graph naturally resolves to equal or newer safe versions.
- Recheck whether a direct bump of `@sentry/cli` can replace the temporary `undici` override after the newer CLI version is outside the 7 day cooldown window.
- `npm view` for some `@navikt/*` packages can return `401` from the configured registry in this shell.
- `yarn up` scope can unintentionally modify `server/package.json`, so verify workspace diffs before commit.

## Plan

- Run started: 2026-07-28

- [x] Verify `.yarnrc.yml` still enforces `npmMinimalAgeGate: 7d`.
- [x] Compute a fresh UTC cutoff timestamp for `now - 7 days` and record it in `Progress notes` before any install attempt.
- [x] Build the direct dependency and devDependency candidate list from `package.json`, then record the highest eligible patch, minor, and major per package before selecting versions.
- [x] Execute patch pass only: direct deps, devDeps, then existing `resolutions` review.
- [x] Run full validation for patch pass and document results.
- [x] Stop and ask user whether to commit patch pass.
- [x] Continue to minor pass only after explicit approval, then validate and summarize separate major follow ups.

## Progress notes

- 2026-07-28: Verified `.yarnrc.yml` contains `npmMinimalAgeGate: 7d`.
- 2026-07-28: UTC cutoff (`now - 7 days`) set to `2026-07-21T08:21:48.025Z` before any install attempt.
- 2026-07-28: Built cutoff-aware matrix for 118 candidates (`dependencies`, `devDependencies`, `resolutions`): `patch=7`, `minor=24`, `major=16`, `none=71`, `errors=0`.
- 2026-07-28: Applied patch pass versions: `@tanstack/react-query 5.101.1 -> 5.101.3`, `react-intl 10.1.13 -> 10.1.18`, `tailwindcss 4.3.1 -> 4.3.3`, `@tailwindcss/postcss 4.3.1 -> 4.3.3`, `autoprefixer 10.5.2 -> 10.5.4`, `postcss 8.5.15 -> 8.5.20`.
- 2026-07-28: Reviewed `resolutions` and removed stale `postcss` override after verifying the graph still resolves to `postcss@8.5.20` without it.
- 2026-07-28: Validation completed for patch pass (`yarn explain peer-requirements`, `yarn lint`, `yarn tsc --noEmit`, `yarn test --maxWorkers=2`, `yarn build`).
- 2026-07-28: Minor pass approved by user and started with fresh cutoff `2026-07-21T08:36:53.626Z`.
- 2026-07-28: Built fresh direct+dev minor candidate set and applied allowed updates, excluding `webpack` per carry-forward constraint.
- 2026-07-28: Minor pass alignment fix: reverted `react-router-dom` to `7.17.0` to match `react-router@7.17.0` and avoid context mismatch in tests.
- 2026-07-28: Minor pass validation completed (`yarn explain peer-requirements`, `yarn lint`, `yarn tsc --noEmit`, `yarn test --maxWorkers=2`, `yarn build`, `yarn test:e2e`).

## Outcome

- Changed files: `package.json`, `yarn.lock`, `copilot-tasks/weekly-package-maintenance.md`.
- Patch pass:
    - Updated: `@tanstack/react-query 5.101.1 -> 5.101.3`, `react-intl 10.1.13 -> 10.1.18`, `tailwindcss 4.3.1 -> 4.3.3`, `@tailwindcss/postcss 4.3.1 -> 4.3.3`, `autoprefixer 10.5.2 -> 10.5.4`, `postcss 8.5.15 -> 8.5.20`.
    - Resolutions review: removed stale `postcss` override after verification.
    - Deferred to minor tier by rule (highest eligible tier is minor): `@grafana/faro-web-sdk`, `@grafana/faro-web-tracing`, `@navikt/aksel-icons`, `@navikt/ds-css`, `@navikt/ds-react`, `@sentry/react`, `react-hook-form`, `react-router-dom`, `@navikt/aksel`, `@navikt/ds-tailwind`, `@sentry/cli`, `@storybook/react`, `@storybook/react-webpack5`, `@typescript-eslint/parser`, `cypress`, `lint-staged`, `msw`, `prettier`, `storybook`, `stylelint`, `typescript-eslint`, `webpack`, `@opentelemetry/core` (resolution), `systeminformation` (resolution).
    - Deferred to separate major work by rule: `@babel/runtime`, `react-router`, `redux-logger`, `@babel/core`, `@babel/plugin-transform-runtime`, `@babel/preset-env`, `@babel/preset-react`, `@babel/preset-typescript`, `@testing-library/jest-dom`, `@types/node`, `eslint`, `typescript`, `webpack-dev-server`, `http-proxy-middleware` (resolution), `js-yaml` (resolution), `undici` (resolution).
- Minor pass:
    - Updated dependencies: `@grafana/faro-web-sdk 2.7.1 -> 2.8.2`, `@grafana/faro-web-tracing 2.7.1 -> 2.8.2`, `@navikt/aksel-icons 8.12.1 -> 8.15.0`, `@navikt/ds-css 8.12.1 -> 8.15.0`, `@navikt/ds-react 8.12.1 -> 8.15.0`, `@sentry/react 10.57.0 -> 10.67.0`, `react-hook-form 7.78.0 -> 7.82.0`.
    - Updated devDependencies: `@navikt/aksel 8.12.1 -> 8.15.0`, `@navikt/ds-tailwind 8.12.1 -> 8.15.0`, `@sentry/cli 3.5.1 -> 3.6.1`, `@storybook/react 10.4.6 -> 10.5.3`, `@storybook/react-webpack5 10.4.6 -> 10.5.3`, `@typescript-eslint/parser 8.62.0 -> 8.65.0`, `cypress 15.17.0 -> 15.18.1`, `lint-staged 17.0.8 -> 17.1.0`, `msw 2.14.6 -> 2.15.0`, `prettier 3.8.4 -> 3.9.6`, `storybook 10.4.6 -> 10.5.3`, `stylelint 17.13.0 -> 17.14.1`, `typescript-eslint 8.62.0 -> 8.65.0`.
    - Not updated in minor pass: `react-router-dom` stayed on `7.17.0` to stay aligned with `react-router@7.17.0` (where eligible major exists and is out of scope), `webpack` stayed pinned at `5.107.0` per carry-forward note.
- Major follow ups: 16 candidates identified; separate focused tasks required (see list below).
- Validation:
    - `yarn explain peer-requirements`: completed; existing peer warnings remain (for example `p44ced1` on `eslint`), no new blocker introduced in this pass.
    - `yarn lint`: pass.
    - `yarn tsc --noEmit`: pass.
    - `yarn test --maxWorkers=2`: pass (`64/64` suites, `457/457` tests).
    - `yarn build`: pass.
    - `yarn test:e2e`: patch pass skipped by rule; minor pass executed after Cypress binary install and passed (`29/29` specs, `376/376` tests).
- Skipped versions still inside cooldown:
    - `@tanstack/react-query`: `5.101.4` published `2026-07-21T13:04:07.544Z` (newer than cutoff), selected `5.101.3`.
    - `postcss`: `8.5.23` published `2026-07-24T17:05:13.876Z` (newer than cutoff), selected `8.5.20`.
- Remaining risks or follow ups:
    - Keep `webpack` pinned to `5.107.0` in this run per carry-forward note.
    - Major follow-up candidates (separate task): `@babel/runtime@8`, `react-router@8`, `redux-logger@4`, `@babel/core@8`, `@babel/plugin-transform-runtime@8`, `@babel/preset-env@8`, `@babel/preset-react@8`, `@babel/preset-typescript@8`, `@testing-library/jest-dom@7`, `@types/node@26`, `eslint@10`, `typescript@7`, `webpack-dev-server@6`, `http-proxy-middleware@4` (resolution), `js-yaml@5` (resolution), `undici@8` (resolution).
