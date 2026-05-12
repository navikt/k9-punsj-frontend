# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Prepare the fourth TypeScript 6 compatibility batch for union narrowing
- Branch: `refactor/typescript-6-compat-batch-3-standalone`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Fix the next small `TypeScript 6` app-level union narrowing errors in `ArbeidstidKalender` and `tilsyn/utils`.
- Keep this batch limited to those two related files and do not mix in Redux, Formik, or Yup work.

## Scope

- Allowed files:
  - `src/app/components/arbeidstid/ArbeidstidKalender.tsx`
  - `src/app/components/tilsyn/utils.ts`
  - a tiny nearby test only if it is very small and local
  - `copilot-tasks/typescript-6-compat-batch-4-union-narrowing.md`
- Out of scope:
  - Redux `connect(...)` and HOC typing
  - `Formik` generics
  - `Yup` schemas
  - `tsconfig.spec.json` and `cypress/tsconfig.json`
  - `package.json` and `yarn.lock`
- Constraints:
  - keep the change scoped
  - reuse existing patterns
  - follow `AGENTS.md`
  - avoid broad casts
  - preserve runtime behavior

## Validation

- Commands:
  - `yarn tsc --noEmit -p tsconfig.json`
  - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`
- Skip or limitation note:
  - add a focused test only if it is very small and local to the affected logic

## Prompt for Copilot

Follow this task file. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Fix the next `TypeScript 6` union narrowing errors in `src/app/components/arbeidstid/ArbeidstidKalender.tsx` and `src/app/components/tilsyn/utils.ts`. Keep the work limited to those files unless a tiny local test is trivial. Preserve runtime behavior, avoid broad casts, and do not touch Redux `connect(...)`, `Formik`, `Yup`, `tsconfig.spec.json`, `cypress`, `package.json`, or `yarn.lock`. Run `yarn tsc --noEmit -p tsconfig.json` and `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`, then record the result in `Outcome`.

Suggested starter prompt:

- `Follow copilot-tasks/typescript-6-compat-batch-4-union-narrowing.md. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.`

## Plan

- 3 to 6 short steps.

## Progress notes

- Short factual notes only.

## Outcome

- Changed files:
- Validation:
- Remaining follow ups:
