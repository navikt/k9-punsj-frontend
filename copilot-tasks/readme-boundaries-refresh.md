# Copilot task

## Task

- Title: Refresh README boundaries and split deeper setup into the right docs
- Branch: `docs/readme-boundaries-refresh`
- Suggested agent: `@k9-punsj-front-forfatter-agent`
- Prompt language: `Norwegian`

## Goal

- Gjør root `README.md` til en tydelig startside for repoet i stedet for en blanding av startside, intern dev note og workflow note.
- Flytt eller forkort dypere local dev-detaljer til riktige dokumenter der det er naturlig, uten å miste nyttig informasjon.

## Context

- `README.md` ble forbedret i mars 2026 og er ikke lenger klart stale.
- Det som gjenstår er hovedsakelig boundary-arbeid, ikke en stor opprydding fra bunnen av.
- Root README blander fortsatt flere roller:
    - quick start
    - lokal backend og auth-oppsett
    - mock-basert frontendflyt
    - deploy-flyt
    - Copilot og agent-peker
- Repoet har en tom `dev/README.md`, så root README bærer i dag mer operational context enn ønskelig.
- Teamet ønsker fortsatt å beholde et tydelig utsagn om at repoet bruker GitHub Copilot til å generere kode. Dette punktet skal ikke fjernes, men kan omformuleres hvis det gir bedre kvalitet i README.

## Scope

- Allowed files or areas:
    - `README.md`
    - `dev/README.md`
    - `docs/copilot-workflow.md` only if small wording or link alignment is needed
    - `docs/CHANGELOG.md` if the documentation change merits a short note
    - `copilot-tasks/readme-boundaries-refresh.md` for `Plan`, `Progress notes`, and `Outcome`
- Out of scope:
    - `package.json`
    - `.github/workflows/**`
    - scripts, build, deploy behavior, or CI behavior
    - broader documentation restructuring outside the files listed above
    - changes to `AGENTS.md`, local `docsLocal/`, or repo prompts and agents

## Relevant files

- `README.md`
- `dev/README.md`
- `docs/copilot-workflow.md`
- `package.json`
- `.github/workflows/valid-pull-request.yml`
- `.github/workflows/test.yml`
- `.github/workflows/lint.yml`
- `.github/workflows/cypress-tester.yml`
- `.github/workflows/deploy-preprod-gcp.yml`
- `.github/workflows/build-and-deploy-gcp.yml`

## Constraints

- Keep the change scoped to documentation files in this task.
- Reuse existing repo wording and structure before inventing a new documentation system.
- Follow `AGENTS.md`, `.github/copilot-instructions.md`, and any relevant file specific instructions in `.github/instructions/`.
- Do not change runtime behavior, scripts, workflows, or commands. Only document them more clearly.
- Treat root `README.md` as a contributor-facing entrypoint, not a full internal wiki.
- If deeper local setup details still matter, prefer moving them into `dev/README.md` rather than keeping everything in root README.
- Keep the GitHub Copilot disclosure in root README.
    - It may be rephrased for clarity and tone.
    - It must remain clear that the repo uses GitHub Copilot to generate code.
- Do not remove deploy information entirely unless you replace it with a clearer short reference in the allowed documentation scope.
- Prefer repo scripts such as `yarn docker-up` and `yarn docker-down` over raw command sequences when documenting the normal path.
- Keep Norwegian wording natural and concise.
- Avoid turning README into a long handover note.

## Validation

- Commands to run:
    - `yarn lint README.md dev/README.md docs/copilot-workflow.md` is not applicable, because these are Markdown files and the repo does not expose a Markdown lint task
    - `sed -n '1,260p' README.md`
    - `sed -n '1,220p' dev/README.md`
    - `rg -n "\"(dev|lint|test|test:e2e|test:e2eUI|storybook|build-storybook|docker-up|docker-down|lint:css)\"" package.json`
    - `rg -n "node-version:|yarn install|yarn test|yarn lint|cypress|start:e2e|deploy" .github/workflows`
- If you choose not to update `dev/README.md`, explain why in `Outcome`.

## Plan

1. Flytt "Lokal utvikling (innlogging & k9-punsj)" med docker-oppsett og journalpost-tabeller til `dev/README.md`.
2. Erstatt rå `docker-compose`-kommandoer i README med `yarn docker-up` / `yarn docker-down` der relevant.
3. Forkort avsnittet "UI-utvikling uten backend" i rot-README – behold kommandoen og en kort forklaring, men fjern den detaljerte listen over mock-scenarionumre til `dev/README.md`.
4. Hold rot-README som tydelig contributor-entrypoint: intro, komme i gang, korte pekere til `dev/README.md`, kommandoer, tester, deploy, henvendelser, Copilot-disclosure og agentreferanser.
5. Oppdater `docs/CHANGELOG.md` med en kort linje under `Unreleased`.

## Progress notes

- Analysert nåværende README mot `package.json` og eksisterende docs-struktur.
- `dev/README.md` var tom – skrevet fra bunnen av med docker-oppsett og journalpost-tabeller.
- Rot-README forkortet: rå `docker-compose`-kommandoer og journalpost-lister fjernet, erstattet med `yarn docker-up`/`yarn docker-down` og peker til `dev/README.md`.

## Outcome

**Endrede filer:**

- `README.md` – kortere og tydeligere entrypoint; operasjonelle detaljer erstattet med pekere til `dev/README.md`; Copilot-disclosure omformulert
- `dev/README.md` – ny innhold: docker-oppsett, journalpost-tabeller for backend-mocker og MSW-mocker
- `docs/CHANGELOG.md` – kort linje under nyeste oppføring

**Ikke endret:** `docs/copilot-workflow.md` – ingen small wording eller link-justering var nødvendig.

**Validering:** `sed -n '1,260p' README.md` og `sed -n '1,220p' dev/README.md` viser korrekt struktur. Ingen runtime-atferd, scripts eller workflows er endret.

**Gjenstående risiko:** ingen.
