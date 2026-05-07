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
- A targeted test cleanup pass has already been prepared before this upgrade:
    - `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx`
    - `src/test/containers/pleiepenger/Periodepaneler.spec.tsx`
    - `src/test/components/pdf/PdfVisning.spec.tsx`
- That cleanup removed a large amount of unnecessary `act(...)`, but two modal-opening tests in `PSBPunchForm.spec.tsx` intentionally still use `act(...)` because Aksel `Modal` triggers async observer-driven updates.
- `src/app/components/page/Page.tsx` is already converted from a class component to a function component and is no longer part of the React 19 hotspot list.
- The main remaining risk areas are async test behavior around legacy modals, Storybook, and older class based form containers.
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
- Pay special attention to Storybook webpack wiring, runtime behavior in the legacy punch flows, and the remaining modal-related async tests in `PSBPunchForm.spec.tsx`.
- Do not reintroduce broad `act(...)` wrappers in the cleaned test suites unless React 19 proves they are genuinely required.
- If a validation failure is clearly pre existing or unrelated, document it in `Outcome` instead of broadening scope to fix everything.
- Assess whether any runtime change needs a test update, and add the narrowest relevant coverage.

## Plan

1. Bump `react`, `react-dom`, `@types/react`, and `@types/react-dom` to the newest stable React 19 versions allowed by the repo's 7-day npm cooldown (`react@19.2.5`, `react-dom@19.2.5`, `@types/react@19.2.9`, `@types/react-dom@19.2.3`). The freshest releases (`react@19.2.6`, `@types/react@19.2.14`) were inside the cooldown window at execution time, so we deliberately picked the next older stable line.
2. Run `yarn install` to update `yarn.lock` and surface peer conflicts.
3. Run `yarn tsc --noEmit` and fix any direct React 19 type breaks in source and test files.
4. Run `yarn test --maxWorkers=2` and fix only test failures that are direct React 19 fallout.
5. Run `yarn lint`, `yarn build`, and `yarn build-storybook` to confirm no remaining blockers.
6. Update `docs/CHANGELOG.md` with a short contributor note and fill in `Outcome`.

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

Upgrade the repo from React 18 to React 19 in the smallest safe way. Start by updating the `Plan` section in this task file. Bump `react`, `react-dom`, `@types/react`, and `@types/react-dom` to the current stable React 19 line, keep `react-intl@10.1.4`, and fix only the code, test, or Storybook fallout that is directly required by this upgrade. Do not mix in Aksel v8 or unrelated cleanup. Treat the recent test cleanup as the baseline, keep the two intentional modal-related `act(...)` cases under review, and use the hotspot files listed above first when investigating failures. Finish by updating `Outcome` with changed files, exact versions, validation results, and any remaining risks or follow ups.

Suggested starter prompt for chat:

- `Follow copilot-tasks/react-19-upgrade.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Progress notes

- Picked `react@19.2.5` / `@types/react@19.2.9` instead of the absolute latest because `19.2.6` and `19.2.14` were still inside the 7-day cooldown window on execution day.
- Yarn first reported `react-dom@19.2.6: No candidates found` due to cooldown, which confirmed the cooldown filter is active. Lowering versions resolved install.
- React 19 broke the global `JSX` namespace, `useRef()` no-arg overload, `RefObject<T>` non-null assumption, and `cloneElement` props inference. All four were fixed with the smallest safe shims; no class components or test suites were touched.

## Outcome

- Changed files:
    - `package.json` — bumped React + React DOM and their `@types`.
    - `yarn.lock` — regenerated by `yarn install`.
    - `globals.d.ts` — re-exposed the global `JSX` namespace (`Element`, `IntrinsicElements`, `ElementType`, `IntrinsicAttributes`) via `React.JSX` so existing `JSX.Element` references in 27+ files keep compiling without touching each file.
    - `src/app/hooks/usePrevious.ts` — updated the hook typing to stay compatible with React 19's stricter `useRef` and return-type expectations.
    - `src/app/hooks/useFocus.ts` — widened the optional `inputRef` param to `React.RefObject<HTMLInputElement | null>` to match React 19's `useRef(null)` return type.
    - `src/app/components/calendar/TidsbrukKalender.tsx` — adjusted the `ModalContent` / `React.cloneElement(...)` typing to satisfy React 19's stricter `cloneElement` inference without changing runtime behavior.
    - `copilot-tasks/completed/react-19-upgrade.md` — archived summary updated to match the final implementation.
- Exact React versions installed:
    - `react@19.2.5`
    - `react-dom@19.2.5`
    - `@types/react@19.2.9`
    - `@types/react-dom@19.2.3`
    - `react-intl@10.1.4` left unchanged; its React 19 peer is now satisfied.
- Validation results:
    - `yarn explain peer-requirements` — the previous `p179c05` and `paf66b6` React peer mismatches are gone. Four unmet peers remain, all pre-existing Storybook self-bundling issues unrelated to React 19: `@storybook/addon-webpack5-compiler-swc` not providing `webpack` to `swc-loader`, and `storybook@10.3.6` not providing `@testing-library/dom` / `react` / `react-dom` to `@storybook/icons` and `@testing-library/user-event`.
    - `yarn tsc --noEmit` — clean.
    - `yarn lint` — clean.
    - `yarn test --maxWorkers=2` — 62 suites, 436 tests passed. The two intentional modal-related `act(...)` cases in `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx` were left untouched and still pass; no broad `act(...)` reintroduction was needed.
    - `yarn build` — exit 0 (Browserslist age warning only, pre-existing).
    - `yarn build-storybook` — exit 0, output to `storybook-static/`. Only the pre-existing entrypoint size warning was emitted.
- Remaining risks and follow ups:
    - The global `JSX` namespace shim in `globals.d.ts` is a deliberate small-change tactic. A follow-up clean-up should migrate the 27+ source files to `import type { JSX } from 'react'` (or `React.JSX.Element`) and remove the shim. Only the four members listed above are re-exported; any new code reaching for other `JSX.*` members will fail until migrated.
    - `usePrevious` keeps its pre-existing `any` cast and lies about the return type (`T` instead of `T | undefined`). Not a regression, but worth tightening in a separate task.
    - `TidsbrukKalender.ModalContent` is now typed as `React.ReactElement<any>` with a scoped `eslint-disable`. A precise prop type for the modal contents would replace the `any` in a follow-up.
    - No browser smoke test of the legacy punch flows (PSB / PLS / OMP-KS / OLP) was performed; only Jest, build, and Storybook were run. Manual click-through of those flows in dev is recommended before release.
    - The four residual Storybook peer warnings should be tracked separately and are not in scope for this React 19 upgrade.
