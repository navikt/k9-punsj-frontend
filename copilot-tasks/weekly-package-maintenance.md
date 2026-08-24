# Copilot task

## Task

- Title: Weekly package maintenance after cooldown follow ups
- Branch: `chore/package-maintenance-2026-08`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Run one controlled weekly dependency pass for the root workspace and the `server` workspace.
- Take eligible patch and minor updates only, recheck earlier cooldown-blocked items against the current date, and leave majors as separate follow ups.

## Scope

- Allowed files:
    - `package.json`
    - `server/package.json`
    - `yarn.lock`
    - `docs/CHANGELOG.md`
    - directly affected source, test, or config files only when needed to keep an allowed dependency bump green
    - `src/mocks/mockServiceWorker.js` only if an `msw` update regenerates it
    - `copilot-tasks/weekly-package-maintenance.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
    - adding new dependencies without a concrete need
    - bypassing or weakening `.yarnrc.yml` `npmMinimalAgeGate: 7d`
    - auto commit or push
    - major dependency upgrades in this task
    - blind `yarn up` runs across broad package sets
    - broad refactors unrelated to dependency fallout
    - archiving, renaming, or deleting this task file
- Constraints:
    - Read `.yarnrc.yml`, `package.json`, `server/package.json`, and the latest dependency-related entries near the top of `docs/CHANGELOG.md` first.
    - If GitHub MCP is available in this environment, check open Dependabot alerts first and then open dependency-related pull requests before making package changes. Use alerts as the primary signal and pull requests as a secondary cross-check for duplicate or overlapping work.
    - Before any `yarn up` or manifest edit, compute the UTC cutoff timestamp as `now - 7 days` and write it in `Progress notes`.
    - Use a deterministic command for the cutoff, for example `node -e "const cutoff=new Date(Date.now()-7*24*60*60*1000); console.log(cutoff.toISOString())"`.
    - Treat older task notes and older changelog entries as hints only. Revalidate every relevant earlier block or exception against current publish timestamps.
    - Discover the full current candidate set first across root dependencies, root devDependencies, `server` dependencies, and existing `resolutions`. `npm outdated --json` is acceptable for discovery, but every chosen version must then be verified with `npm view <package> time --json` or an equivalent registry command.
    - Before changing any package, build a compact eligible-version matrix per candidate:
        - current version
        - newest eligible patch in the current minor line
        - newest eligible minor in the current major line
        - newest eligible major
        - chosen action and short reason
    - Choose the newest stable version older than the cutoff. Ignore prereleases unless the repo already uses one.
    - If the freshest version is inside the cooldown window, or Yarn reports `No candidates found`, treat that as expected. Step down to the nearest older stable version instead of retrying blocked versions.
    - A package should normally be upgraded only once in the staged run. If both patch and minor are eligible outside the cooldown window, choose the eligible minor as the target for that package and do not spend a separate patch step on it.
    - When the newest available minor in the current major line is still inside the cooldown window, look for the nearest older minor release in the same major that is already outside the window. If such a minor exists and is newer than the current version, choose that eligible older minor instead of falling back to patch.
    - Fall back to patch only when no eligible minor exists in the current major line outside the cooldown window.
    - In patch pass, update only packages whose highest eligible tier is patch.
    - In minor pass, update only packages whose highest eligible tier is minor.
    - If an eligible major exists, leave the package unchanged in this task, and record that it requires a separate focused task.
    - Update root and `server` deliberately. Do not let a root pass modify `server/package.json` accidentally, but do include `server` when it has its own eligible patch or minor updates.
    - Use explicit package lists in each `yarn up` command. Do not use globs, `@latest`, or one-shot project-wide upgrades.
    - Review `resolutions` deliberately after the patch pass and again after the minor pass. Each review must state which overrides are still needed, which can be bumped within scope, and which can be removed safely.
    - Do not keep stale overrides only because they already exist. Do not add new overrides without a concrete transitive reason and the same 7 day date check.
    - Keep `docs/CHANGELOG.md` updates short and factual.
    - If GitHub MCP is available, recheck Dependabot alerts after the patch pass and again after the minor pass. Record what closed, what is unchanged, and any open dependency PRs that still overlap with the remaining work.
    - Keep each stage narrow. Do not mix unrelated major work into the patch or minor pass.

## Validation

- Commands:
    - `yarn explain peer-requirements`
    - `yarn lint`
    - `yarn tsc --noEmit`
    - `yarn test --maxWorkers=2`
    - `yarn build`
    - `yarn test:e2e` only when updated packages touch runtime critical paths such as `react`, `react-dom`, `react-router`, form libraries, Aksel, webpack, dev server, auth, or proxy behavior, and only after explicit user approval
- Skip or limitation note:
    - If `yarn test:e2e` looks relevant, stop and ask the user before running it.
    - If a command is skipped or fails for a pre existing reason, record that clearly in `Outcome` instead of broadening scope silently.

## Prompt for Copilot

Follow this task file. First update `Plan`. Start by reading `.yarnrc.yml`, `package.json`, `server/package.json`, and the latest dependency-related entries near the top of `docs/CHANGELOG.md`. If GitHub MCP is available, check open Dependabot alerts first and then open dependency-related pull requests so the run starts from the current repository risk picture and does not duplicate existing work. Confirm that `npmMinimalAgeGate: 7d` is active, compute the UTC cutoff timestamp for `now - 7 days`, and write that cutoff into `Progress notes`. Discover the full current update set for root dependencies, root devDependencies, `server` dependencies, and existing `resolutions`, then verify every chosen version with `npm view <package> time --json` or an equivalent registry command. Build a compact inventory for each candidate with current version, highest eligible patch, highest eligible minor, highest eligible major, chosen action, and reason. Do not try `@latest` first when the latest release is newer than the cutoff, and do not keep retrying versions that Yarn blocks with `No candidates found`. Pick the nearest older stable version outside the cooldown window on purpose, including an older eligible minor when the newest minor is still too fresh.

For each package, target the highest eligible non major version outside the cooldown window. That means if both patch and minor are eligible, the package belongs to the minor pass and should not be touched in the patch pass. If the latest minor is still blocked by the cooldown window but an older minor in the same major is already eligible, use that older eligible minor and keep the package in the minor pass. Run a patch pass first only for root and `server` packages whose highest eligible tier is patch, using explicit package lists only. Then review `resolutions` immediately after the patch pass, bump or remove only what is still justified, update `docs/CHANGELOG.md` briefly, and run the full validation list. If GitHub MCP is available, recheck Dependabot alerts after the patch pass and note what closed or stayed open. After the patch pass, update `Outcome` with exact versions chosen, versions skipped because of the cooldown window, packages intentionally deferred to minor or major, `resolutions` decisions, changed files, validation results, alert or PR follow up, and remaining risks, then stop and ask the user whether to commit the patch pass. Do not commit unless the user explicitly asks.

Only after explicit user approval, continue with a minor pass under the same rules for root and `server`, and run validation again. In the minor pass, update only packages whose highest eligible tier is minor. If an eligible major already exists, leave that package unchanged and record it as a separate follow up. After the minor pass, review `resolutions` again, update `docs/CHANGELOG.md` briefly again if needed, and if GitHub MCP is available, recheck Dependabot alerts and overlapping dependency pull requests one more time. Then stop and summarize any major candidates or still risky overrides that deserve their own focused task. Do not attempt major upgrades in this weekly pass. Do not run `yarn test:e2e` without asking the user first, even when the updated packages match the runtime critical path rule.

Suggested starter prompt:

- `Follow copilot-tasks/weekly-package-maintenance.md. First update Plan, then run the patch pass with the 7 day cooldown precheck before any install attempt.`

## Carry forward notes

- Treat older dependency notes as historical context only. Trust the current manifests, lockfile, registry timestamps, and the latest changelog entries over older task assumptions.
- `react-router` and `react-router-dom` major work remains a separate follow up, not part of this weekly pass.
- Avoid forcing transitive major jumps through broad `resolutions`. A previous `uuid@npm:^8.3.2 -> 14.0.1` override looked tidy in `yarn why`, but it overrode `sockjs` onto a different major than requested.
- Recheck current security-related overrides against real lockfile usage instead of assuming they are still needed because they were added earlier.
- Dependabot alerts are the primary GitHub follow-up signal for this task. Open dependency pull requests are useful only as a secondary overlap check.
- `npm view` for some `@navikt/*` packages can return `401` from the configured registry in this shell.
- `yarn up` scope can still modify multiple workspaces, so verify diffs for root and `server` before keeping changes.

## Plan

- [x] Read `.yarnrc.yml`, both manifests, and the latest dependency changelog context.
- [x] If GitHub MCP is available, inspect open Dependabot alerts and open dependency-related pull requests before changing packages. No dedicated Dependabot-alert tool is available; open pull requests were queried as the available secondary check.
- [x] Compute a fresh UTC cutoff timestamp for `now - 7 days` and record it in `Progress notes` before any install attempt.
- [x] Build one candidate inventory for root and `server`, then record the highest eligible patch, minor, and major per package before selecting versions.
- [x] Execute patch pass only, using explicit package lists for root and `server`.
- [x] Review `resolutions` after patch pass, update changelog briefly, rerun Dependabot alerts if available, run validation, and document results.
- [x] Stop and ask user whether to commit patch pass.
- [x] Continue to minor pass only after explicit approval, then review `resolutions` again, update changelog briefly again, rerun alerts or PR overlap checks if available, validate, and summarize separate major follow ups.

## Progress notes

- Fresh UTC cutoff: `2026-08-17T09:53:42.537Z` (`npmMinimalAgeGate: 7d` confirmed active).
- Initial repository read completed. GitHub open pull requests were queried; no dedicated Dependabot-alert tool was available in this environment, so alerts could not be checked directly.
- Candidate matrix from current manifests and registry data (current; eligible patch; eligible minor; latest major; action): `@grafana/faro-web-sdk` (2.8.2; none; 2.9.0; 2.x; defer minor), `@grafana/faro-web-tracing` (2.8.2; none; 2.9.0; 2.x; defer minor), `@sentry/react` (10.68.0; none; 10.70.0; 10.x; defer minor), `@storybook/react` (10.5.5; 10.5.8; 10.5.8; 10.x; patch), `@storybook/react-webpack5` (10.5.5; 10.5.8; 10.5.8; 10.x; patch), `@testing-library/user-event` (14.6.1; 14.6.4; 14.6.4; 14.x; patch), `@typescript-eslint/parser` (8.65.0; none; 8.67.0; 8.x; defer minor), `cypress` (15.19.0; none; 15.20.1; 15.x; defer minor), `lint-staged` (17.2.0; none; 17.3.0; 17.x; defer minor), `postcss` (8.5.24; 8.5.26; 8.5.26; 8.x; patch), `postcss-import` (16.1.1; none; 16.2.0; 16.x; defer minor), `storybook` (10.5.5; 10.5.8; 10.5.8; 10.x; patch), `typescript-eslint` (8.65.0; none; 8.67.0; 8.x; defer minor), `webpack` (5.109.1; 5.109.2; 5.109.2; 5.x; patch), `jose` in `server` (6.2.4; 6.2.9; 6.2.9; 6.x; patch). No eligible major is selected; major work remains deferred. The open Dependabot PR `#3825` proposes the same group but is behind on the cooldown-safe patch targets.
- Patch pass pending. Root list: `@storybook/react@10.5.8`, `@storybook/react-webpack5@10.5.8`, `storybook@10.5.8`, `@testing-library/user-event@14.6.4`, `postcss@8.5.26`, `webpack@5.109.2`. Server list: `jose@6.2.9`.
- Patch pass applied. `resolutions` review: all existing overrides remain active in the lockfile and are retained; no override had a safe in-scope bump or removal, and no new override was added. Changelog updated. No dedicated Dependabot-alert tool is available for the post-pass recheck; open PR `#3825` remains the overlapping dependency PR.
- Minor-pass approval received after commit `9071ed10`. Fresh UTC cutoff for this pass: `2026-08-17T10:11:58.067Z`.
- Minor pass applied to root only: `@grafana/faro-web-sdk@2.9.0`, `@grafana/faro-web-tracing@2.9.0`, `@sentry/react@10.70.0`, `@typescript-eslint/parser@8.67.0`, `cypress@15.20.1`, `lint-staged@17.3.0`, `postcss-import@16.2.0`, and `typescript-eslint@8.67.0`. No server minor candidate was identified.
- Minor-pass `resolutions` review: existing overrides remain active and justified in the lockfile, including `@opentelemetry/core@2.8.0`, `tar@7.5.21`, and `undici@6.27.0`; no override was bumped or removed and no new override was added. Changelog updated. No dedicated Dependabot-alert tool is available; the known overlapping open dependency PR is `#3825`.
- Post-commit recheck cutoff: `2026-08-17T10:24:53.264Z`. Full direct-dependency audit found missed eligible targets: Aksel packages `8.16.1` (minor), `react-hook-form@7.85.0` (minor), `@testing-library/jest-dom@6.10.0` (minor), `dayjs@1.11.22`, `react-intl@10.1.22`, `@types/lodash@4.17.25`, `@types/node@25.9.5`, `@types/react@19.2.18`, `@types/react-dom@19.2.4`, and `eslint@9.39.5` (patch). Newer same-major versions are cooldown-blocked: `dayjs@1.11.23`, `react-hook-form@7.86.0`, `react-intl@10.1.23`, and `@types/react-dom@19.2.5`; older eligible versions were selected as required. `@navikt/oasis` registry metadata returned 404 and remains unchanged pending registry access.
- Recheck correction applied: the 14 verified root updates are now in `package.json` and `yarn.lock`. React Intl required targeted eligible resolutions for `@formatjs/intl@4.1.18`, `intl-messageformat@11.2.13`, and `@formatjs/icu-messageformat-parser@3.5.16`; Yarn rejected the newer transitive versions because they were inside the cooldown window. No server update was needed.

## Outcome

- Patch pass changed `package.json`, `server/package.json`, `yarn.lock`, `docs/CHANGELOG.md`, and this task file. Selected versions: `@storybook/react`, `@storybook/react-webpack5`, `storybook` `10.5.8`; `@testing-library/user-event` `14.6.4`; `postcss` `8.5.26`; `webpack` `5.109.2`; `server/jose` `6.2.9`.
- Skipped cooldown candidates: Storybook `10.5.9`/`10.5.10`, user-event `14.6.5`/`14.6.6`, and jose `6.2.10`. Deferred to minor: Faro `2.9.0`, Sentry React `10.70.0`, TypeScript ESLint `8.67.0`, Cypress `15.20.1`, lint-staged `17.3.0`, and postcss-import `16.2.0`. Major candidates remain separate follow-ups.
- `resolutions`: retained all existing overrides after both reviews; no safe bump or removal identified. Post-pass Dependabot alerts could not be queried because no dedicated alert tool was available. Final open dependency PR overlap remains `#3825` (patch/minor group), plus separate PRs for designsystem, GitHub packages, React Hook Form, and React Intl. Validation: `yarn explain peer-requirements` completed with the known `eslint` peer warning; `yarn lint`, `yarn tsc --noEmit`, `yarn test --maxWorkers=2` (64 suites, 457 tests), `yarn build`, and `yarn install --immutable` passed. `yarn test:e2e` is relevant to the runtime packages and the terminal context reports exit code 0. Major follow-ups remain `react-router`/`react-router-dom` v8 and other major candidates; no major was attempted. Minor pass complete; stop before commit.
- Recheck outcome: corrected the committed dependency pass with 14 previously missed root updates and three cooldown-safe FormatJS resolutions. Recheck validation passed with `yarn install --immutable`, `yarn lint`, `yarn tsc --noEmit`, `yarn test --maxWorkers=2` (64 suites, 457 tests), and `yarn build`; the known `eslint` peer warning remains. E2E was not rerun for these corrected runtime-critical updates without explicit approval. `@navikt/oasis` remains unverified because the available registry returned 404; no server dependency was changed. The corrected changes are uncommitted and ready for review.
