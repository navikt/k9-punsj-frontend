# Copilot task

## Task

- Title: Use Aksel Dialog for journalpost PDF interaction
- Branch: `refactor/journalpost-dialog-trap-focus`
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: English

## Goal

- Keep the PDF panel available by mouse for every dialog inside `JournalpostOgPdfVisning`, while dialogs outside the journalpost flow remain blocking.

## Scope

- Allowed files: `src/app/components/JournalpostOgPdfVisning.tsx`, existing journalpost dialog components, directly related local CSS and focused tests.
- Out of scope: business logic, API calls, navigation, i18n copy, dependency changes and dialogs outside the journalpost flow.
- Constraints:
    - Use Aksel `Dialog` already available in `@navikt/ds-react` 8.16.1.
    - The adapter must expose an explicit `interactionMode`, but resolve its default from the nearest `PunsjDialogProvider`: `reference` inside `JournalpostOgPdfVisning` and `blocking` outside it.
    - An explicit per-dialog override may remain for exceptional workflows, but journalpost dialogs should not need repeated `interactionMode="reference"` props.
    - `blocking` uses Aksel's normal `Dialog.Popup modal={true}` with its regular backdrop. The PDF remains visible as context but cannot be interacted with.
    - `reference` uses `Dialog.Popup modal="trap-focus"`, `withBackdrop={false}` and `closeOnOutsideClick={false}`. Use it for all dialogs rendered inside `JournalpostOgPdfVisning`, including confirmations, previews, errors and fordeling dialogs.
    - Aksel `DatePicker` must not render its built in nested `Modal` inside a `reference` dialog. It blocks pointer interaction with the PDF.
    - Let the existing `Datovelger` and `DatovelgerFormik` wrappers select the reference renderer from the surrounding `PunsjDialog` interaction-mode context. Do not add a second general-purpose public date picker API.
    - The opt-in renderer must keep the existing input, formatting, validation and date constraints, but render the calendar with public Aksel `Popover` and `DatePicker.Standalone` or an equivalent public API. Do not use the normal `DatePicker` popup path, Aksel internal imports or CSS overrides of a nested modal.
    - Do not use Aksel `withBackdrop` in `reference` mode. It would disable the required pointer interaction outside the popup.
    - If the left work area should be dimmed and blocked in `reference` mode, use a custom interaction overlay limited to the left panel. It must not cover or disable pointer interaction with the PDF panel.
    - The custom overlay must use `pointer-events: auto`, remain below the dialog popup and date popover, follow the measured left-panel width and cover the visible work area. Do not implement it with Aksel `withBackdrop` or a full-page overlay.
    - Preserve blocking modal behavior for shared dialogs outside `JournalpostOgPdfVisning`.
    - Preserve the existing component APIs, callbacks, close behavior, business conditions and user-facing copy while replacing legacy `Modal` markup.
    - Stacked confirmation flows must not multiply overlay opacity or place the overlay above the active dialog.
    - Do not use an iframe.
    - Prefer a narrow context plus a compound adapter, for example `PunsjDialog` with `Header`, `Body` and `Footer`, over threading a new prop through every punch form.
    - Preserve the current compact modal appearance, centered within the left work area. Do not replace it with a left drawer.
    - `Dialog.Popup position="center"` centers in the viewport. Add a custom popup class and narrowly scoped CSS to center it in the left panel. Use the CSS `translate` property rather than overriding Aksel's `transform` animation.
    - `rootElement` changes only the portal target. Do not use it as a positioning solution.

## Delivery phases

Keep one branch, but use small logical commits. Do not combine phases in a single commit.

1. `refactor: add journalpost dialog modes`
    - Add the journalpost scoped configuration, `PunsjDialog` adapter with `blocking` and `reference` modes and scoped placement CSS.
    - Migrate one small representative dialog and add focused adapter coverage.
2. `refactor: migrate work time dialogs to reference mode`
    - Migrate both calendar patterns: `KalenderMedModal` and the selected day modal in `TidsbrukKalender`.
3. `refactor: classify selected punch dialogs` (historical, superseded by phase 7)
    - The original pass migrated only selected data-entry dialogs.
    - Phase 7 replaces this earlier policy with a provider-level `reference` default for all journalpost dialogs.
4. `test: cover journalpost dialog modes`
    - Add focused coverage for both modes. Keep the old Modal CSS fallback until a separate full migration.
5. `fix: keep reference date picker nonmodal`
    - Implement the opt-in date picker renderer and use it only in reference dialog workflows that contain date fields.
    - Add a real pointer interaction test for the PDF area while both the reference dialog and its date calendar are open.
6. `feat: block only the left area behind reference dialogs`
    - Add a custom visual and interaction overlay over the left journalpost panel in `reference` mode.
    - Keep the dialog popup and reference date popover interactive above it.
    - Verify that one click on the covered left form does nothing while one click on a PDF tab or control still works.
7. `refactor: default journalpost dialogs to reference mode`
    - Let `PunsjDialogProvider` configure the default interaction mode for its subtree.
    - Configure `JournalpostOgPdfVisning` with `reference` as its default while keeping standalone usage blocking.
    - Add focused coverage for provider defaults, explicit overrides and overlay behavior.
8. `refactor: migrate shared journalpost modals`
    - Migrate `ErDuSikkerModal`, `ForhåndsvisSøknadModal`, `SettPåVentModal` and `OkGåTilLosModal` to `PunsjDialog` without changing their public APIs.
    - Verify that the same shared components remain blocking if rendered outside the journalpost provider.
