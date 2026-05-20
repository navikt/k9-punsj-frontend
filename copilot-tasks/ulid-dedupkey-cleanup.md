# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Remove unused ulid dependency and dedupKey flow
- Branch: `chore/remove-ulid-dependency`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Remove the direct `ulid` dependency if it is no longer needed by the frontend.
- Clean up the frontend `dedupKey` flow if it is only historical residue and not part of the active backend contract.

## Scope

- Allowed files:
  - `package.json`
  - `yarn.lock`
  - `src/app/state/reducers/FellesReducer.ts`
  - `src/app/models/types/RequestBodies.ts`
  - `src/app/api/api.ts`
  - directly affected call sites that still pass `dedupKey`
  - directly affected tests only if needed
  - `copilot-tasks/ulid-dedupkey-cleanup.md`
- Out of scope:
  - broader package cleanup
  - unrelated `uuid` refactors
  - backend changes
  - fixing every unstable React key in the repo
- Constraints:
  - keep the change scoped
  - preserve existing user visible behavior
  - keep `uuid` in place
  - do not introduce a replacement package
  - follow `AGENTS.md`

## Validation

- Commands:
  - `yarn install`
  - `yarn lint`
  - `yarn tsc --noEmit -p tsconfig.json`
- Skip or limitation note:
  - run a focused Jest test only if the touched reducer or flow has local coverage worth updating

## Prompt for Copilot

Follow this task file. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Investigate and remove the frontend only `ulid` dependency if it is only used for the `dedupKey` state in the journalpost copy flow. Keep `uuid` unchanged. Remove `dedupKey` from the frontend call chain only if the current frontend and backend code shows it is not part of the active request contract. Limit the work to the allowed files and directly affected tests. Run `yarn install`, `yarn lint`, and `yarn tsc --noEmit -p tsconfig.json`, then record the result in `Outcome`.

Suggested starter prompt:

- `Follow copilot-tasks/ulid-dedupkey-cleanup.md. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.`

## Plan

- 3 to 6 short steps.

## Progress notes

- Short factual notes only.

## Outcome

- Changed files:
- Validation:
- Remaining follow ups:
