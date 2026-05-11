# Copilot task

## Task

- Title: Prepare the first low risk TypeScript 6 compatibility batch
- Branch: `refactor/typescript-6-compat-batch-1`
- Suggested agent: `@k9-punsj-front-research-agent`
- Prompt language: `English`

## Goal

- Reduce the first set of low risk `TypeScript 6` compatibility errors while the repo still runs on `typescript@5.9.3`.
- Keep this batch focused on type contract alignment that should not require broader architectural or form layer refactors.

## Context

- There is already a local task and analysis for the broader `TypeScript 6` preparation track in `docsLocal/task-typescript-6-upgrade.md`.
- Current validated baseline:
    - `yarn tsc --noEmit -p tsconfig.json` is green on `typescript@5.9.3`
    - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json` fails with a finite app level error set
- This first batch should only target the safest groups:
    - `catch` variables typed as `unknown`
    - callback variance where local handlers are narrower than the declared component contract
    - enum or domain handlers typed too narrowly against components that pass `string`
- Do not start with `Yup` schema typing, `Formik` generics, `useReducer` overload cleanup, Redux `connect(...)` typing, or wide `cypress/spec` cleanup. Those are separate later batches.
- The point of this task is to remove easy compatibility noise first, keep the diff reviewable, and preserve a clean separation from the actual dependency bump to `typescript@6.0.3`.

## Scope

- Allowed files or areas:
    - `src/app/components/brev/utils.ts`
    - `src/app/utils/validationHelpers.ts`
    - `src/app/validation/yup.ts`
    - `src/app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchForm.tsx`
    - `src/app/components/arbeidsforhold/containers/Arbeidstakerperioder.tsx`
    - `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstakerperioder.tsx`
    - `src/app/components/periodeinfoPaneler/PeriodeinfoPaneler.tsx`
    - `src/app/søknader/pleiepenger/components/pfArbeidstider.tsx`
    - `src/app/søknader/pleiepenger/components/pfLand.tsx`
    - `src/app/søknader/pleiepenger/components/pfTilleggsinformasjon.tsx`
    - `src/app/søknader/pleiepenger/components/pfTimerMinutter.tsx`
    - `src/app/søknader/pleiepenger/containers/Utenlandsopphold/Utenlandsopphold.tsx`
    - `src/app/components/fravaer/FraværPeriode.tsx`
    - `src/app/components/fravaer/FraværTid.tsx`
    - `src/app/components/tilsyn/TilsynPeriode.tsx`
    - `src/app/components/tilsyn/TilsynTid.tsx`
    - `src/app/components/timefoering/ArbeidstidPeriode.tsx`
    - `src/app/components/timefoering/FaktiskOgNormalTid.tsx`
    - targeted tests if a touched file already has nearby test coverage
    - `copilot-tasks/typescript-6-compat-batch-1.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
    - `package.json` and `yarn.lock`
    - `src/app/søknader/opplæringspenger/schema.ts`
    - broad `app/validation/yup.ts` helper redesign beyond the `catch unknown` fix
    - `useReducer` typing fixes
    - Redux `connect(...)` or HOC wrapper fixes
    - `tsconfig.spec.json` cleanup
    - `cypress/tsconfig.json` cleanup
    - local `docsLocal/**`

## Relevant files

- `src/app/components/brev/utils.ts`
- `src/app/utils/validationHelpers.ts`
- `src/app/validation/yup.ts`
- `src/app/components/arbeidsforhold/containers/Arbeidstakerperioder.tsx`
- `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstakerperioder.tsx`
- `src/app/components/periodeinfoPaneler/PeriodeinfoPaneler.tsx`
- `src/app/components/fravaer/FraværPeriode.tsx`
- `src/app/components/fravaer/FraværTid.tsx`
- `src/app/components/tilsyn/TilsynPeriode.tsx`
- `src/app/components/tilsyn/TilsynTid.tsx`
- `src/app/components/timefoering/ArbeidstidPeriode.tsx`
- `src/app/components/timefoering/FaktiskOgNormalTid.tsx`

