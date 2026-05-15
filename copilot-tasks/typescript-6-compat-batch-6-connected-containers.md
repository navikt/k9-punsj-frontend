# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Prepare the sixth TypeScript 6 compatibility batch for connected container typing
- Branch: `refactor/typescript-6-compat-batch-6-connected-containers`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Fix the next `TypeScript 6` `connect(...)` and HOC typing errors in the remaining connected containers.
- Keep this batch limited to `PSB`, `OMPKS`, and `OLP` container typing without mixing in schema or package work.

## Scope

- Allowed files:
  - `src/app/søknader/pleiepenger/containers/PSBPunchForm.tsx`
  - `src/app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm.tsx`
  - `src/app/søknader/opplæringspenger/containers/OLPPunchFormContainer.tsx`
  - `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx` only if a tiny test update is needed
  - `copilot-tasks/typescript-6-compat-batch-6-connected-containers.md`
- Out of scope:
  - `src/app/søknader/opplæringspenger/schema.ts`
  - `Formik` generic cleanup in `OMPMA`
  - broad Redux refactors or action rewrites
  - `package.json` and `yarn.lock`
- Constraints:
  - keep the change scoped
  - preserve runtime behavior
  - avoid broad casts and `any`
  - prefer prop and HOC type alignment over larger refactors

## Validation

- Commands:
  - `yarn tsc --noEmit -p tsconfig.json`
  - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`
  - `yarn test src/test/containers/pleiepenger/PSBPunchForm.spec.tsx --runInBand`
- Skip or limitation note:
  - if no test file needs changes, still run the existing PSB container test and report the result

## Prompt for Copilot

Follow `copilot-tasks/typescript-6-compat-batch-6-connected-containers.md`. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Fix the current `TypeScript 6` `TS2345` connected container typing errors in:

- `src/app/søknader/pleiepenger/containers/PSBPunchForm.tsx`
- `src/app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm.tsx`
- `src/app/søknader/opplæringspenger/containers/OLPPunchFormContainer.tsx`

Keep the work limited to those files unless `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx` needs a tiny update. Align the `connect(...)`, `withHooks`, `withIntl`, state props, and dispatch props typing so the current runtime composition still works under `TypeScript 6`. Preserve runtime behavior, avoid `as any`, avoid broad casts, and do not mix in `schema.ts`, `Formik` cleanup, package changes, or broader Redux refactors. Run `yarn tsc --noEmit -p tsconfig.json`, `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`, and `yarn test src/test/containers/pleiepenger/PSBPunchForm.spec.tsx --runInBand`, then record the exact results in `Outcome`.

Suggested starter prompt:

- `Follow copilot-tasks/typescript-6-compat-batch-6-connected-containers.md. First update Plan, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

- 3 to 6 short steps.

## Progress notes

- Short factual notes only.

## Outcome

- Changed files:
- Validation:
- Remaining follow ups:
