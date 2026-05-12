# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Add non-blocking warning when barn autofill fails in Personvelger
- Branch: `refactor/typescript-6-compat-batch-3-standalone`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Show a small non-blocking warning when `Personvelger` fails to auto-fetch barn for the `OMPMA` flow.
- Keep the form usable and do not turn this into a validation error.

## Scope

- Allowed files:
  - `src/app/components/person-velger/Personvelger.tsx`
  - `src/app/components/person-velger/personvelger.css`
  - a tiny nearby test only if it is very small and local
  - `copilot-tasks/personvelger-barn-warning.md`
- Out of scope:
  - broader form refactors
  - blocking validation or submit changes
  - `OMPUT` behavior changes beyond what falls out of the shared component
  - `package.json` and `yarn.lock`
- Constraints:
  - keep the change scoped
  - reuse existing patterns and Aksel components
  - follow `AGENTS.md`
  - use a non-blocking warning, not a validation error
  - preserve manual fallback via `Legg til person`

## Validation

- Commands:
  - `yarn tsc --noEmit -p tsconfig.json`
  - `yarn lint`
- Skip or limitation note:
  - add a focused test only if it is very small and local to the component

## Prompt for Copilot

Follow this task file. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Add a small non-blocking warning in `src/app/components/person-velger/Personvelger.tsx` for the case where `hentBarn(...)` returns `Error` while `populerMedBarn` is enabled. Keep the form usable, do not turn this into a validation error, and preserve manual fallback through `Legg til person`. Limit the work to `Personvelger` and local styling unless a tiny local test is trivial. Run `yarn tsc --noEmit -p tsconfig.json` and `yarn lint`, then record the result in `Outcome`.

Suggested starter prompt:

- `Follow copilot-tasks/personvelger-barn-warning.md. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.`

## Plan

- 3 to 6 short steps.

## Progress notes

- Short factual notes only.

## Outcome

- Changed files:
- Validation:
- Remaining follow ups:
