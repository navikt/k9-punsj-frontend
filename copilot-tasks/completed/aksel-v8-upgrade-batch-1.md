# Copilot task

## Task

- Title: Aksel v8 upgrade, batch 1 foundation and compile safe migration
- Branch: `refactor/aksel-v8-upgrade`
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: `English`

## Goal

- Move the repo from Aksel 7 to Aksel 8 in one controlled first batch.
- Keep this batch reviewable by limiting it to the dependency lift, required setup changes, and the smallest set of source fixes needed for green validation.

## Context

- The repo currently uses:
    - `@navikt/ds-react@7.37.0`
    - `@navikt/ds-css@7.37.0`
    - `@navikt/ds-tailwind@7.37.0`
    - `@navikt/aksel-icons@7.37.0`
- The upgrade has a wide regression surface because the app has:
    - local CSS overrides tied to internal `.navds-*` classes
    - a few hardcoded `className="navds-..."`
    - older Aksel styling tokens in `Box` props and related usage
    - separate Storybook CSS handling
- The user wants this work split into sequential local review batches. After each batch they will inspect and test locally before the next commit or the next Copilot pass.

## Scope

- Allowed files or areas:
    - `package.json`
    - `yarn.lock`
    - `.storybook/**`
    - `tailwind.config.js`
    - `src/app/App.tsx`
    - `src/app/components/brev/MottakerVelger.tsx`
    - `src/app/home/components/OpprettJournalpostInngang.tsx`
    - `src/app/home/components/SendBrevIAvsluttetSakInngang.tsx`
    - the smallest additional app or style files that are directly required to make the Aksel v8 bump compile, lint, build, and render correctly
    - targeted tests or stories only if they are directly needed for this batch
    - `copilot-tasks/aksel-v8-upgrade-batch-1.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope for this batch:
    - broad cleanup of every `.navds-*` override in the repo
    - wide visual polish across all forms and pages
    - unrelated package upgrades
    - React migration work
    - Redux, RHF, validation, or domain refactors
    - moving this task file or managing task lifecycle

## Relevant files

- `package.json`
- `.storybook/main.ts`
- `.storybook/preview.ts`
- `tailwind.config.js`
- `src/app/App.tsx`
- `src/app/components/brev/MottakerVelger.tsx`
- `src/app/home/components/OpprettJournalpostInngang.tsx`
- `src/app/home/components/SendBrevIAvsluttetSakInngang.tsx`
- `src/app/components/punchPage.css`
- `src/app/components/pdf/pdfVisning.css`
- `src/app/styles/globals.css`
- `src/app/opprett-journalpost/opprettJournalpost.css`
- `src/app/send-brev-i-avsluttetSak/sendBrevIAvsluttetSak.css`

## Constraints

- Keep the change scoped to batch 1. Do not try to finish the whole migration in one pass.
- Upgrade the four core Aksel packages together.
- Default to a predictable light only setup if Aksel v8 requires an explicit theme decision. Do not introduce end user dark mode in this batch.
- Fix the known hardcoded `navds-*` className usage if it blocks or is clearly unsafe under v8.
- Only touch `.navds-*` CSS overrides that are directly necessary for this first batch to work.
- If a larger override rewrite is needed, leave it for batch 2 and call it out in `Outcome`.
- Reuse existing patterns and avoid broad component rewrites.
- Follow `AGENTS.md`.

## Planned split

- Batch 1, this task:
    - lift Aksel packages to v8
    - make the smallest setup and source changes needed for green validation
    - keep light only behavior explicit and stable
- Batch 2, later:
    - rewrite or remove broader `.navds-*` CSS overrides and old styling token usage
    - handle remaining visual fallout found after local review
- Batch 3, later:
    - finish Storybook and manual regression cleanup for sensitive pages and components

## Validation

- Commands to run:
    - `yarn install --immutable`
    - `yarn tsc --noEmit`
    - `yarn lint`
    - `yarn test --maxWorkers=2`
    - `yarn build`
    - `yarn build-storybook`
- If one or more commands fail, separate direct Aksel v8 fallout from pre existing issues in `Outcome`.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement only batch 1 from the split above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and explicit handoff notes for batch 2.
- Do not commit anything automatically.

## Prompt for Copilot

Implement batch 1 of the Aksel v8 migration on this branch. Start by updating the `Plan` section in this task file. Keep the scope tight: upgrade `@navikt/ds-react`, `@navikt/ds-css`, `@navikt/ds-tailwind`, and `@navikt/aksel-icons`, then make only the smallest setup and code changes required for a green compile, lint, test, app build, and Storybook build. Keep the app in explicit light only mode if v8 needs a theme decision. Do not turn this into a broad CSS cleanup. If you hit larger `.navds-*` override fallout, stop at the smallest safe point, document it in `Outcome`, and leave the rest for batch 2. Finish by updating `Outcome` with changed files, validation results, and the next follow ups.

Suggested starter prompt for chat:

- `Follow copilot-tasks/aksel-v8-upgrade-batch-1.md. First update the Plan section, then implement batch 1 only, keep Progress notes short, and finish by updating Outcome. Do not commit automatically.`

## Plan

1. Bump `@navikt/ds-react`, `@navikt/ds-css`, `@navikt/aksel-icons`, `@navikt/ds-tailwind` to `8.10.6` in `package.json` and run `yarn install`.
2. Replace hardcoded `navds-*` class names in `OpprettJournalpostInngang.tsx`, `SendBrevIAvsluttetSakInngang.tsx`, and `MottakerVelger.tsx` with proper Aksel component usage or equivalent styling.
3. Run Aksel codemods (`v8-box`, `v8-primitive-spacing`, `v8-tokens`) to automate source fixes for Box props, spacing tokens, and CSS tokens.
4. Ensure light-only mode by adding `data-theme="light"` or equivalent class to root element.
5. Fix any remaining TypeScript, lint, or build errors exposed by the upgrade.
6. Run all validation commands and document results.

## Progress notes

- Bumped 4 Aksel packages from 7.37.0 to 8.10.6, install clean.
- Replaced hardcoded `navds-button` classes in OpprettJournalpostInngang and SendBrevIAvsluttetSakInngang with `Button as={Link}`.
- Replaced `navds-label` span in MottakerVelger with `Label` component.
- Added `class="light"` to root `<html>` for explicit light-only mode.
- Ran `v8-primitive-spacing` codemod: 78 files updated (spacing tokens like `"4"` → `"space-16"`).
- Ran `v8-box` codemod: 46 files updated (background/borderColor/shadow props).
- Ran `v8-prop-deprecate` codemod: 2 files updated (removed deprecated props).
- Installed `@navikt/aksel` CLI as devDependency for codemods.

## Outcome

- Status: completed. This task now serves as the historical record for the first Aksel v8 pass.
- Changed files: the initial Copilot batch completed the dependency lift, light-only root setup, codemod-driven spacing and `Box` updates, and the first hardcoded `navds-*` replacements. The branch later continued with manual follow-up fixes for visual regressions in journalpost flow, legacy compat controls, top panel spacing, and datepicker bounds.
- Validation:
    - `yarn tsc --noEmit`: 6 pre-existing errors in test files (jest-dom matcher types unrelated to Aksel). Zero Aksel-related type errors.
    - `yarn lint`: clean
    - `yarn lint:css`: clean
    - `yarn test --maxWorkers=2`: 62 suites, 442 tests pass
    - `yarn build`: success
    - `yarn build-storybook`: success
- Remaining risks or follow ups:
    - Next work continues in `copilot-tasks/aksel-v8-upgrade-batch-2-visual-cleanup.md`.
    - Remaining `.navds-*` CSS override cleanup is intentionally deferred to batch 2.
    - `yarn tsc --noEmit` still has pre-existing `@testing-library/jest-dom` matcher type errors in test code.
