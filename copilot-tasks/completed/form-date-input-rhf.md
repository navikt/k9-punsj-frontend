# Copilot task

## Task

- Title: Add a React Hook Form date input primitive
- Branch: `refactor/form-date-input-rhf`
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: `English`

## Goal

- This scope is complete and folded into `datepicker-adapters.md`.
- `FormDateInput` is now the RHF date primitive and should be maintained through the broader date adapter task rather than as a separate foundation task.

## Context

- `src/app/components/form` already contains RHF primitives for text fields, textarea, select, checkbox, checkbox group, and radio group.
- There is still no date input in that RHF layer.
- The current date landscape is split across `Datovelger`, `DatovelgerControlled`, `DatovelgerFormik`, `NewDateInput`, `DatoInputFormikNew`, and related wrappers.
- `NewDateInput` is already deprecated and recently caused a real blur commit bug in PSB, which makes a cleaner RHF path more urgent.
- `Datovelger` is not yet a drop in replacement for all legacy flows. Older screens still depend on semantics that do not fully match the current `Datovelger` family, especially around `onBlur`, manual typing, and commit timing.
- This task is intentionally smaller than the full date adapter unification task. It should create a solid RHF primitive without trying to migrate the whole app.

## Scope

- Allowed files or areas:
    - `src/app/components/form/**`
    - the chosen shared date base in `src/app/components/skjema/**`
    - `src/test/**` for targeted unit tests
    - `src/storybook/stories/**` for one or two small RHF date stories
    - `copilot-tasks/form-date-input-rhf.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
    - app wide migration from Formik to RHF
    - removal of all legacy date wrappers
    - Redux architecture changes
    - React 19 work
    - local `docsLocal/**`

## Relevant files

- `src/app/components/form/index.ts`
- `src/app/components/form/getTypedFormComponents.tsx`
- `src/app/components/form/FormField.tsx`
- `src/app/components/skjema/Datovelger/Datovelger.tsx`
- `src/app/components/skjema/Datovelger/DatovelgerControlled.tsx`
- `src/app/components/skjema/NewDateInput/NewDateInput.tsx`

## Constraints

- Use the selected shared date base directly. Do not build RHF on top of `DatoInputFormikNew`.
- Match the style and typing patterns used by the existing `Form*` components in `src/app/components/form`.
- Keep the public API small and predictable.
- Add focused tests for:
    - valid date input
    - clear behavior
    - blur and touched behavior
    - error rendering
- Add only small documentation stories.
- Do not migrate existing business flows in this task unless one tiny adoption example is clearly needed to prove the primitive.

## Validation

- Commands to run:
    - `yarn tsc --noEmit`
    - `yarn lint`
    - `yarn test --maxWorkers=2`
    - `yarn build-storybook`
- If one or more commands fail, explain whether the failure is directly caused by this task.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution. The user handles task lifecycle manually.

## Prompt for Copilot

Add one official React Hook Form date input primitive in `src/app/components/form`. Start by updating the `Plan` section in this task file. Build it directly on top of the chosen shared date base, not through Formik wrappers. Keep the scope small, add targeted tests and one or two simple Storybook stories, and finish by updating `Outcome` with changed files, validation results, and the next most obvious migration candidates.

Suggested starter prompt for chat:

- `Follow copilot-tasks/form-date-input-rhf.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

- To be filled in before implementation starts.

## Progress notes

- `FormDateInput` was implemented as part of the broader date adapter pass.
- RHF wiring now goes directly through the shared controlled date base.
- Storybook coverage and targeted tests for the RHF path were added together with the shared date layer work.

## Outcome

- Changed files:
  - `src/app/components/form/FormDateInput.tsx`
  - `src/app/components/form/index.ts`
  - `src/app/components/form/types.ts`
  - `src/app/components/form/getTypedFormComponents.tsx`
  - `src/storybook/stories/DateInputAdapters.stories.tsx`
  - `src/test/components/form/FormDateInput.spec.tsx`
- Validation:
  - `yarn tsc --noEmit` green
  - `yarn build-storybook` green
  - `yarn test --runInBand src/test/components/form/FormDateInput.spec.tsx` green
- Remaining risks or follow ups:
  - New RHF adoption should now happen as part of wider screen migration, not by adding more parallel date wrappers.
