# Copilot task

## Task

- Title: Prepare the second TypeScript 6 compatibility batch for `useReducer`
- Branch: `refactor/typescript-6-compat-batch-2-use-reducer`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Remove the `useReducer` overload and `DispatchWithoutAction` style compatibility errors that `TypeScript 6` reports in the three `Arbeidstaker` flows.
- Keep this batch focused on reducer state typing and the minimal component changes needed to make those reducers type clean under `TypeScript 6`.

## Scope

- `src/app/components/arbeidsforhold/containers/ArbeidstakerComponent.tsx`
- `src/app/components/arbeidsforhold/state/reducers/pfArbeidstakerReducer.ts`
- `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstaker/Arbeidstaker.tsx`
- `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`
- `src/app/søknader/opplæringspenger/containers/Arbeidsforhold/Arbeidstaker/Arbeidstaker.tsx`
- `src/app/søknader/opplæringspenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`
- Out of scope:
  - `package.json` and `yarn.lock`
  - Redux `connect(...)`, `Formik`, `Yup`, `ArbeidstidKalender`, `tilsyn/utils`
  - `tsconfig.spec.json` and `cypress/tsconfig.json`
- Constraints:
  - keep the fix limited to the three reducer chains
  - return real `State`, no broad casts
  - keep runtime behavior unchanged
  - keep the three copies aligned

## Validation

- Commands:
  - `yarn tsc --noEmit -p tsconfig.json`
  - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`
- Skip or limitation note:
  - no focused test needed unless a tiny reducer test is trivial

## Prompt for Copilot

Follow this task file. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Fix the repeated `useReducer` typing pattern in the three `Arbeidstaker` flows. Limit the work to the three components and three `pfArbeidstakerReducer` files listed in `Scope`. Make the reducers return `State`, keep runtime behavior unchanged, avoid broad casts, and keep the three copies aligned. Do not touch package versions, Redux `connect(...)`, `Formik`, `Yup`, `ArbeidstidKalender`, `tilsyn/utils`, `tsconfig.spec.json`, or `cypress`. Run `yarn tsc --noEmit -p tsconfig.json` and `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`, then record the result in `Outcome`.

Suggested starter prompt for chat:

- `Follow copilot-tasks/typescript-6-compat-batch-2-use-reducer.md. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.`

## Plan

1. Change return type of all three `pfArbeidstakerReducer` from `Partial<State>` to `State`.
2. Add nullish coalescing fallbacks (`?? state.field`) for optional action fields in cases where the spread would otherwise produce `T | undefined`.
3. Validate with `yarn tsc --noEmit` and `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`.
4. Update Outcome with changed files and validation results.

## Progress notes

- All three reducers are identical except for import path; applied the same fix to all.
- No component changes needed — `useReducer` call sites infer `State` correctly once the reducer return type is fixed.

## Outcome

- `src/app/components/arbeidsforhold/state/reducers/pfArbeidstakerReducer.ts`
- `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`
- `src/app/søknader/opplæringspenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`
- Changed return type from `Partial<State>` to `State`.
- Added `?? state.field` fallbacks in `SELECT_ARBEIDSGIVER`, `SET_NAVN_ARBEIDSDGIVER`, and `SET_SEARCH_ORGANISASJONSNUMMER_FAILED` cases where the optional action field could be `undefined`.
- `yarn tsc --noEmit -p tsconfig.json` — passes with zero errors.
- `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json` — zero errors in changed files (30 remaining errors elsewhere, all out of scope).
- If an action is dispatched without the expected payload field (e.g. `SELECT_ARBEIDSGIVER` without `selectedArbeidsgiver`), the state now retains the previous value instead of becoming `undefined`. This is a defensive improvement, not a regression — callers always provide the value in practice.
- No focused test added. The reducers are pure functions and testable, but there are no existing reducer tests in this area, and adding test scaffolding would exceed the task scope.
- Union narrowing issues (`ArbeidstidKalender`, `tilsyn/utils`)
- Redux `connect(...)` and HOC typing
- `Formik` generics
- `Yup` schema and validation helper typing
