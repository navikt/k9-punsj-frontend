# k9-punsj-frontend

Frontend for manuell "punching" av papirsøknader som kommer inn for ytelser i kapittel 9.

[![](https://github.com/navikt/k9-punsj-frontend/workflows/Build%20and%20deploy%20K9-punsj-frontend/badge.svg)](https://github.com/navikt/k9-punsj-frontend/actions?query=workflow%3A%22Build+and+deploy+K9-punsj-frontend%22)

## Komme i gang

k9-punsj-frontend har dependencies til pakker publisert fra [@navikt](https://github.com/navikt).

For å få hentet pakker fra GitHub sitt pakkeregistry må man sette opp lokal NPM med autentisering mot GitHub med en Personal Access Token (PAT) med `read:packages`-tilgang i lokalt utviklingsmiljø, før man gjør `yarn install`. GitHub har en guide på hvordan man gjør dette [her](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

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
yarn install
yarn dev
```

## Lokal utvikling (innlogging & k9-punsj)

1. `cd dev`
2. `docker login ghcr.io -u x-access-token (GitHub personal access token med kun read-rettigheter som passord)`
3. `docker-compose pull`
4. `docker-compose up`
5. Start opp klassen [K9PunsjApplicationWithMocks](https://github.com/navikt/k9-punsj/blob/master/app/src/test/kotlin/no/nav/k9punsj/K9PunsjApplicationWithMocks.kt) i [k9-punsj](https://github.com/navikt/k9-punsj)
    - Om du får feil lignende `Process [/var/folders/***/embedded-pg/***/bin/initdb, -A, trust, -U, postgres, -D, /var/folders/h/***, -E, UTF-8] failed` følg løsning med å sette environment variabler beskrevet i [her](https://github.com/zonkyio/embedded-postgres/issues/11#issuecomment-533468269)

### Journalpostnumre for lokal utvikling

Man kan taste inn hvilket nummer som helst som journalpostID. Noen journalpostnummer har egne responser.

```text
- 200: Gir journalpost med PDF dokument knyttet til PSB-sak
- 404: Finnes ikke
- 403: Ikke tilgang
- 409: IkkeStøttet
- 500: AbacError
- 420: Journalpost knyttet til OLP-sak
- 7523521: Ferdigstilt med saksnummer
- 463687943: Finnes informasjon i Infotrygd.
- 45537868838: Journalpost støttes ikke.
```

## UI-utvikling uten backend

Når du bare trenger frontend og mockdata, kan du jobbe uten å starte backend-repoet.

```bash
yarn test:e2eUI
```

Starter appen lokalt på `http://localhost:8080` med MSW-baserte testmocker og uten proxy til lokal backend, og åpner Cypress UI slik at du kan kjøre eller debugge scenarier visuelt mens du jobber i frontend.

Mockdata for denne modusen ligger hovedsakelig i [src/mocks/mockHandlersTest.ts](src/mocks/mockHandlersTest.ts) og [cypress/fixtures](cypress/fixtures).

I mockmodus finnes det egne journalpost-scenarier for blant annet `300`, `301`, `302`, `303`, `304`, `305`, `310`, `311`, `312`, `314` og `320`. Disse er koblet til egne fixtures i testoppsettet. `200` og andre journalpostnummer som ikke er listet her går som hovedregel mot standard mockdata, mens `206` brukes som et eget `403`-scenario.

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

Dette repoet bruker GitHub Copilot til å generere kode.

## Copilot og agenter

Repoet har delt konfigurasjon for Copilot og AI-agenter.

- Generelle repo regler ligger i [AGENTS.md](AGENTS.md).
- Copilot-spesifikke instrukser ligger i [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
- Kort praktisk guide for arbeidsformer og cloud-bruk ligger i [`docs/copilot-workflow.md`](docs/copilot-workflow.md).
- Tilpassede repo-agenter ligger i [`.github/agents/`](.github/agents).
- Konkrete taskfiler for Copilot kan legges i [`copilot-tasks/`](copilot-tasks), og [template-task.md](copilot-tasks/template-task.md) kan brukes som startpunkt.
- Gjenbrukbare prompts ligger i [`.github/prompts/`](.github/prompts).
- Repo-spesifikke skills ligger i [`.github/skills/`](.github/skills).
- Lokal VS Code MCP-konfigurasjon ligger i [`.vscode/mcp.json`](.vscode/mcp.json).

![k9-punsj-frontend](logo.png)
![7aa5dd7e-33d3-49b4-b23b-ab2b637fbe1a](https://github.com/navikt/k9-punsj-frontend/assets/25080417/4dab2369-6493-4abb-a613-a5f409ecfd57)
