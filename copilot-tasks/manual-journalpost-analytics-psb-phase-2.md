# Copilot task

## Task

- Title: Extend PSB manual journalpost analytics
- Branch: `feature/analytics-manual-journalpost-fields` (recreate from current `master` first if missing locally)
- Suggested agent: `@k9-punsj-front-observability-agent`
- Prompt language: `Norwegian`

## Goal

- Utvid eksisterende `PSB`-måling for manuell journalpost slik at flere trygge feltgrupper blir synlige enn dagens `arbeidstid`, `trekk_av_periode`, `periode` og `annet`.
- Hold hele endringen avgrenset til `PSB` i dette passet.

## Context

- Repoet har allerede `manual_journalpost_flow_started`, `punsj_started`, `punsj_submit_snapshot` og `punsj_submit_field_group`.
- Dagens `PSB`-mapping i `src/app/utils/faroEvents.ts` slår mange toppnivåområder sammen til `annet`.
- Teamet ønsker flere feltgrupper i `PSB` før vi ruller samme mønster ut til andre søknadstyper.
- Analytics skal fortsatt bare sendes når flyten kommer fra manuelt `Opprett journalpost`.

## Scope

- Allowed files or areas:
  - `src/app/utils/faroEvents.ts`
  - `src/test/utils/faroEvents.spec.ts`
  - `src/app/models/types/PSBSoknadKvittering.ts` only if typing support is needed
  - `docs/CHANGELOG.md` if the code change merits a short note
- Out of scope:
  - andre søknadstyper enn `PSB`
  - store refaktorer for generisk analytics-layer
  - Grafana dashboard changes
  - backend changes

## Relevant files

- `src/app/utils/faroEvents.ts`
- `src/test/utils/faroEvents.spec.ts`
- `src/app/søknader/pleiepenger/containers/PSBPunchForm.tsx`
- `src/app/models/types/PSBSoknadKvittering.ts`

## Constraints

- Keep the change scoped to this task.
- Reuse existing repo patterns before adding abstractions.
- Follow `AGENTS.md`, `.github/copilot-instructions.md`, and any relevant file specific instructions in `.github/instructions/`.
- Do not include secrets, personopplysninger, journalpostId, søknadId, fagsakId, or free text in analytics payloads or test examples.
- Keep analytics gated to manual journalpost flow only.
- Do not introduce a generic cross-søknad abstraction in this pass unless the current `PSB` change strictly requires it.
- Prefer stable short field group names over UI labels.

## Validation

- Commands to run:
  - `yarn test src/test/utils/faroEvents.spec.ts --runInBand`
  - `yarn eslint src/app/utils/faroEvents.ts src/test/utils/faroEvents.spec.ts`
- If additional tests are touched, report them in `Outcome`.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the task and allowed files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution. The user handles task lifecycle manually.

## Prompt for Copilot

Follow this task file. First update the `Plan` section, then implement the task, keep `Progress notes` short, and finish by updating `Outcome`.

Goal:

- extend the `PSB` analytics taxonomy for manual journalpost submits
- keep source gating unchanged
- avoid persondata and free text

Implementation expectations:

- update the `PSB` field group mapping in `src/app/utils/faroEvents.ts`
- keep `punsj_submit_snapshot` and `punsj_submit_field_group` as the event model
- update tests in `src/test/utils/faroEvents.spec.ts`
- avoid touching other søknadstyper in this pass

When choosing the new groups:

- prefer top-level safe categories from the backend kvittering
- keep names stable and short
- avoid sending raw field values

Finish with:

- short summary of changed files
- validation result
- remaining risks or follow ups

## Plan

1. Inspect the current PSB analytics mapping and related tests.
2. Extend only the PSB field group taxonomy with safe top-level kvittering groups.
3. Update focused `faroEvents` tests for the new groups and fallback behavior.
4. Run the targeted test and eslint commands from this task.
5. Review diffs and record the outcome.

## Progress notes

- Recreated `feature/analytics-manual-journalpost-fields` from current `master`.
- Extended PSB field group mapping without changing manual journalpost gating.
- Ran targeted validation successfully.

## Outcome

- Changed files: `src/app/utils/faroEvents.ts`, `src/test/utils/faroEvents.spec.ts`, `docs/CHANGELOG.md`, `copilot-tasks/manual-journalpost-analytics-psb-phase-2.md`
- Validation: `yarn test src/test/utils/faroEvents.spec.ts --runInBand`, `yarn eslint src/app/utils/faroEvents.ts src/test/utils/faroEvents.spec.ts`
- Remaining risks or follow ups: other søknadstyper are still out of scope for this PSB-only pass.