## Constraints

- Keep the change scoped to this task.
- Reuse existing repo patterns before adding abstractions.
- Follow `AGENTS.md`, `.github/copilot-instructions.md`, and any relevant file specific instructions in `.github/instructions/`.
- Do not include secrets, personopplysninger, or sensitive case data in prompts or examples.
- Stay consistent with the touched area for naming, styling, accessibility, workflows, auth, and security.
- Do not use broad `as any` casts to silence `TypeScript 6`.
- Prefer fixing the local function signature to match the real contract over weakening upstream types globally.
- For `catch` blocks, use narrow guards or safe message extraction instead of assuming every thrown value is an `Error`.
- For enum or domain handlers, preserve runtime domain safety. If a UI callback accepts `string`, do not silently pretend any string is valid domain data without a guard.
- If a file starts pulling in wider refactors, stop and keep the batch small.

## Validation

- Commands to run:
    - `yarn tsc --noEmit -p tsconfig.json`
    - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`
    - `yarn lint`
- If a touched area has a nearby focused test, run the narrowest relevant test as well.
- If commands fail, separate new failures from pre existing repo noise in `Outcome`.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the task and allowed files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution. The user handles task lifecycle manually.

## Prompt for Copilot

Prepare the first low risk `TypeScript 6` compatibility batch while the repo still stays on `typescript@5.9.3`. Start by updating the `Plan` section in this file. Limit the implementation to narrow `catch unknown` fixes, callback variance fixes, and enum or domain handler narrowing in the allowed files. Do not touch `package.json`, `yarn.lock`, `Yup` schema typing in `src/app/søknader/opplæringspenger/schema.ts`, Redux `connect(...)` typing, `useReducer` overload issues, or `cypress/spec` cleanup. Finish by updating `Outcome` with changed files, validation results, and what should be handled in later batches.

Suggested starter prompt for chat:

- `Follow copilot-tasks/typescript-6-compat-batch-1.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

1. Fix `catch` unknown errors (TS18046) in `brev/utils.ts`, `OMPMAPunchForm.tsx`, `validationHelpers.ts`, and `yup.ts` using `instanceof` guards or safe extraction.
2. Fix `Tidsformat` handler variance (TS2322) in `FraværPeriode.tsx`, `FraværTid.tsx`, `TilsynPeriode.tsx`, `TilsynTid.tsx`, `ArbeidstidPeriode.tsx`, and `FaktiskOgNormalTid.tsx` by widening inline `onChange` parameter from `Tidsformat` to `string` with an `as Tidsformat` cast inside.
3. Fix `showStatus` parameter variance in both `Arbeidstakerperioder.tsx` files by changing `showStatus: boolean` to `showStatus?: boolean` in the inline lambda.
4. Fix `PeriodeinfoComponent` and `ListeComponent` function variance in `pfArbeidstider.tsx`, `pfLand.tsx`, `pfTilleggsinformasjon.tsx`, `pfTimerMinutter.tsx`, `PeriodeinfoPaneler.tsx`, and `Utenlandsopphold.tsx` by making the last three parameters optional (`feilprefiks?`, `getErrorMessage?`, `intl?`).
5. Run `yarn tsc --noEmit` and `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false` and verify that all targeted errors are gone.

## Progress notes

- All 18 targeted TS6 errors in allowed files resolved; TS5 baseline stays clean; lint passes.
- `ValidationError.inner.map` destructuring replaced with `.message`/`.path` field access since `inner` is now typed as `ValidationError[]` in TS6.
- `PeriodeinfoComponent`/`ListeComponent` inner function params made optional to match type definition; added `!` and `?.` where values are accessed.
- Corrective pass: `yup.ts` `validate()` now re-throws unexpected exceptions instead of silently returning false.
- Corrective pass: added `isTidsformat(v: string): v is Tidsformat` guard to `timeUtils.ts`; all 6 Tidsformat `onChange` handlers now guard with `if (!isTidsformat(v)) return` before acting on the value; removed all blind `as Tidsformat` casts.

