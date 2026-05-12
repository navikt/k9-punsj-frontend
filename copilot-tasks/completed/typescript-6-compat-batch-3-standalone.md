# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Prepare the third TypeScript 6 compatibility batch for standalone app errors
- Branch: `refactor/typescript-6-compat-batch-3-standalone`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Fix the remaining small standalone `TypeScript 6` app errors in `PdfVisning` and `Personvelger`.
- Keep this batch narrow and avoid pulling in the larger union narrowing or form typing tracks.

## Scope

- Allowed files:
  - `src/app/components/pdf/PdfVisning.tsx`
  - `src/app/components/person-velger/Personvelger.tsx`
  - nearby small tests only if a tiny focused test is trivial
  - `copilot-tasks/typescript-6-compat-batch-3-standalone.md`
- Out of scope:
  - `ArbeidstidKalender.tsx`
  - `tilsyn/utils.ts`
  - Redux `connect(...)`, `Formik`, `Yup`
  - `tsconfig.spec.json` and `cypress/tsconfig.json`
  - `package.json` and `yarn.lock`
- Constraints:
  - keep the change scoped
  - reuse existing patterns
  - follow `AGENTS.md`
  - avoid broad casts and keep runtime behavior unchanged

## Validation

- Commands:
  - `yarn tsc --noEmit -p tsconfig.json`
  - `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`
- Skip or limitation note:
  - add a focused test only if it is very small and local to the change

## Prompt for Copilot

Follow this task file. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Fix the small standalone `TypeScript 6` app errors in `src/app/components/pdf/PdfVisning.tsx` and `src/app/components/person-velger/Personvelger.tsx`. Keep the work limited to those files unless a tiny nearby test is trivial. Preserve runtime behavior, avoid broad casts, and do not touch `ArbeidstidKalender`, `tilsyn/utils`, Redux `connect(...)`, `Formik`, `Yup`, `tsconfig.spec.json`, `cypress`, `package.json`, or `yarn.lock`. Run `yarn tsc --noEmit -p tsconfig.json` and `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false -p tsconfig.json`, then record the result in `Outcome`.

Suggested starter prompt:

- `Follow copilot-tasks/typescript-6-compat-batch-3-standalone.md. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.`

## Plan

1. PdfVisning: add generic type to `reduce<IDokumentMedJournalpost[]>` and nullish-coalesce the optional-chaining spread to fix TS2740/TS2769.
2. Personvelger: widen `hentBarn` `.then` callback parameter to `Response | Error` and narrow with `instanceof` to fix TS2345.
3. Run TS5 and TS6 validation.
4. Update Outcome.

## Progress notes

- PdfVisning: added `reduce<IDokumentMedJournalpost[]>` generic, nullish-coalesced the optional-chaining spread (`?? []`), removed the eslint-disable comment. Also added trailing `?? []` for the outer optional chain.
- Personvelger: removed explicit `: Response` annotation, added `instanceof Error` guard before `.ok` check.

## Outcome

- Changed files: `src/app/components/pdf/PdfVisning.tsx`, `src/app/components/person-velger/Personvelger.tsx`
- Validation: `yarn tsc --noEmit` passes (TS5). `yarn dlx -p typescript@6.0.3 tsc --noEmit --pretty false` shows 0 errors in these files (27 remaining project-wide, all outside scope).
- Remaining follow ups: 27 TS6 errors remain in other files (Redux `connect`, Formik, union narrowing tracks).
