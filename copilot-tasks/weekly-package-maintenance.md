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

- [ ] Verify `.yarnrc.yml` still enforces `npmMinimalAgeGate: 7d`.
- [ ] Compute a fresh UTC cutoff timestamp for `now - 7 days` and record it in `Progress notes` before any install attempt.
- [ ] Build the direct dependency and devDependency candidate list from `package.json`, then record the highest eligible patch, minor, and major per package before selecting versions.
- [ ] Execute patch pass only: direct deps, devDeps, then existing `resolutions` review.
- [ ] Run full validation for patch pass and document results.
- [ ] Stop and ask user whether to commit patch pass.
- [ ] Continue to minor pass only after explicit approval, then validate and summarize separate major follow ups.

## Progress notes

- Add dated notes during the next run.

## Outcome

- Changed files:
- Patch pass:
- Minor pass:
- Major follow ups:
- Validation:
- Skipped versions still inside cooldown:
- Remaining risks or follow ups:
