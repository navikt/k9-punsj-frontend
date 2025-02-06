# k9-punsj-frontend

Frontend for manuell "punching" av papirsøknader som kommer inn for ytelser i kapittel 9.

[![](https://github.com/navikt/k9-punsj-frontend/workflows/Build%20and%20deploy%20K9-punsj-frontend/badge.svg)](https://github.com/navikt/k9-punsj-frontend/actions?query=workflow%3A%22Build+and+deploy+K9-punsj-frontend%22)

## Komme i gang

k9-los-web har dependencies til pakker publisert fra [@navikt](https://github.com/navikt).

For å få hentet pakker fra GitHub sitt pakkeregistry må man sette opp lokal NPM med autentisering mot GitHub med en Personal Access Token (PAT) med `read:packages`-tilgang i lokalt utviklingsmiljø, før man gjør `yarn install`. GitHub har en guide på hvordan man gjør dette [her](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

TLDR er å opprette en GitHub PAT med kun `read:packages`-tilgang, enable SSO, og putte det i en egen ~/.yarnrc.yml-fil slik:

```
npmRegistries:
  https://npm.pkg.github.com:
    npmAlwaysAuth: true
    npmAuthToken: <token>
```

Merk at dette _ikke_ skal sjekkes inn i versjonskontroll.

Når dette er gjort kan man kjøre dette på rot av repo'et for å kjøre opp lokalt utviklingsmiljø:

```
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

### Saksnummer for lokal utvikling

Man kan taste in hvilket nummer som helst som journalpostID. Noen journalpostnummer har ulike responser.

```
- 200: Gir journalpost med PDF dokument.
- 404: Finnes ikke
- 403: Ikke tilgang
- 463687943: Finns informasjon i Infotrygd.
- 45537868838: Journalpost støttes ikke.
```

## Test

```
yarn test
```

Testene kjører automatisk når ny kode dyttes til [master](https://github.com/navikt/k9-punsj-frontend).

## Enhetstester

Alle enhetstester er plassert i [src/test](src/test). De kan kjøres med følgende kommando:

```
yarn test
```

Testene kjører automatisk når ny kode dyttes til [master](https://github.com/navikt/k9-punsj-frontend).

## To do

- Utvide for flere søkere
- Utvide søknadsskjemaet

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

Interne henvendelser kan sendes via Slack i kanalen #sif_saksbehandling.

![k9-punsj-frontend](logo.png)
![7aa5dd7e-33d3-49b4-b23b-ab2b637fbe1a](https://github.com/navikt/k9-punsj-frontend/assets/25080417/4dab2369-6493-4abb-a613-a5f409ecfd57)

## Kode generert av GitHub Copilot

Dette repoet bruker GitHub Copilot til å generere kode.
