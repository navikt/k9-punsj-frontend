# Copilot task

## Task

- Title: Prepare the second TypeScript 6 compatibility batch for `useReducer`
- Branch: `refactor/typescript-6-compat-batch-2-use-reducer`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Remove the `useReducer` overload and `DispatchWithoutAction` style compatibility errors that `TypeScript 6` reports in the three `Arbeidstaker` flows.
- Keep this batch focused on reducer state typing and the minimal component changes needed to make those reducers type clean under `TypeScript 6`.

## Context

- The first low risk `TypeScript 6` compatibility batch is already done and the task file has been moved to `copilot-tasks/completed/`.
- The next clearly isolated group is the repeated `pfArbeidstakerReducer` pattern used in three places.
- Current problem pattern:
    - each reducer returns `Partial<State>`
    - `useReducer(...)` in the corresponding component then fails under `TypeScript 6`
    - that can cascade into incorrect `dispatch` typing and noisy follow on errors
- This batch should solve that repeated pattern cleanly before moving on to union narrowing, Redux `connect(...)`, or `Yup` schema typing.

## Scope

- Allowed files or areas:
    - `src/app/components/arbeidsforhold/containers/ArbeidstakerComponent.tsx`
    - `src/app/components/arbeidsforhold/state/reducers/pfArbeidstakerReducer.ts`
    - `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstaker/Arbeidstaker.tsx`
    - `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`
    - `src/app/søknader/opplæringspenger/containers/Arbeidsforhold/Arbeidstaker/Arbeidstaker.tsx`
    - `src/app/søknader/opplæringspenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`
    - nearby targeted tests only if a very small focused test can be added without pulling in UI setup noise
    - `copilot-tasks/typescript-6-compat-batch-2-use-reducer.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
    - `package.json` and `yarn.lock`
    - `ArbeidstidKalender.tsx`, `tilsyn/utils.ts`, or other union narrowing errors
    - Redux `connect(...)` and HOC typing
    - `Formik` generics
    - `Yup` schemas and validation helper redesign
    - `tsconfig.spec.json` and `cypress/tsconfig.json`
    - local `docsLocal/**`

## Relevant files

- `src/app/components/arbeidsforhold/containers/ArbeidstakerComponent.tsx`
- `src/app/components/arbeidsforhold/state/reducers/pfArbeidstakerReducer.ts`
- `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstaker/Arbeidstaker.tsx`
- `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`
- `src/app/søknader/opplæringspenger/containers/Arbeidsforhold/Arbeidstaker/Arbeidstaker.tsx`
- `src/app/søknader/opplæringspenger/containers/Arbeidsforhold/Arbeidstaker/pfArbeidstakerReducer.ts`

## Constraints

- Keep the change scoped to this task.
- Reuse existing repo patterns before adding abstractions.
- Follow `AGENTS.md`, `.github/copilot-instructions.md`, and any relevant file specific instructions in `.github/instructions/`.
- Do not include secrets, personopplysninger, or sensitive case data in prompts or examples.
- Stay consistent with the touched area for naming, styling, accessibility, workflows, auth, and security.
- Do not silence the issue with broad `as any`, `as unknown as`, or widened component state types.
- Prefer making the reducers return a real `State` and keeping action handling explicit over working around `useReducer` inference at the call site.
- Keep runtime behavior unchanged unless a tighter type exposes a real bug. If behavior must change, note it clearly in `Outcome`.
- If the same reducer pattern can be fixed identically in all three places, keep the implementation aligned across the copies.

## Validation

- Commands to run:
    - `yarn tsc --noEmit -p tsconfig.json`
    - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`
- Run `yarn lint` only if the touched files require formatting or lint sensitive edits beyond type signatures.
- If no focused test is practical, state that clearly in `Outcome`.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the task and allowed files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution. The user handles task lifecycle manually.

## Prompt for Copilot

Prepare the second `TypeScript 6` compatibility batch by fixing the repeated `useReducer` typing pattern in the three `Arbeidstaker` flows. Start by updating the `Plan` section in this file. Limit the implementation to the three `Arbeidstaker` components and their three `pfArbeidstakerReducer` files. Fix the reducers so they return a real `State`, make the `useReducer` call sites type clean under `TypeScript 6`, and keep runtime behavior unchanged. Do not touch package versions, Redux `connect(...)`, `Formik`, `Yup`, `ArbeidstidKalender`, `tilsyn/utils`, `tsconfig.spec.json`, or `cypress`. Finish by updating `Outcome` with changed files, validation results, and the next remaining TypeScript 6 batches.

Suggested starter prompt for chat:

- `Follow copilot-tasks/typescript-6-compat-batch-2-use-reducer.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

- To be filled in before implementation starts.

## Progress notes

- Keep short factual notes while working.

## Outcome

- Changed files:
- Validation:
- Remaining risks or follow ups:
