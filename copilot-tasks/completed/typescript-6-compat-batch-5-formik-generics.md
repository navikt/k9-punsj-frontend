# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Prepare the fifth TypeScript 6 compatibility batch for Formik generics
- Branch: `refactor/typescript-6-compat-batch-5-formik-generics`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Fix the next small `TypeScript 6` Formik generic mismatch in the `OMPMA` flow.
- Keep this batch limited to the `Formik` value type alignment in `OMPMAPunchFormContainer` and its immediate form prop contract.

## Scope

- Allowed files:
    - `src/app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchFormContainer.tsx`
    - `src/app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchForm.tsx`
    - a tiny nearby type-only helper or local test only if it is strictly needed
    - `copilot-tasks/typescript-6-compat-batch-5-formik-generics.md`
- Out of scope:
    - Redux state or action changes
    - `Yup` schema cleanup
    - `connect(...)` and HOC typing in other flows
    - `package.json` and `yarn.lock`
- Constraints:
    - keep the change scoped
    - preserve runtime behavior
    - avoid broad casts and `any`
    - align the form value type instead of weakening the prop contract

## Validation

- Commands:
    - `yarn tsc --noEmit -p tsconfig.json`
    - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`
- Skip or limitation note:
    - there may be no focused existing test for this exact `OMPMA` container, so note that explicitly if no local test is run

## Prompt for Copilot

Follow `copilot-tasks/typescript-6-compat-batch-5-formik-generics.md`. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Fix the `TypeScript 6` Formik generic mismatch in `src/app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchFormContainer.tsx`, where `FormikProps<{ ... }>` is no longer assignable to `FormikProps<IOMPMASoknad>`. Keep the work limited to `OMPMAPunchFormContainer.tsx` and `OMPMAPunchForm.tsx` unless a tiny local type-only helper is strictly needed. Align the actual form value type between `initialValues`, `<Formik>`, and the `formik` prop in `OMPMAPunchForm`. Preserve runtime behavior, avoid `as any`, avoid broad casts, and do not touch Redux state, schema logic, package files, or other flows. Run `yarn tsc --noEmit -p tsconfig.json` and `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`, then record the exact result in `Outcome`.

Suggested starter prompt:

- `Follow copilot-tasks/typescript-6-compat-batch-5-formik-generics.md. First update Plan, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

1. Annotate `initialValues` return type as `IOMPMASoknad` in `OMPMAPunchFormContainer.tsx`
2. Fix `new Set([])` → `new Set<string>()` to satisfy `Set<string>` field
3. Add `<Formik<IOMPMASoknad>>` generic to ensure type flows correctly
4. Remove unused `FormikValues` import if no longer needed
5. Run `yarn tsc --noEmit` and TS 6 validation

## Progress notes

- `initialValues` lacked return type annotation → inferred `Set<never>` for `journalposter` and loose union for `barn`
- `handleSubmit` used `as IOMPMASoknadUt` cast which failed once `FormikValues` was removed; replaced with proper `Set→Array` conversion
- No changes needed in `OMPMAPunchForm.tsx` — it already expects `FormikProps<IOMPMASoknad>`

## Outcome

- Changed files:
    - `src/app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchFormContainer.tsx`
    - `copilot-tasks/typescript-6-compat-batch-5-formik-generics.md`
- Validation:
    - `yarn tsc --noEmit -p tsconfig.json` — 0 errors
    - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json` — 0 errors in OMPMA files (23 pre-existing errors elsewhere)
- Remaining follow ups:
    - The 23 remaining TS6 errors are in other flows (covered by future batches)
