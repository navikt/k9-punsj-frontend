# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Aksel v8 upgrade, batch 3 residual selector audit and safe cleanup
- Branch: `refactor/aksel-v8-upgrade`
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: `English`

## Goal

- Audit the remaining `navds-*` selector usage after batches 1 and 2.
- Remove or rewrite only the dead or clearly redundant leftovers, while preserving current visual behavior.

## Scope

- Allowed files:
    - `src/app/styles/globals.css`
    - `src/app/søknader/pleiepenger-livets-sluttfase/containers/soknadsperioder.css`
    - `src/app/components/pdf/pdfVisning.css`
    - `src/app/components/legacy-form-compat/radio/radio.css`
    - `src/app/components/legacy-form-compat/radio/radioGroup.css`
    - `src/app/components/legacy-form-compat/checkbox/checkbox.css`
    - `src/app/components/legacy-form-compat/checkbox/checkboxGroup.css`
    - `copilot-tasks/aksel-v8-upgrade-batch-3-residual-selector-audit.md`
- Out of scope:
    - package upgrades
    - datepicker logic or styles
    - broad refactors of form layout
    - reworking already stabilized journalpost, modal, PDF layout, top panel spacing, or batch 2 fixes unless strictly required
    - moving task files or managing task lifecycle
- Constraints:
    - keep the change narrow
    - do not blindly replace every remaining `navds-*` selector
    - preserve current visual output of legacy radio and checkbox compat components
    - if a mixed `:is(.navds-*, .aksel-*)` selector is still useful as an explicit fallback, keep it and document why
    - prefer removing dead qualifiers over rewriting working styles when the visual result is already correct
    - follow `AGENTS.md`

## Validation

- Commands:
    - `yarn lint`
    - `yarn lint:css`
    - `yarn build`
- Skip or limitation note:
    - do not run broad browser driven visual review in this pass

## Prompt for Copilot

Follow `copilot-tasks/aksel-v8-upgrade-batch-3-residual-selector-audit.md`. First update `Plan`, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Audit the remaining `navds-*` CSS selectors after the Aksel v8 migration. Only touch the files listed in scope. The goal is not broad cleanup. Remove or rewrite only the dead or clearly redundant leftovers, and keep any mixed `navds` plus `aksel` fallback selectors if they still serve a real purpose. Be especially careful in the legacy radio and checkbox compat layer: preserve the current visual behavior and avoid large rewrites. Run `yarn lint`, `yarn lint:css`, and `yarn build`, then summarize which selectors were removed, which were kept intentionally, and which remaining manual visual checks are still recommended.

Suggested starter prompt:

- `Follow copilot-tasks/aksel-v8-upgrade-batch-3-residual-selector-audit.md. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.`

## Plan

1. Replace dead `.navds-select__container` in globals.css with `.aksel-select__container`. Keep journalpost-modal mixed `:is()` as stabilized fallback.
2. Remove dead `.navds-panel` qualifier from soknadsperioder.css.
3. Simplify dead `:is(.navds-button, .aksel-button)` and `:is(.navds-toggle-group, .aksel-toggle-group)` in pdfVisning.css to their aksel-only forms.
4. Audit legacy compat CSS: keep all mixed `:is()` selectors and pure navds fallback blocks (documented safety net, harmless, avoids large rewrite).
5. Run `yarn lint`, `yarn lint:css`, `yarn build`.

## Progress notes

- Aksel v8 CSS confirmed: no `navds-` prefix in distributed CSS. All `navds-*` selectors are dead unless used as `:is()` fallback alongside `aksel-*`.
- `aksel-radio-buttons` and `aksel-checkboxes` classes ARE rendered by v8 components (found in React output), just not styled in the distributed CSS. The legacy compat selectors target them correctly.

## Outcome

- Changed files:
    - `src/app/styles/globals.css` — `.navds-select__container` → `.aksel-select__container` (scoped under `.pleietrengende-select`)
    - `src/app/søknader/pleiepenger-livets-sluttfase/containers/soknadsperioder.css` — removed dead `.navds-panel` qualifier from `.eksiterendesoknaderpanel`
    - `src/app/components/pdf/pdfVisning.css` — simplified 3 `:is(.navds-*, .aksel-*)` selectors to just `.aksel-*`
- Intentionally kept:
    - `globals.css` journalpost-modal `:is(.navds-modal, .aksel-modal)` — stabilized manual fix, explicitly out of scope
    - `radio.css` pure `.navds-radio` fallback block — labeled safety net, harmless dead code, avoids large rewrite risk
    - `checkbox.css` pure `.navds-checkbox__*` fallback selectors — same reasoning
    - `radioGroup.css` `:is(.navds-radio-buttons, .aksel-radio-buttons)` — `.aksel-radio-buttons` is rendered by v8 RadioGroup, navds part is harmless fallback
    - `checkboxGroup.css` `:is(.navds-checkboxes, .aksel-checkboxes)` — same, `.aksel-checkboxes` is rendered by v8 CheckboxGroup
    - `radio.css` / `checkbox.css` `:is(.navds-radio, .aksel-radio)` and `:is(.navds-checkbox, .aksel-checkbox)` — mixed selectors working via aksel part
- Validation:
    - `yarn lint`: clean
    - `yarn lint:css`: clean
    - `yarn build`: success
- Remaining follow ups:
    - The `.navds-modal` part in the journalpost-modal `:is()` selector can be removed once the stabilized fix is confirmed in visual review.
    - Pure `.navds-*` fallback blocks in radio.css and checkbox.css can be removed in a future pass when the legacy compat layer is deprecated or tested end-to-end.
    - Manual visual check recommended for: pleietrengende-select width, PDF toolbar buttons, and soknadsperioder h4 spacing.