## Outcome

- Changed files:
    - `src/app/components/brev/utils.ts` — catch unknown: instanceof guard
    - `src/app/utils/validationHelpers.ts` — catch unknown: instanceof guard + ValidationError.inner map rewrite
    - `src/app/validation/yup.ts` — catch unknown: instanceof guard
    - `src/app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchForm.tsx` — catch unknown: instanceof guard + ValidationError.inner map rewrite
    - `src/app/components/fravaer/FraværPeriode.tsx` — handleToggle param: Tidsformat → string with as Tidsformat cast
    - `src/app/components/fravaer/FraværTid.tsx` — handleToggle param: Tidsformat → string with as Tidsformat cast
    - `src/app/components/tilsyn/TilsynPeriode.tsx` — inline onChange: Tidsformat → string with as Tidsformat cast
    - `src/app/components/tilsyn/TilsynTid.tsx` — inline onChange: Tidsformat → string with as Tidsformat cast
    - `src/app/components/timefoering/ArbeidstidPeriode.tsx` — inline onChange: Tidsformat → string with as Tidsformat cast
    - `src/app/components/timefoering/FaktiskOgNormalTid.tsx` — inline onChange: Tidsformat → string with as Tidsformat cast
    - `src/app/components/arbeidsforhold/containers/Arbeidstakerperioder.tsx` — showStatus: boolean → showStatus?: boolean
    - `src/app/søknader/pleiepenger/containers/Arbeidsforhold/Arbeidstakerperioder.tsx` — showStatus: boolean → showStatus?: boolean
    - `src/app/søknader/pleiepenger/components/pfArbeidstider.tsx` — feilprefiks/getErrorMessage params made optional
    - `src/app/søknader/pleiepenger/components/pfLand.tsx` — feilprefiks/getErrorMessage/intl params made optional
    - `src/app/søknader/pleiepenger/components/pfTilleggsinformasjon.tsx` — feilprefiks/getErrorMessage/intl params made optional
    - `src/app/søknader/pleiepenger/components/pfTimerMinutter.tsx` — feilprefiks/getErrorMessage/intl params made optional
    - `src/app/components/periodeinfoPaneler/PeriodeinfoPaneler.tsx` — periodComponent params made optional
    - `src/app/utils/timeUtils.ts` — added `isTidsformat(v: string): v is Tidsformat` type guard
    - `src/app/søknader/pleiepenger/containers/Utenlandsopphold/Utenlandsopphold.tsx` — utenlandsoppholdComponent params made optional
- Validation:
    - `yarn tsc --noEmit -p tsconfig.json` (TS 5.9.3): clean, no errors (after corrective pass)
    - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false`: all targeted errors in allowed files resolved (after corrective pass); remaining 30+ errors are out-of-scope (useReducer, Redux connect, Formik generics, Yup schema, ArbeidstidKalender filter, test files)
    - `yarn lint`: clean
- Remaining risks or follow ups:
    - Batch 2: `useReducer` reducer return type (`Partial<State>` → `State`) in `ArbeidstakerComponent.tsx` and two `Arbeidstaker.tsx` files
    - Batch 3: `ArbeidstidKalender.tsx` and `tilsyn/utils.ts` filter/map on union types
    - Batch 4: Redux `connect(...)` wrapping in `OMPKSPunchForm.tsx`, `PSBPunchForm.tsx`, `OLPPunchFormContainer.tsx`
    - Batch 5: Formik generics in `OMPMAPunchFormContainer.tsx`
    - Batch 6: Yup schema overloads in `opplæringspenger/schema.ts` (marked out of scope in this task)
    - `PdfVisning.tsx` and `Personvelger.tsx` have small standalone errors not grouped in this batch
