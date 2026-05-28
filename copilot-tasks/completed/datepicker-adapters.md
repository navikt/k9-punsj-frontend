# Copilot task

## Task

- Title: Align the date input layer around one base and three thin adapters
- Branch: `refactor/datepicker-adapters`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Reduce the current date input sprawl to one shared base implementation plus three thin adapters: Formik, controlled, and React Hook Form.
- Complete the initial app migration away from `NewDateInput` and `DatoInputFormikNew` without broad RHF conversion.

## Context

- The repo currently has multiple overlapping date input paths:
    - `src/app/components/skjema/Datovelger/Datovelger.tsx`
    - `src/app/components/skjema/Datovelger/DatovelgerControlled.tsx`
    - `src/app/components/skjema/Datovelger/DatovelgerFormik.tsx`
    - `src/app/components/skjema/NewDateInput/NewDateInput.tsx`
    - `src/app/components/formikInput/DatoInputFormikNew.tsx`
    - `src/app/components/skjema/Datovelger/Periodevelger.tsx`
- `NewDateInput` is already marked `@deprecated bruk Datovelger i stedet`, but the replacement is not trivial.
- `NewDateInput` is still widely used not just because it was left behind. `Datovelger` and related wrappers do not yet fully match the legacy semantics expected by older flows such as PSB and similar screens:
    - different `onBlur` contract
    - different commit timing between local input state and external updates
    - differences in manual typing behavior
    - differences around touched state and side effects
- There is currently no dedicated React Hook Form date field in `src/app/components/form`.
- A recent PSB bug showed that `NewDateInput` still carries risky blur semantics. The field value updated visually, but `updateSoknad` did not fire until a different field changed. That bug was traced to `NewDateInput` blur logic introduced in `Date picker fra ds (#2700)` on `2024-11-13`.
- Current usage counts from a repo scan:
    - `NewDateInput`: `10` files
    - `DatoInputFormikNew`: `12` files
    - `DatovelgerFormik`: `6` files
    - `DatovelgerControlled`: `2` files
    - `Datovelger`: `14` files including wrappers
    - `PeriodInput`: `7` files
    - `Periodevelger`: `10` files
- There are effectively no focused unit tests for these wrappers and no date specific Storybook stories.

## Scope

- Allowed files or areas:
    - `src/app/components/skjema/Datovelger/**`
    - `src/app/components/skjema/NewDateInput/**`
    - `src/app/components/formikInput/DatoInputFormikNew.tsx`
    - `src/app/components/period-input/PeriodInput.tsx`
    - `src/app/components/form/**`
    - `src/test/**` for targeted date input tests
    - `src/storybook/stories/**` for small date stories
    - `copilot-tasks/datepicker-adapters.md` for `Plan`, `Progress notes`, and `Outcome`
-- Out of scope:
    - broad migration of all existing call sites across the app beyond the current date wrapper cleanup
    - React 19 work
    - Aksel v8 migration
    - Redux architecture changes
    - removal of every legacy date wrapper in one PR
    - local `docsLocal/**`

## Relevant files

- `src/app/components/skjema/Datovelger/Datovelger.tsx`
- `src/app/components/skjema/Datovelger/DatovelgerControlled.tsx`
- `src/app/components/skjema/Datovelger/DatovelgerFormik.tsx`
- `src/app/components/skjema/NewDateInput/NewDateInput.tsx`
- `src/app/components/formikInput/DatoInputFormikNew.tsx`
- `src/app/components/period-input/PeriodInput.tsx`
- `src/app/components/form/index.ts`
- `src/app/components/form/getTypedFormComponents.tsx`

## Constraints

- Target architecture is one base implementation plus three thin adapters:
    - Formik
    - controlled for Redux or local state
    - React Hook Form
- Do not create a Redux store coupled adapter. The controlled adapter must stay form library agnostic.
- Do not route the RHF adapter through a Formik wrapper.
- Keep the API simple and consistent with existing `components/form` primitives.
- Add the narrowest useful test coverage for blur, change, clear, controlled sync, and error rendering.
- Storybook stories should be small and documentation oriented, not playground heavy.
- Do not assume `Datovelger` can simply replace `NewDateInput` everywhere. This task must align behavior first, not just rename components.
- Long term the Formik adapter should become removable after broader RHF migration, but do not force everything into one giant universal wrapper now.

## Validation

- Commands to run:
    - `yarn tsc --noEmit`
    - `yarn lint`
    - `yarn test --maxWorkers=2`
    - `yarn build-storybook`
- If one or more commands fail, separate direct date layer fallout from pre existing failures in `Outcome`.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution. The user handles task lifecycle manually.

## Prompt for Copilot

Audit the current date input layer and implement the smallest safe foundation for one shared date base plus three thin adapters: Formik, controlled, and React Hook Form. Start by updating the `Plan` section in this task file. Keep the scope limited to the date layer, tests, and simple Storybook stories. Do not migrate the whole app. Do not create a Redux specific adapter. Do not route RHF through Formik. Finish by updating `Outcome` with changed files, validation results, and a short note on what should migrate later.

