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

1. Replace dead `.navds-*` selectors with `.aksel-*` equivalents in the 8 smaller scoped CSS files.
2. Remove the dead global `.navds-text-field__input` rule in institusjonSelector.css.
3. Remove the `.navds-panel` qualifier from LeggTilDelvisFravær.css (Panel → Box).
4. In punchPage.css, remove the clearly duplicated `.navds-box` base block and promote unique `.navds-box`-only rules by stripping the dead qualifier.
5. Run `yarn lint`, `yarn lint:css`, `yarn build`.

## Progress notes

- Aksel v8 CSS uses `aksel-` prefix exclusively; ALL `navds-*` selectors in project CSS are dead.

## Outcome

- Changed files:
    - `src/app/opprett-journalpost/opprettJournalpost.css` — `.navds-alert` → `.aksel-alert`, `.navds-loader` → `.aksel-loader`
    - `src/app/send-brev-i-avsluttetSak/sendBrevIAvsluttetSak.css` — `.navds-loader`, `.navds-alert`, `.navds-error-message`, `.navds-heading--xsmall` → aksel equivalents
    - `src/app/components/person-velger/personvelger.css` — `.navds-text-field__label` → `.aksel-form-field__label`, `.navds-checkbox` → `.aksel-checkbox`
    - `src/app/søknader/opplæringspenger/containers/institusjonSelector.css` — `.navds-text-field__input` → `.aksel-text-field__input`
    - `src/app/søknader/pleiepenger/containers/RegistreringsValg/pSBRegistreringsValg.css` — `.navds-button` → `.aksel-button`
    - `src/app/søknader/korrigeringAvInntektsmelding/containers/LeggTilDelvisFravær/LeggTilDelvisFravær.css` — removed dead `.navds-panel` qualifier
    - `src/app/components/skjema/NewDateInput/newDateInput.css` — `.navds-form-field__label.navds-label`, `.navds-error-message.navds-label`, `.navds-text-field__input` → aksel equivalents
    - `src/app/components/brev/brevComponent/brevComponent.css` — `.navds-alert` → `.aksel-alert`
    - `src/app/components/punchPage.css` — removed duplicated `.navds-box` base block, promoted unique `.navds-box`-only rules by stripping dead qualifier, removed duplicate `.klokkeslett` rule
- Validation:
    - `yarn lint`: clean
    - `yarn lint:css`: clean
    - `yarn build`: success
- Remaining follow ups:
    - `src/app/styles/globals.css` still has `.navds-select__container` and `.navds-modal` references (out of scope for this batch)
    - The `.punch_form` class is not rendered by any component (only `omsorgspenger_punch_form` exists in JSX). The dual selectors are harmless but could be consolidated in a future pass.
    - Visual review of arbeidstaker/selvstendig/frilanserpanel sections in the punch form recommended to confirm promoted rules apply correctly.
- Post-batch follow-up (scoping):
    - `newDateInput.css`: scoped `.aksel-form-field__label`, `.aksel-error-message`, `.aksel-text-field__input[size]` under `.aksel-date__field` parent. This preserves the 12.5rem date input width while preventing bleed into unrelated TextFields and labels. The `!important` on width is kept because Aksel's own `size` attribute inline style would otherwise win.
    - `institusjonSelector.css`: scoped `.aksel-text-field__input { max-width: 100% }` under `.institusjonContainer` to prevent global override of all text field max-widths.
