# Copilot task

## Task

- Title: Validate Freelancer date order in all frontend application flows
- Branch: `fix/frilanser-date-order-validation`
- Suggested agent: default
- Prompt language: English

## Goal

Prevent users from submitting a Freelancer period where `startdato` is after `sluttdato` in PSB, PLS, OLP and OMS-utbetaling.

## Scope

- Allowed files:
    - `src/app/søknader/pleiepenger/**`
    - `src/app/components/arbeidsforhold/**`
    - `src/app/søknader/pleiepenger-livets-sluttfase/**`
    - `src/app/søknader/opplæringspenger/**`
    - `src/app/søknader/omsorgspenger-utbetaling/**`
    - directly related tests, `docs/PROGRESS.md`
- Out of scope:
    - backend changes
    - broad Datovelger refactor
    - unrelated date or form cleanup
- Constraints:
    - keep the change scoped and reuse existing form patterns
    - allow equal dates
    - allow an empty `sluttdato` when the applicant still works as a freelancer
    - use Norwegian user facing error text
    - follow `AGENTS.md`

## Validation

- Commands:
    - run the narrowest relevant Jest test after each section
    - run `yarn lint` after all changes
- Skip or limitation note:
    - do not run the full test suite or end to end suite unless a targeted test cannot cover the changed behavior

## Prompt for Copilot

Follow this task file. First update Plan, then implement the task, keep Progress notes short and finish by updating Outcome.

Work on the current branch only. Do not modify backend code. Add frontend validation that rejects a Freelancer `sluttdato` earlier than `startdato` in each of the four sections below. The error must be visible before preview or submission. Keep equal dates valid and keep `sluttdato` optional when `jobberFortsattSomFrilans` is true.

Implement and commit each section separately, in exactly this order. Run the narrowest relevant tests before each commit. Use dry conventional commit messages in Norwegian, ASCII only.

1. Pleiepenger sykt barn (PSB). Fix `src/app/søknader/pleiepenger/containers/Arbeidsforhold/ArbeidsforholdPanel.tsx` and add a targeted regression test. Commit: `fix: valider frilanserdatoer i pleiepenger`.
2. Pleiepenger livets sluttfase (PLS). Fix its shared legacy `src/app/components/arbeidsforhold/containers/ArbeidsforholdPanel.tsx` path and add a targeted regression test. Commit: `fix: valider frilanserdatoer i livets sluttfase`.
3. Opplæringspenger (OLP). Add schema level protection in addition to the existing date picker range. Add a targeted regression test. Commit: `fix: valider frilanserdatoer i opplaeringspenger`.
4. Omsorgspenger utbetaling. Add schema level protection and a targeted regression test. Commit: `fix: valider frilanserdatoer i omsorgspenger utbetaling`.

Do not use a broad shared Datovelger refactor. Inspect the existing validation and test conventions in each section before choosing the smallest implementation. Update `docs/PROGRESS.md` in the final section with a concise Norwegian note covering the frontend behavior. Review the diff for every changed file before committing. Finish by reporting commit hashes, changed files and validation results in Outcome.

## Plan

1. Inspect the existing date validation and closest tests in PSB, PLS, OLP and OMS-utbetaling. Complete. Submit guards complete.
2. Implement and test PSB, then commit it. Complete.
3. Implement and test PLS, then commit it. Complete.
4. Implement and test OLP, then commit it. Complete.
5. Implement and test OMS-utbetaling, update progress documentation, run lint and commit it. Complete.

## Progress notes

- PSB: Added date-order validation and a Cypress regression test. Committed as c23bb72f.
- PLS: Added date-order validation and a Jest regression test. Committed as fd5967de.
- OLP: Added schema validation and a Jest regression test. Committed as d7532cdc.
- OMS-utbetaling: Added schema validation and a Jest regression test. Committed as e674167b.
- PSB submit guard: Stops submission before backend validation for an invalid freelancer date range. Committed as b86e5176.
- PLS submit guard: Stops submission before backend validation for an invalid freelancer date range. Committed as 9257d1d0.

## Outcome

- Changed files: PSB and PLS arbeidsforhold panels, OLP and OMS-utbetaling schemas, and targeted Cypress/Jest tests.
- Validation: PSB Cypress specification; PSB, PLS, OLP and OMS-utbetaling Jest specifications; and `yarn lint` pass.
- Commits: c23bb72f, fd5967de, d7532cdc, e674167b, b86e5176, 9257d1d0.
- Documentation: `docs/CHANGELOG.md` was updated after review. `docs/PROGRESS.md` was not present.
- Remaining follow ups: Backend validation remains a separate task in `k9-punsj`.
