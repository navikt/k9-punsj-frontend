# Copilot task

Keep task files short. Put long reasoning in local notes, not here.

## Task

- Title: Remove direct date-fns dependency after ulid cleanup
- Branch: `chore/weekly-package-maintenance`
- Suggested agent: `default Copilot coding agent`
- Prompt language: `English`

## Goal

- Remove direct `date-fns` usage from frontend source code.
- Keep `src/app/utils/date/dateFormat.ts` as the public helper module with unchanged exported API and behavior.
- Keep `date-fns` in dependencies if required by transitive packages and source-map-loader resolution.

## Scope

- Allowed files:
    - `package.json`
    - `yarn.lock`
    - `src/app/utils/date/dateFormat.ts`
    - `copilot-tasks/date-fns-direct-dependency-cleanup.md`
- Out of scope:
    - broader date utility refactors
    - changing public exports from `dateFormat.ts`
    - replacing existing `dayjs` setup

## Validation

- Commands:
    - `yarn install`
    - `yarn build`
    - `yarn lint`
    - `yarn tsc --noEmit -p tsconfig.json`

## Plan

- Replace direct `date-fns` usage in `dateFormat.ts` with existing `dayjs` usage.
- Preserve exported API and behavior in `dateFormat.ts`.
- Keep dependency graph build-safe for transitive consumers that reference `date-fns` in sourcemaps.
- Run required validation commands and record outcome.

## Progress notes

- Removed direct `date-fns` import from `dateFormat.ts` and replaced valid/format call path with `dayjs` equivalent.
- Kept `date-fns` dependency in place because transitive packages (`@navikt/ds-react`, `react-day-picker`) still trigger source-map-loader ENOENT lookups without it.

## Outcome

- Changed files:
    - `src/app/utils/date/dateFormat.ts`
    - `copilot-tasks/date-fns-direct-dependency-cleanup.md`
- Validation:
    - `yarn install` exit `0`
    - `yarn build` exit `0`
    - `yarn lint` exit `0`
    - `yarn tsc --noEmit -p tsconfig.json` exit `0`
- Remaining follow ups:
    - Keep `date-fns` dependency until source-map-loader/transitive resolution no longer requires it.