9. `refactor: migrate direct søknad modals`
    - Migrate direct legacy `Modal` usage in `OMPKSPunchForm`, `OMPMAPunchForm` and `KorrigeringAvInntektsmeldingForm`.
    - Preserve validation, submit confirmation and navigation behavior.
10. `refactor: migrate fordeling modals`
    - Migrate `ErrorModal`, `KlassifiserModal`, `KopierModal` and `VentLukkBrevModal`.
    - Keep the PDF interactive and the left fordeling controls covered by the custom overlay.
11. `test: finish journalpost dialog migration`
    - Cover representative confirmation, preview, error and stacked-dialog flows.
    - Remove old journalpost `Modal` CSS only after confirming no journalpost route still depends on it.
    - Leave `SendBrevIAvsluttetSak` and other flows outside `JournalpostOgPdfVisning` out of this migration.

## Validation

- Commands: identify or add focused tests for the adapter and affected dialog behavior.
- Skip or limitation note: ask the user before running tests, lint, typecheck or build. Manually verify that document tabs and PDF controls remain clickable while each reference dialog and its date calendar are open.

## Prompt for Copilot

Follow this task file and implement phases 7 and 8 only. First update Plan, keep Progress notes short and finish by updating Outcome.

Make `reference` the provider-level default for dialogs inside `JournalpostOgPdfVisning`, while `PunsjDialog` remains blocking outside that provider. Keep explicit overrides possible, but do not repeat `interactionMode="reference"` across journalpost call sites. Ensure the effective interaction mode is also what the date picker context and custom left-panel overlay consume.

Then migrate only these shared components from legacy Aksel `Modal` to `PunsjDialog`: `ErDuSikkerModal`, `ForhåndsvisSøknadModal`, `SettPåVentModal` and `OkGåTilLosModal`. Preserve their props, callbacks, close behavior, conditional rendering, copy and geometry. When used inside the journalpost provider they must block the left work area through the custom overlay and leave PDF tabs and controls clickable. When used outside it they must remain normally blocking.

Add focused coverage for the provider default, an explicit blocking override and one representative shared confirmation dialog. Do not start phases 9 to 11 in this pass. Avoid unrelated formatting and do not change business logic, requests or navigation.

Before executing tests, lint, type checks or build, ask the user whether to run them here or locally. Leave all changes uncommitted for review.

## Plan

- [Completed] Complete phase 1: add `PunsjDialog` with `blocking` as the default and explicit `reference` mode, then migrate one blocking dialog and review the diff before committing.
- [Completed] Complete phase 2: migrate `KalenderMedModal` and `TidsbrukKalender` to explicit `reference` mode, then review the diff before committing. Manual PDF interaction verification remains.
- [Completed] Phase 3 made no additional migrations. Its blocking policy is superseded by the phase-7 product decision.
- [Completed] Focused coverage verifies both adapter modes and the calendar reference dialog. The old Modal CSS fallback remains.
- [Completed] Implement phase 5 with context-based renderer selection and PDF pointer coverage. Validation of the follow-up remains pending.
- [Completed] Complete phase 6: block and dim only the left work area while keeping PDF interaction enabled.
- [Completed] Complete phase 7: make `reference` the journalpost provider default while preserving blocking outside it.
- [Completed] Complete phase 8: migrate the shared journalpost modal components.
- [Pending] Complete phases 9 and 10 in separate reviewable passes.
- [Pending] Complete phase 11 only after the journalpost Modal inventory is empty.

## Progress notes

- Phase 1 started. `blocking` is the default; `reference` is opt-in only for PDF-assisted data entry.
- Phase 1 validated with `PunsjDialog.spec.tsx` and is ready to commit.
- Phase 2 validated with focused adapter and calendar tests. Manual PDF tab and control interaction remains.
- Follow-up: normal Aksel `DatePicker` renders a nested legacy Modal when it detects Dialog context. This blocks the reference PDF workflow and requires the phase-5 opt-in popover path.
- Phase 5 routing confirmed: the three longer-period calendar dialogs contain the affected `PeriodevelgerFormik` date fields.
- Limitation: public Aksel `DatePicker.Input` exposes its `aria-expanded` state only through `DatePicker`'s own popup state. Keeping that popup closed avoids the nested Modal but leaves the built-in trigger unable to report the external Popover state. This follow-up does not recreate the trigger with custom controls.
- Phase 6 decision: use a custom left-panel overlay because Aksel `withBackdrop` also disables pointer interaction with the PDF.
- Phase 6 implementation: the reference overlay uses the measured left-panel width and sits below Aksel Popover and Dialog layers.
- Product decision after phase 6: PDF pointer interaction should remain available for every dialog inside `JournalpostOgPdfVisning`, not only data-entry dialogs.
- Phase 7: `JournalpostOgPdfVisning` configures `reference` as the provider default; explicit `blocking` remains available per dialog.
- Phase 8: migrated `ErDuSikkerModal`, `ForhåndsvisSøknadModal`, `SettPåVentModal` and `OkGåTilLosModal` to the shared adapter.
- Review follow-up: the reference overlay is provider-scoped and remains singular while one or more reference dialogs are open.

## Outcome

- Changed files: `PunsjDialog`, journalpost provider configuration, the four shared modal components, focused dialog coverage and Cypress confirmation-dialog selectors.
- Validation: Full Jest-suite passed: 65 suites and 465 tests. Focused dialog, shared-confirmation and standalone calendar coverage passed.
- Remaining follow ups: Validate the provider-scoped overlay and phase 5 manually, then complete phases 9 to 11 in reviewable passes.