Suggested starter prompt for chat:

- `Follow copilot-tasks/datepicker-adapters.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

- Add one shared date base for controlled input semantics and external value sync.
- Rewire the existing controlled, Formik, and deprecated date paths onto that shared base without broad usage migration.
- Add one RHF first date primitive in `components/form`.
- Add small interactive Storybook stories for controlled, Formik, and RHF adapters.
- Add targeted tests for change, blur commit, and external sync behavior.

## Progress notes

- Added `DatovelgerBase` as the shared controlled core for date input semantics.
- Rewired the controlled, Formik, and legacy date paths onto the shared base.
- Added `FormDateInput` plus typed exports for the RHF form layer.
- Added interactive Storybook stories for controlled, Formik, RHF, and period date adapters.
- Added targeted tests for controlled typing, blur commit, RHF wiring, legacy `NewDateInput`, and Formik adapter behavior.
- Migrated direct app usages away from `NewDateInput` and `DatoInputFormikNew`.
- Removed `DatoInputFormikNew` and the old `Datovelger` wrapper after the usage cleanup.
- Rechecked PSB and added focused Cypress coverage for Formik date updates in `OMPAO` and `OMPUT`.

## Outcome

- Changed files:
  - `src/app/components/skjema/Datovelger/DatovelgerBase.tsx`
  - `src/app/components/skjema/Datovelger/DatovelgerControlled.tsx`
  - `src/app/components/skjema/Datovelger/DatovelgerFormik.tsx`
  - `src/app/components/skjema/Datovelger/Periodevelger.tsx`
  - `src/app/components/skjema/NewDateInput/NewDateInput.tsx`
  - `src/app/components/form/FormDateInput.tsx`
  - `src/app/components/period-input/PeriodInput.tsx`
  - `src/app/components/arbeidsforhold/containers/ArbeidsforholdPanel.tsx`
  - `src/app/components/form/index.ts`
  - `src/app/components/form/types.ts`
  - `src/app/components/form/getTypedFormComponents.tsx`
  - `src/app/søknader/opplæringspenger/containers/Reisedager.tsx`
  - `src/app/søknader/pleiepenger/containers/OpplysningerOmSoknad/OpplysningerOmSoknad.tsx`
  - `src/app/søknader/pleiepenger-livets-sluttfase/containers/OpplysningerOmSoknad/OpplysningerOmPLSSoknad.tsx`
  - `src/app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OpplysningerOmSoknad/OpplysningerOmOMPKSSoknad.tsx`
  - `src/app/søknader/omsorgspenger-utbetaling/containers/OpplysningerOmSoknad/OpplysningerOmOMPUTSoknad.tsx`
  - `src/app/søknader/omsorgspenger-alene-om-omsorgen/containers/OpplysningerOmSoknad/OpplysningerOmOMPAOSoknad.tsx`
  - `src/app/søknader/pleiepenger/containers/Arbeidsforhold/ArbeidsforholdPanel.tsx`
  - `src/storybook/stories/DateInputAdapters.stories.tsx`
  - `src/test/components/skjema/DatovelgerControlled.spec.tsx`
  - `src/test/components/skjema/DatovelgerFormik.spec.tsx`
  - `src/test/components/form/FormDateInput.spec.tsx`
  - `src/test/components/skjema/NewDateInput.spec.tsx`
  - `cypress/e2e/omsorgspenger-alene-om-omsorgen/nySoknad.cy.js`
  - `cypress/e2e/omsorgspenger-utbetaling/nySoknad.cy.js`
- Validation:
  - `yarn tsc --noEmit` green
  - `yarn lint` green
  - `yarn test --maxWorkers=2 src/test/components/form/FormDateInput.spec.tsx src/test/components/skjema/DatovelgerControlled.spec.tsx src/test/components/period-input/PeriodInput.spec.tsx` green
  - `yarn build-storybook` green
  - `yarn test --runInBand src/test/components/period-input/PeriodInput.spec.tsx src/test/components/skjema/DatovelgerControlled.spec.tsx src/test/components/skjema/DatovelgerFormik.spec.tsx src/test/components/skjema/NewDateInput.spec.tsx` green
  - `yarn test:e2e --spec cypress/e2e/pleiepenger/PleiepengerPunsj.cy.js` green
  - `yarn test:e2e --spec cypress/e2e/omsorgspenger-alene-om-omsorgen/nySoknad.cy.js` green
  - `yarn test:e2e --spec cypress/e2e/omsorgspenger-utbetaling/nySoknad.cy.js` green
- Remaining risks or follow ups:
  - `NewDateInput` is no longer used directly from `src/app/**`, but it still exists as a transitional wrapper and regression target until the manual verification pass is done.
  - The long term direction is still to prefer RHF primitives like `FormDateInput` and let the Formik adapter become removable later.
