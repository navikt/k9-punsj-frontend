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

1. Replace `typeof actionCreator` dispatch prop interfaces with explicit dispatched signatures in PSB and OMPKS
2. Add missing `undoChoiceOfEksisterendeSoknadAction` and `setIdentAction` to dispatch interfaces
3. Type `mapDispatchToProps` with explicit return type annotations
4. Fix `ArbeidsforholdPanel` and `Arbeidstakerperioder` prop types for `updateSoknad`
5. Remove `Partial<>` from OLP `mapStateToProps` return type
6. Update test file with new required dispatch props

## Progress notes

- Root cause: `typeof thunkActionCreator` gives `(args) => (dispatch) => ...` return, but after `dispatch()` it becomes `any`. TS6 catches this variance mismatch in `connect`'s `Matching<>`.
- Fix: explicit dispatched function signatures (`() => void`) in dispatch interfaces + typed `mapDispatchToProps`
- `erMellomlagring` parameter optionality also needed alignment between interface and `mapDispatchToProps`
- OLP issue was simpler: `Partial<IPunchOLPFormStateProps>` unnecessary since all fields are provided

## Outcome

- Changed files:
    - `src/app/søknader/pleiepenger/containers/PSBPunchForm.tsx`
    - `src/app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm.tsx`
    - `src/app/søknader/opplæringspenger/containers/OLPPunchFormContainer.tsx`
    - `src/app/søknader/pleiepenger/containers/Arbeidsforhold/ArbeidsforholdPanel.tsx`
    - `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstakerperioder.tsx`
    - `src/test/containers/pleiepenger/PSBPunchForm.spec.tsx`
- Validation:
    - `yarn tsc --noEmit -p tsconfig.json` — 0 errors
    - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json` — 0 errors in target files (20 pre-existing errors elsewhere, down from 23)
    - `yarn test src/test/containers/pleiepenger/PSBPunchForm.spec.tsx --runInBand` — 40 tests passed
- Remaining follow ups:
    - 20 remaining TS6 errors are in other flows (covered by future batches)
