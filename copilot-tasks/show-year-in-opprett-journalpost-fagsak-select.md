# show-year-in-opprett-journalpost-fagsak-select

## Task

- Title: Vis behandlingsår i fagsak-select på Opprett journalpost
- Branch: show-year-in-opprett-journalpost-fagsak-select
- Suggested agent: `@k9-punsj-front-aksel-agent`
- Prompt language: Norwegian

## Goal

Vis `behandlingsår` i hvert fagsak-alternativ i Select-feltet på Opprett journalpost-skjermen, slik at saksbehandler kan skille mellom OMS-fagsaker for ulike år.

## Context

Fagsak-modellen har et `behandlingsår`-felt som brukes for omsorgspenger (OMS/OMP). På Fordeling-siden vises dette året i fagsak-selecten og i info-panelet. På Opprett journalpost-skjermen vises ikke behandlingsår i select-alternativene, noe som gjør det vanskelig å skille fagsaker for ulike år.

## Scope

- Allowed files or areas:
  - `src/app/opprett-journalpost/OpprettJournalpost.tsx`
  - `src/app/i18n/nb.json`
- Out of scope: Fordeling, andre skjermbilder, fagsak-API

## Relevant files

- `src/app/opprett-journalpost/OpprettJournalpost.tsx`
- `src/app/types/Fagsak.ts`
- `src/app/i18n/nb.json`

## Constraints

- Keep the change scoped to this task.
- Reuse existing repo patterns before adding abstractions.
- Follow `AGENTS.md`, `.github/copilot-instructions.md`, and any relevant file specific instructions in `.github/instructions/`.
- Do not include secrets, personopplysninger, or sensitive case data in prompts or examples.
- Stay consistent with the touched area for naming, styling, accessibility, workflows, auth, and security.

## Validation

- `yarn lint`
- `yarn tsc --noEmit`

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to the task and allowed files above.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution. The user handles task lifecycle manually.

## Plan

1. Destructurer `behandlingsår` fra fagsak-objektet i `fagsaker.map(...)` i `OpprettJournalpost.tsx`.
2. Send `behandlingsår` som verdi til `FormattedMessage` for alternativteksten.
3. Oppdater i18n-nøkkelen `opprettJournalpost.select.fagsakId.option` i `nb.json` til å inkludere `{behandlingsår}` når det er satt.

## Progress notes

- Implementert: behandlingsår destrukturert og sendt til FormattedMessage i OpprettJournalpost.tsx.
- i18n-nøkkel oppdatert i nb.json med behandlingsår-placeholder.

## Outcome

- Changed files:
  - `src/app/opprett-journalpost/OpprettJournalpost.tsx`
  - `src/app/i18n/nb.json`
  - `src/mocks/handlers.ts` — rettet `behandlingsAar` til `behandlingsår` i mock for `/api/k9-punsj/saker/hent`
  - `copilot-tasks/show-year-in-opprett-journalpost-fagsak-select.md`
- Validation: `yarn lint` og `yarn tsc --noEmit` kjørt uten feil.
- Remaining risks or follow ups: Ingen.
