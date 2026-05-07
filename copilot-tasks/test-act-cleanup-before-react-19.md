# Copilot task

## Task

- Title: Clean up `act(...)` usage before the React 19 upgrade
- Branch: `refactor/test-act-cleanup-before-react-19`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Reduce avoidable manual `act(...)` usage in the most relevant RTL/Jest suites before the React 19 upgrade.
- Improve async test patterns without changing runtime behavior or mixing in the React version bump.

## Context

- The repo has several legacy test suites with explicit `act(...)`, especially around older punch form containers.
- React 19 is expected to make async timing and test warnings more visible, so a targeted cleanup before the version bump should improve the baseline.
- The highest value hotspots currently look like `PSBPunchForm.spec.tsx`, `Periodepaneler.spec.tsx`, and `PdfVisning.spec.tsx`.
- This task is preparation work only. Keep it separate from React 19, Aksel v8, RHF migration, and broader test strategy work.

## Scope

- Allowed files or areas:
    - `src/test/**`
    - co-located `*.spec.*` files if they are part of direct `act(...)` cleanup
    - `src/test/testUtils.tsx` if helper cleanup is directly useful
    - `docs/CHANGELOG.md` only if you believe this testing cleanup merits a short contributor note
    - `copilot-tasks/test-act-cleanup-before-react-19.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
    - `package.json`
    - React version changes
    - production component refactors unless a tiny direct testability fix is strictly required
    - broad test rewrites outside the hotspot suites

## Relevant files

- `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx`
- `src/test/containers/pleiepenger/Periodepaneler.spec.tsx`
- `src/test/components/pdf/PdfVisning.spec.tsx`
- `src/test/testUtils.tsx`
- `src/app/søknader/pleiepenger/containers/PSBPunchForm.tsx`

## Constraints

- Keep the change scoped to test cleanup before React 19.
- Do not mix this with the actual React 19 upgrade.
- Do not remove `act(...)` mechanically. Keep it where it is genuinely required for correct async flushing.
- Prefer Testing Library idioms where they make the tests simpler and more stable, for example `findBy*`, `waitFor`, and user driven interactions.
- Preserve current behavior coverage. This task should reduce noise, not weaken the tests.
- If a failing test reveals production code issues, document that clearly in `Outcome` instead of expanding scope by default.

## Validation

- Commands to run:
    - `yarn test --maxWorkers=2`
    - `yarn lint`
    - `yarn tsc --noEmit`
- If one or more checks are too expensive or unstable, explain that clearly in `Outcome`.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation results, and remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution.

## Prompt for Copilot

Clean up the most valuable `act(...)` hotspots before the React 19 upgrade. Start by updating the `Plan` section in this task file. Focus on `PSBPunchForm.spec.tsx`, `Periodepaneler.spec.tsx`, `PdfVisning.spec.tsx`, and related test helpers. Remove only avoidable manual `act(...)` usage, prefer stable Testing Library async patterns where they clearly improve the tests, and do not mix in any React version bump or broad refactor. Finish by updating `Outcome` with changed files, validation results, and remaining risks or follow ups.

Suggested starter prompt for chat:

- `Follow copilot-tasks/test-act-cleanup-before-react-19.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

1. Clean up `PdfVisning.spec.tsx`: replace `act(() => { el.click() })` with `fireEvent.click(el)`, remove `act` import.
2. Clean up `Periodepaneler.spec.tsx`: remove `await act(async () => { setupPeriodepaneler() })` render wrappers, remove `act` import.
3. Clean up `PSBPunchForm.spec.tsx`: remove unnecessary `await act(async () => {...})` wrappers around `setupPunchForm()` render calls, `fireEvent.click()` calls, and `userEvent` interactions, but keep `act` imported and used in the modal-opening tests that still require it. RTL 13+ wraps `render` and `fireEvent` in `act` internally, and `@testing-library/user-event` v14 manages `act` internally for standard interactions.
4. Run `yarn test --testPathPattern=PSBPunchForm|Periodepaneler|PdfVisning --maxWorkers=2`, `yarn lint`, and `yarn tsc --noEmit` to validate.

## Progress notes

- Read all three hotspot files; identified three pattern types: render-wrap, fireEvent-wrap, userEvent-wrap.
- Cleaned up all files; discovered two modal tests genuinely need `act()` (Aksel Modal uses MutationObserver → async React state update), so act was restored there.
- All 49 tests pass, lint and tsc clean after fixing duplicate import introduced during act restoration.

## Outcome

- Changed files:
    - `src/test/components/pdf/PdfVisning.spec.tsx` — removed `act` import; replaced `act(() => { el.click() })` with `fireEvent.click(el)`.
    - `src/test/containers/pleiepenger/Periodepaneler.spec.tsx` — removed `act` import; removed `await act(async () => { setup() })` render wrappers from both tests; tests changed from `async` to sync.
    - `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx` — `act` remains in the import because two modal-opening tests still need it; removed all other unnecessary `await act(async () => {...})` wrappers around `setupPunchForm()` render calls (~30 instances), `fireEvent.click()` calls (~15 instances), and `userEvent` interactions (2 instances). Kept `await act(async () => {...})` on the two `fireEvent.click` calls that open modals, because Aksel's `Modal` drives state via `MutationObserver` and genuinely triggers async React updates that need flushing.
- Validation:
    - `yarn test --testPathPatterns="PSBPunchForm|Periodepaneler|PdfVisning" --maxWorkers=2`: 49 tests pass, no act warnings.
    - `yarn lint`: no errors.
    - `yarn tsc --noEmit`: no errors.
- Remaining risks or follow ups:
    - The two modal tests retain `await act(async () => { fireEvent.click(...) })` because of the `MutationObserver`-driven state in `@navikt/ds-react` Modal. If Aksel v8 or React 19 changes how the modal manages state, those wrappers may become unnecessary or need replacing with `userEvent.click`.
    - Other test suites outside the three hotspot files likely have the same render-wrap pattern. A broader sweep across `src/test/` is a natural follow-up once React 19 is adopted.
