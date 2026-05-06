# k9-punsj-frontend

Frontend for manuell "punching" av papirsøknader som kommer inn for ytelser i kapittel 9.

[![](https://github.com/navikt/k9-punsj-frontend/workflows/Build%20and%20deploy%20K9-punsj-frontend/badge.svg)](https://github.com/navikt/k9-punsj-frontend/actions?query=workflow%3A%22Build+and+deploy+K9-punsj-frontend%22)

## Komme i gang

k9-punsj-frontend har dependencies til pakker publisert fra [@navikt](https://github.com/navikt).

For å få hentet pakker fra GitHub sitt pakkeregistry må man sette opp lokal NPM med autentisering mot GitHub med en Personal Access Token (PAT) med `read:packages`-tilgang i lokalt utviklingsmiljø, før man gjør `yarn install --immutable`. GitHub har en guide på hvordan man gjør dette [her](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

TLDR er å opprette en GitHub PAT med kun `read:packages`-tilgang, enable SSO, og putte det i en egen `~/.yarnrc.yml`-fil slik:

```yaml
npmRegistries:
    https://npm.pkg.github.com:
        npmAlwaysAuth: true
        npmAuthToken: <token>
```

Merk at dette _ikke_ skal sjekkes inn i versjonskontroll.

Når dette er gjort kan man kjøre dette på rot av repo'et for å kjøre opp lokalt utviklingsmiljø:

```bash
yarn install --immutable
yarn dev
```

## Lokal utvikling med backend

Start Docker-tjenestene fra rot av repo:

```bash
yarn docker-up
```

Start deretter [K9PunsjApplicationWithMocks](https://github.com/navikt/k9-punsj/blob/master/app/src/test/kotlin/no/nav/k9punsj/K9PunsjApplicationWithMocks.kt) i [k9-punsj](https://github.com/navikt/k9-punsj).

Fullstendig oppsett med docker-innlogging, stopp-kommando og journalpostnumre for lokale mock-responser finner du i [dev/README.md](dev/README.md).

## UI-utvikling uten backend

Når du bare trenger frontend og mockdata, kan du jobbe uten å starte backend-repoet:

```bash
yarn test:e2eUI
```

Starter appen på `http://localhost:8080` med MSW-baserte testmocker og åpner Cypress UI for visuell debugging. Mockdata og scenarioliste ligger i [dev/README.md](dev/README.md).

## Nyttige kommandoer

```bash
yarn lint
yarn test
yarn build
yarn lint:css
```

## Tester

Alle enhetstester er plassert i [src/test](src/test).

```bash
yarn test
```

For headless e2e-kjøring med Cypress kan du bruke:

```bash
yarn test:e2e
```

`yarn test:e2e` og `yarn test:e2eUI` starter appen i testmodus automatisk før Cypress kjører scenariene.

Enhetstester, Cypress, lint og build valideres automatisk i GitHub Actions på pull requests og på pushes til [master](https://github.com/navikt/k9-punsj-frontend) som faktisk trigger workflowene.

## Arbeidsflyt og deploy

1. Lag en branch fra `master`.
2. Gjør endringene og push branchen til GitHub.
3. Opprett en pull request.
4. Pull requesten valideres automatisk med lint, tester, Cypress og build i GitHub Actions.
5. For deploy til preprod, kjør workflowen `Deploy til preprod gcp` manuelt i GitHub Actions og velg branchen som skal deployes. Workflowen bygger og deployer til `dev-gcp`.
6. For deploy til produksjon, merge pull requesten til `master`. Push til `master` trigger produksjonsworkflowen automatisk.

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

Interne henvendelser kan sendes via Slack i kanalen #sif_saksbehandling.

## Kode generert av GitHub Copilot

Dette repoet bruker GitHub Copilot aktivt til å generere og forbedre kode.

## Copilot og agenter

Repoet inneholder konfigurasjon for Copilot og AI-agenter.

- Generelle repo regler ligger i [AGENTS.md](AGENTS.md).
- Copilot-spesifikke instrukser ligger i [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
- Kort praktisk guide for arbeidsformer og cloud-bruk ligger i [`docs/copilot-workflow.md`](docs/copilot-workflow.md).
- Tilpassede repo-agenter ligger i [`.github/agents/`](.github/agents).
- Konkrete taskfiler for Copilot kan legges i [`copilot-tasks/`](copilot-tasks), og [template-task.md](copilot-tasks/template-task.md) kan brukes som startpunkt.
- Gjenbrukbare prompts ligger i [`.github/prompts/`](.github/prompts).
- Repo-spesifikke skills ligger i [`.github/skills/`](.github/skills).
- Lokal VS Code MCP-konfigurasjon ligger i [`.vscode/mcp.json`](.vscode/mcp.json).

![k9-punsj-frontend](logo.png)
