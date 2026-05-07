# Copilot task

## Task

- Title: Upgrade frontend to React 19 and resolve direct migration fallout
- Branch: `refactor/react-19-upgrade`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Upgrade the repo from React 18 to the current React 19 line with the smallest safe change set.
- Resolve only the code, test, and Storybook fallout that is directly required by the React 19 migration.

## Context

- The repo currently uses `react@18.3.1`, `react-dom@18.3.1`, `@types/react@18.3.26`, and `@types/react-dom@18.3.7`.
- `react-intl@10.1.4` currently requires `react: 19` and `@types/react: 19`, so `yarn explain peer-requirements` already reports unmet React peers (`p179c05` and `paf66b6`).
- The app bootstrap already uses `createRoot` in `src/app/App.tsx`, so this is unlikely to be a large entrypoint migration.
- The main risk areas are async test behavior, Storybook, and older class based form containers.
- Keep this work separate from Aksel v8, general dependency cleanup, Redux exit, and `react-hook-form` migration.

## Scope

- Allowed files or areas:
  - `package.json`
  - `yarn.lock`
  - `src/app/App.tsx` if a direct React 19 bootstrap adjustment is required
  - `.storybook/**`
  - `src/test/**`
  - source files directly affected by React 19 compile, runtime, or test fallout
  - `docs/CHANGELOG.md` if the upgrade merits a short contributor note
  - `copilot-tasks/react-19-upgrade.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
  - Aksel v8 migration
  - broader package cleanup or unrelated version bumps
  - Redux architecture changes
  - `react-hook-form` migration work
  - large refactors of legacy class components unless strictly required for React 19 compatibility
  - local `docsLocal/**`

## Relevant files

- `package.json`
- `src/app/App.tsx`
- `.storybook/main.ts`
- `.storybook/preview.ts`
- `src/test/testUtils.tsx`
- `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx`
- `src/test/containers/pleiepenger/Periodepaneler.spec.tsx`
- `src/test/components/pdf/PdfVisning.spec.tsx`
- `src/app/søknader/pleiepenger/containers/PSBPunchForm.tsx`
- `src/app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm.tsx`
- `src/app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm.tsx`
- `src/app/søknader/opplæringspenger/containers/InstitusjonSelector.tsx`

## Constraints

- Use the current stable React 19 line available from the registry at execution time.
- Prefer the smallest compatibility fixes. Do not modernize code just because React 19 is available.
- Keep `react-intl@10.1.4` unless the React 19 upgrade exposes a concrete blocker that forces a coordinated change.
- Do not mix Aksel v8 or unrelated dependency upgrades into this task.
- Treat class components and `UNSAFE_Combobox` as regression hotspots, not automatic refactor targets.
- Pay special attention to async tests using `act(...)`, Storybook webpack wiring, and runtime behavior in the legacy punch flows.
- If a validation failure is clearly pre existing or unrelated, document it in `Outcome` instead of broadening scope to fix everything.
- Assess whether any runtime change needs a test update, and add the narrowest relevant coverage.

## Validation

- Commands to run:
  - `yarn explain peer-requirements`
  - `yarn tsc --noEmit`
  - `yarn lint`
  - `yarn test --maxWorkers=2`
  - `yarn build`
  - `yarn build-storybook`
- If one or more commands fail, separate direct React 19 fallout from pre existing failures in `Outcome`.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, exact React package versions, validation results, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution.

## Prompt for Copilot

Upgrade the repo from React 18 to React 19 in the smallest safe way. Start by updating the `Plan` section in this task file. Bump `react`, `react-dom`, `@types/react`, and `@types/react-dom` to the current stable React 19 line, keep `react-intl@10.1.4`, and fix only the code, test, or Storybook fallout that is directly required by this upgrade. Do not mix in Aksel v8 or unrelated cleanup. Use the hotspot files listed above first when investigating failures. Finish by updating `Outcome` with changed files, exact versions, validation results, and any remaining risks or follow ups.

Suggested starter prompt for chat:

- `Follow copilot-tasks/react-19-upgrade.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

- To be filled in before implementation starts.

## Progress notes

- Keep short factual notes while working.

## Outcome

- Changed files:
- Validation:
- Remaining risks or follow ups:
