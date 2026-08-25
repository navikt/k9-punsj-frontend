# Copilot task

## Task

- Title: Use Aksel Dialog for journalpost PDF interaction
- Branch: `refactor/journalpost-dialog-trap-focus`
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: English

## Goal

- Keep normal dialogs blocking while allowing explicitly classified data-entry dialogs to leave document tabs and PDF controls interactive in the right panel.

## Scope

- Allowed files: `src/app/components/JournalpostOgPdfVisning.tsx`, existing journalpost dialog components, directly related local CSS and focused tests.
- Out of scope: business logic, API calls, navigation, i18n copy, dependency changes and dialogs outside the journalpost flow.
- Constraints:
    - Use Aksel `Dialog` already available in `@navikt/ds-react` 8.16.1.
    - The adapter must expose an explicit `interactionMode`: `blocking` by default and `reference` only when passed by a data entry dialog.
    - `blocking` uses Aksel's normal `Dialog.Popup modal={true}` with its regular backdrop. The PDF remains visible as context but cannot be interacted with.
    - `reference` uses `Dialog.Popup modal="trap-focus"`, `withBackdrop={false}` and `closeOnOutsideClick={false}`. Use it only where the caseworker needs to interact with the PDF while entering data.
    - Aksel `DatePicker` must not render its built in nested `Modal` inside a `reference` dialog. It blocks pointer interaction with the PDF.
    - Let the existing `Datovelger` and `DatovelgerFormik` wrappers select the reference renderer from the surrounding `PunsjDialog` interaction-mode context. Do not add a second general-purpose public date picker API.
    - The opt-in renderer must keep the existing input, formatting, validation and date constraints, but render the calendar with public Aksel `Popover` and `DatePicker.Standalone` or an equivalent public API. Do not use the normal `DatePicker` popup path, Aksel internal imports or CSS overrides of a nested modal.
    - Do not use Aksel `withBackdrop` in `reference` mode. It would disable the required pointer interaction outside the popup.
    - If the left work area should be dimmed and blocked in `reference` mode, use a custom interaction overlay limited to the left panel. It must not cover or disable pointer interaction with the PDF panel.
    - The custom overlay must use `pointer-events: auto`, remain below the dialog popup and date popover, follow the measured left-panel width and cover the visible work area. Do not implement it with Aksel `withBackdrop` or a full-page overlay.
    - Preserve blocking modal behavior for shared dialogs outside `JournalpostOgPdfVisning`.
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
3. `refactor: classify selected punch dialogs`
    - Migrate only additional data entry dialogs that need PDF interaction.
    - Keep fordeling, submit and confirmation dialogs in `blocking` mode unless explicitly classified otherwise.
4. `test: cover journalpost dialog modes`
    - Add focused coverage for both modes. Keep the old Modal CSS fallback until a separate full migration.
5. `fix: keep reference date picker nonmodal`
    - Implement the opt-in date picker renderer and use it only in reference dialog workflows that contain date fields.
    - Add a real pointer interaction test for the PDF area while both the reference dialog and its date calendar are open.
6. `feat: block only the left area behind reference dialogs`
    - Add a custom visual and interaction overlay over the left journalpost panel in `reference` mode.
    - Keep the dialog popup and reference date popover interactive above it.
    - Verify that one click on the covered left form does nothing while one click on a PDF tab or control still works.

## Validation

- Commands: identify or add focused tests for the adapter and affected dialog behavior.
- Skip or limitation note: ask the user before running tests, lint, typecheck or build. Manually verify that document tabs and PDF controls remain clickable while each reference dialog and its date calendar are open.

## Prompt for Copilot

Follow this task file and implement phase 6 only. First update Plan, keep Progress notes short and finish by updating Outcome.

Add a custom visual and interaction overlay for `PunsjDialog` in `reference` mode. It must cover and block mouse interaction only in the left journalpost work area while leaving the PDF panel and its document tabs and controls interactive. Do not use Aksel `withBackdrop`, a native dialog backdrop, an iframe or a full-page overlay. Keep `modal="trap-focus"`, `withBackdrop={false}` and `closeOnOutsideClick={false}`.

Place the overlay below the dialog popup and reference date popover. Use the existing measured left-panel geometry rather than a hard-coded percentage. Preserve blocking mode unchanged. Add focused pointer tests for a covered left-form control and an uncovered PDF control. Do not change business logic, copy, requests or navigation.

Before executing tests, lint, type checks or build, ask the user whether to run them here or locally. Do not commit the phase-6 implementation unless the user explicitly asks after reviewing the diff.

## Plan

- [Completed] Complete phase 1: add `PunsjDialog` with `blocking` as the default and explicit `reference` mode, then migrate one blocking dialog and review the diff before committing.
- [Completed] Complete phase 2: migrate `KalenderMedModal` and `TidsbrukKalender` to explicit `reference` mode, then review the diff before committing. Manual PDF interaction verification remains.
- [Completed] No phase-3 dialogs were classified. Fordeling, submit and confirmation dialogs remain blocking.
- [Completed] Focused coverage verifies both adapter modes and the calendar reference dialog. The old Modal CSS fallback remains.
- [Completed] Implement phase 5 with context-based renderer selection and PDF pointer coverage. Validation of the follow-up remains pending.
- [Pending] Complete phase 6: block and dim only the left work area while keeping PDF interaction enabled.

## Progress notes

- Phase 1 started. `blocking` is the default; `reference` is opt-in only for PDF-assisted data entry.
- Phase 1 validated with `PunsjDialog.spec.tsx` and is ready to commit.
- Phase 2 validated with focused adapter and calendar tests. Manual PDF tab and control interaction remains.
- Follow-up: normal Aksel `DatePicker` renders a nested legacy Modal when it detects Dialog context. This blocks the reference PDF workflow and requires the phase-5 opt-in popover path.
- Phase 5 routing confirmed: the three longer-period calendar dialogs contain the affected `PeriodevelgerFormik` date fields.
- Limitation: public Aksel `DatePicker.Input` exposes its `aria-expanded` state only through `DatePicker`'s own popup state. Keeping that popup closed avoids the nested Modal but leaves the built-in trigger unable to report the external Popover state. This follow-up does not recreate the trigger with custom controls.
- Phase 6 decision: use a custom left-panel overlay because Aksel `withBackdrop` also disables pointer interaction with the PDF.

## Outcome

- Changed files: `PunsjDialog`, both `Datovelger` variants, the reference date picker renderer and focused pointer coverage.
- Validation: Earlier focused dialog and calendar tests passed. Phase-5 checks were not rerun after the follow-up implementation.
- Remaining follow ups: Manually verify PDF interaction while a reference date popover is open, then complete phase 6.
