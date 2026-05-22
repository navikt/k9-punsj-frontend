# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Aksel v8 upgrade, batch 4 final visual pass and narrow follow ups
- Branch: `refactor/aksel-v8-upgrade`
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: `English`

## Goal

- Do a final pass over the main Aksel v8 affected flows.
- Fix only real remaining visual regressions or unsafe leftovers found during that pass.

## Scope

- Allowed files:
    - `src/app/components/**`
    - `src/app/home/**`
    - `src/app/opprett-journalpost/**`
    - `src/app/send-brev-i-avsluttetSak/**`
    - `src/app/søknader/**`
    - `src/app/styles/globals.css`
    - `copilot-tasks/aksel-v8-upgrade-batch-4-final-visual-pass.md`
- Out of scope:
    - package upgrades
    - domain logic changes unless a visual fix strictly requires a tiny safe adjustment
    - broad refactors
    - rewriting the legacy compat layer without a concrete bug
    - moving task files or managing task lifecycle
- Constraints:
    - start with a short plan
    - verify the actual affected UI flows before editing
    - keep fixes narrow and reviewable
    - do not reopen already stabilized areas unless you find a concrete remaining regression
    - prefer local scoping over new global overrides
    - follow `AGENTS.md`

## Validation

- Commands:
    - `yarn lint`
    - `yarn lint:css`
    - `yarn build`
- Skip or limitation note:
    - do not do speculative cleanup outside the verified findings

## Prompt for Copilot

Follow `copilot-tasks/aksel-v8-upgrade-batch-4-final-visual-pass.md`. First update `Plan`, then verify the main Aksel v8 affected flows, implement only the narrow fixes that are still needed, keep `Progress notes` short, and finish by updating `Outcome`.

This should be treated as a likely final pass, not as another broad cleanup batch. Start by checking the key flows that were touched during the upgrade and follow ups:

- opprett journalpost
- journalpost view after creation
- PDF panel and PDF toolbar
- journalpost modal placement and opening behavior
- legacy radio and checkbox panels
- toppanelene `Søknadsperiode` and `Opplysninger om søknaden`
- select and date input areas that were recently adjusted

Only change code when you find a concrete remaining issue. Keep fixes narrow, preserve the current improved visuals, and avoid broad CSS rewriting. If a previously discussed fallback selector or compat rule is still harmless and not causing a real regression, leave it in place.

Run `yarn lint`, `yarn lint:css`, and `yarn build`. In `Outcome`, summarize:

- which flows were checked
- which files were changed and why
- what was intentionally left unchanged
- whether Aksel v8 upgrade work can now be considered done except for future incidental fixes

Suggested starter prompt:

- `Follow copilot-tasks/aksel-v8-upgrade-batch-4-final-visual-pass.md. First update Plan, then verify the key flows, implement only narrow remaining fixes, keep Progress notes short, and finish by updating Outcome.`

## Plan

1. Recheck the main Aksel v8 affected flows and list any remaining concrete visual regressions.
2. Fix only the verified issues with narrow scoped changes.
3. Re-run `yarn lint`, `yarn lint:css`, and `yarn build`.
4. Update `Outcome` with checked flows, changed files, and closure status.

## Progress notes

- Full audit of all CSS in scope for `navds-*` selectors: only 2 remain outside legacy-compat (journalpost-modal `:is()` fallback, intentionally kept).
- 32 `navds-*` references remain in legacy-form-compat CSS (intentional safety net, functional via `aksel-*` counterparts).
- No concrete visual regressions found in any checked flow.
- No code changes needed — all affected areas are already correct after batches 1–3.

## Outcome

- Checked flows:
    - Opprett journalpost (CSS and component)
    - Send brev i avsluttet sak (CSS and component)
    - Home page entry components (OpprettJournalpostInngang, SendBrevIAvsluttetSakInngang)
    - PDF panel and toolbar (pdfVisning.css)
    - Journalpost modal placement (globals.css)
    - Legacy radio and checkbox panels (compat layer CSS)
    - Personvelger form (personvelger.css)
    - Brev component (brevComponent.css)
    - Date inputs (newDateInput.css)
    - Institusjon selector (institusjonSelector.css)
    - PSB registreringsvalg (pSBRegistreringsValg.css)
    - Søknadsperioder panel (soknadsperioder.css)
    - PunchPage main layout (punchPage.css)
- Changed files: none — no concrete regressions found
- Validation:
    - `yarn lint`: clean
    - `yarn lint:css`: clean
    - `yarn build`: success
- Intentionally unchanged:
    - `globals.css` journalpost-modal `:is(.navds-modal, .aksel-modal)` — stabilized manual fix, harmless fallback
    - Legacy compat layer (32 navds rules) — intentional safety net, works via aksel counterparts in `:is()` selectors
    - `personvelger.css` `.aksel-form-field__label { opacity: 1 }` — no-op in practice but harmless
- Conclusion:
    - The Aksel v8 CSS migration is complete. All dead `navds-*` selectors outside the legacy compat layer have been removed or rewritten in batches 1–3.
    - The remaining `navds-*` references are limited to the legacy-form-compat safety net and one journalpost-modal fallback, both intentionally preserved.
    - Future work: remove the legacy navds fallback blocks when the compat layer is deprecated; remove the journalpost-modal `.navds-modal` from the `:is()` selector during next modal work.
    - Aksel v8 upgrade work can be considered done except for future incidental fixes.
