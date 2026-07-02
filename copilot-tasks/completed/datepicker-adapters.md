# Copilot task

## Task

- Title: Clean up legacy date and period adapters
- Branch: `fix/legacy-date-picker-cleanup`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Remove active usage of the old date and period wrappers.
- Keep the active legacy layer around these public components:
    - `Datovelger`
    - `DatovelgerFormik`
    - `Periodevelger`
    - `PeriodevelgerFormik`

## Scope

- Remove active usage of legacy wrappers:
    - `src/app/components/skjema/NewDateInput/**`
    - `src/app/components/formikInput/DatoInputFormikNew.tsx`
    - `src/app/components/period-input/PeriodInput.tsx`
    - `src/app/components/timefoering/PeriodevelgerControlled.tsx`
    - `src/app/components/skjema/Datovelger/Periodevelger.tsx`
- Move remaining form usage to the new adapters.
- Keep React Hook Form out of scope.

## Validation

- Commands:
    - `yarn test --testPathPatterns="DatovelgerBase|Periodevelger|Datovelger"`
    - `yarn tsc --noEmit`
    - `yarn lint`
- Note:
    - Validation was handled manually outside this archived task file.

## Prompt for Copilot

Follow `copilot-tasks/completed/datepicker-adapters.md`.

First update `Plan`, then implement the cleanup. Remove active usage of `NewDateInput`, `DatoInputFormikNew`, `PeriodInput`, the old `timefoering/PeriodevelgerControlled`, and the old `skjema/Datovelger/Periodevelger`.

Use the new adapters everywhere current legacy forms still need them. Do not add React Hook Form work. Keep period validation at period level, not as date field validation. Keep progress notes short and finish by updating `Outcome`.

## Plan

1. Verify all current imports of legacy date and period wrappers. Completed.
2. Replace old wrappers with the active date and period adapters. Completed.
3. Stabilize period and date error presentation where the shared components are responsible. Completed.
4. Update focused tests and record validation status. Completed.

## Progress notes

- Removed active usage of `NewDateInput`, `DatoInputFormikNew`, `PeriodInput`, the old `PeriodevelgerControlled`, and the old `skjema/Datovelger/Periodevelger`.
- Moved remaining legacy forms to `Datovelger`, `DatovelgerFormik`, `Periodevelger`, and `PeriodevelgerFormik`.
- Stabilized shared period and date error rendering, including submit driven errors from backend validation.

## Outcome

- Final state:
    - `Datovelger` is the active legacy date component outside Formik.
    - `DatovelgerFormik` is the active Formik date component.
    - `Periodevelger` is the active legacy period component outside Formik.
    - `PeriodevelgerFormik` is the active Formik period component.
- Remaining follow up work is tracked separately in `task-punch-form-ui-cleanup.md` and `task-react-hook-form-date-adapters-and-storybook.md`.
