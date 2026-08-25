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
    - Do not use Aksel `withBackdrop` in `reference` mode. It would disable the required pointer interaction outside the popup.
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

## Validation

- Commands: identify or add focused tests for the adapter and affected dialog behavior.
- Skip or limitation note: ask the user before running tests, lint, typecheck or build. Manually verify that document tabs and PDF controls remain clickable while each journalpost dialog is open.

## Prompt for Copilot

Follow this task file. First update Plan, then implement, keep Progress notes short, and finish by updating Outcome.

Introduce two Aksel Dialog modes in small commits. The left work area is rendered by `JournalpostOgPdfVisning` and the PDF with document tabs is on the right. Do not make every dialog nonblocking.

Use the installed Aksel `Dialog`. Create a small context plus a compound adapter, for example `PunsjDialog` with `Header`, `Body` and `Footer`, with an explicit `interactionMode`. `blocking` is the default and uses normal `modal={true}` with the regular Aksel backdrop. In this mode the PDF remains visible as context but is not interactive. Use it for fordeling, submit and confirmation dialogs. `reference` is opt in only for data entry dialogs where the caseworker must inspect and interact with the PDF while entering values. It uses `modal="trap-focus"`, `withBackdrop={false}` and `closeOnOutsideClick={false}`. Start with both work time calendar dialog patterns: `KalenderMedModal` and `TidsbrukKalender`. Do not migrate other dialogs to `reference` mode without classifying the workflow. Do not change business behavior, copy, requests or navigation. Preserve the compact modal geometry, centered in the left work area.

Add focused test coverage where practical. Keep the current compact modal geometry, centered in the left work area, rather than changing it to a drawer. Before executing tests, lint, type checks or build, ask the user whether to run them here or let the user run them locally.

Follow the delivery phases in this task file. Keep one branch and make a separate logical commit after each completed phase. Do not add unrelated Modal migration outside `JournalpostRouter`.

## Plan

- [Completed] Complete phase 1: add `PunsjDialog` with `blocking` as the default and explicit `reference` mode, then migrate one blocking dialog and review the diff before committing.
- [Completed] Complete phase 2: migrate `KalenderMedModal` and `TidsbrukKalender` to explicit `reference` mode, then review the diff before committing. Manual PDF interaction verification remains.
- [Completed] No phase-3 dialogs were classified. Fordeling, submit and confirmation dialogs remain blocking.
- [Completed] Focused coverage verifies both adapter modes and the calendar reference dialog. The old Modal CSS fallback remains.

## Progress notes

- Phase 1 started. `blocking` is the default; `reference` is opt-in only for PDF-assisted data entry.
- Phase 1 validated with `PunsjDialog.spec.tsx` and is ready to commit.
- Phase 2 validated with focused adapter and calendar tests. Manual PDF tab and control interaction remains.

## Outcome

- Changed files: `PunsjDialog`, journalpost panel portal context, scoped dialog placement CSS, both work-time calendar dialog patterns and focused tests.
- Validation: `yarn test src/test/components/PunsjDialog.spec.tsx src/test/components/calendar/TidsbrukKalender.spec.tsx` passed with 2 suites and 6 tests.
- Remaining follow ups: Manually verify that PDF document tabs and controls remain clickable while each calendar dialog is open.
