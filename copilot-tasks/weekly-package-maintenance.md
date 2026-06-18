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
- Start each new run by replacing this section with fresh dated notes.
- Carry-over issues to watch in next run:
    - `npm view` for some `@navikt/*` packages can return `401` in this shell/registry setup.
    - Workspace commands can unintentionally touch `server/package.json`; verify scope before commit.
    - Interrupted `yarn test:e2e` runs can look like failures; confirm with one uninterrupted full run.

## Outcome

- Changed files:
    - _fill in per run_
- Patch pass:
    - _fill in selected updates_
- Minor pass:
    - _fill in selected updates_
- Major pass:
    - _fill in selected updates or write `not started`_
- Validation:
    - `yarn explain peer-requirements`: _result_
    - `yarn lint`: _result_
    - `yarn tsc --noEmit`: _result_
    - `yarn test --maxWorkers=2`: _result_
    - `yarn build`: _result_
    - `yarn test:e2e`: _result when relevant_
- Skipped versions still inside cooldown:
    - _fill in per run_
- Remaining follow ups:
    - _fill in per run_
- Known issues from previous run:
    - `npm view` for some `@navikt/*` packages returned `401` from configured registry in this shell.
    - `yarn up` scope can unintentionally modify `server/package.json`; verify workspace diffs before commit.
    - Full `yarn test:e2e` must complete uninterrupted to avoid false-negative failure impression.
