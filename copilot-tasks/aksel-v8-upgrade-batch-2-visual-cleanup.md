# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Aksel v8 upgrade, batch 2 visual cleanup of remaining CSS overrides
- Branch: `refactor/aksel-v8-upgrade`
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: `English`

## Goal

- Clean up the next narrow batch of remaining Aksel v8 visual fallout.
- Rewrite or remove dead `.navds-*` CSS override paths that still affect sensitive flows.

## Scope

- Allowed files:
  - `src/app/opprett-journalpost/opprettJournalpost.css`
  - `src/app/send-brev-i-avsluttetSak/sendBrevIAvsluttetSak.css`
  - `src/app/components/person-velger/personvelger.css`
  - `src/app/søknader/opplæringspenger/containers/institusjonSelector.css`
  - `src/app/søknader/pleiepenger/containers/RegistreringsValg/pSBRegistreringsValg.css`
  - `src/app/søknader/korrigeringAvInntektsmelding/containers/LeggTilDelvisFravær/LeggTilDelvisFravær.css`
  - `src/app/components/skjema/NewDateInput/newDateInput.css`
  - `src/app/components/brev/brevComponent/brevComponent.css`
  - `src/app/components/punchPage.css`, but only for dead duplicated `.navds-box` cleanup that is now clearly superseded
  - directly affected tests only if strictly needed
  - `copilot-tasks/aksel-v8-upgrade-batch-2-visual-cleanup.md`
- Out of scope:
  - package upgrades
  - datepicker logic changes
  - broad refactors of forms or domain logic
  - reworking already stabilized manual fixes unless strictly required
  - moving task files or managing task lifecycle
- Constraints:
  - keep the change scoped
  - reuse existing patterns
  - preserve the recent manual fixes for journalpost modal, PDF layout, legacy radio and checkbox compat, and top panel spacing
  - prefer replacing dead `.navds-*` assumptions with explicit Aksel v8 selectors or neutral selectors
  - follow `AGENTS.md`

## Validation

- Commands:
  - `yarn lint`
  - `yarn lint:css`
  - `yarn build`
- Skip or limitation note:
  - do not run broad browser driven visual review in this pass

## Prompt for Copilot

Follow `copilot-tasks/aksel-v8-upgrade-batch-2-visual-cleanup.md`. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Rewrite or remove the next narrow batch of remaining `.navds-*` CSS override paths after the Aksel v8 upgrade. Focus only on the files listed in scope. Keep the work reviewable and limited to visual compatibility cleanup. Do not redo the already stabilized manual fixes for journalpost modal, PDF layout, legacy radio and checkbox compat, top panel spacing, or datepicker logic unless strictly required. Prefer explicit Aksel v8 selectors or neutral structural selectors where the old runtime class assumptions are now dead. Run `yarn lint`, `yarn lint:css`, and `yarn build`, then summarize which remaining `.navds-*` overrides were migrated, which were intentionally left in place, and any manual visual risk areas.

Suggested starter prompt:

- `Follow copilot-tasks/aksel-v8-upgrade-batch-2-visual-cleanup.md. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.`

## Plan

- 3 to 6 short steps.

## Progress notes

- Short factual notes only.

## Outcome

- Changed files:
- Validation:
- Remaining follow ups:
