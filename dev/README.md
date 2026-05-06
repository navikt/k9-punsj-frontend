# Lokal utvikling

Detaljer for å kjøre opp k9-punsj-frontend lokalt med backend og mock-data.

## Lokal utvikling med backend

### Forutsetninger

Logg inn mot GitHub Container Registry med en GitHub PAT med `read:packages`-tilgang:

```bash
docker login ghcr.io -u x-access-token
# Passord: GitHub personal access token med kun read:packages-tilgang
```

### Start Docker-tjenester

Fra rot av repo:

```bash
yarn docker-up
```

Tilsvarer `docker-compose -f dev/docker-compose.yml up -d`.

For å stoppe:

```bash
yarn docker-down
```

### Start backend

Start klassen [K9PunsjApplicationWithMocks](https://github.com/navikt/k9-punsj/blob/master/app/src/test/kotlin/no/nav/k9punsj/K9PunsjApplicationWithMocks.kt) i [k9-punsj](https://github.com/navikt/k9-punsj).

> **Merk:** Får du feil lignende `Process [.../initdb, ...] failed`, følg løsningen med environment-variabler beskrevet [her](https://github.com/zonkyio/embedded-postgres/issues/11#issuecomment-533468269).

### Journalpostnumre for lokal utvikling (backend-mocker)

Noen journalpostnummer gir egne responser:

| Nummer        | Respons                                 |
| ------------- | --------------------------------------- |
| `200`         | Journalpost med PDF knyttet til PSB-sak |
| `404`         | Finnes ikke                             |
| `403`         | Ikke tilgang                            |
| `409`         | IkkeStøttet                             |
| `500`         | AbacError                               |
| `420`         | Journalpost knyttet til OLP-sak         |
| `7523521`     | Ferdigstilt med saksnummer              |
| `463687943`   | Finnes informasjon i Infotrygd          |
| `45537868838` | Journalpost støttes ikke                |

Andre nummer fungerer mot standard mock-responser.

## UI-utvikling uten backend (MSW-mocker)

For ren frontend-utvikling med MSW-baserte mocker, se `yarn test:e2eUI` i [rot-README](../README.md).

Mockdata ligger i [src/mocks/mockHandlersTest.ts](../src/mocks/mockHandlersTest.ts) og [cypress/fixtures](../cypress/fixtures).

### Journalpost-scenarier i mockmodus

| Nummer | Sakstype       | Status       | Scenario                                                                                                      |
| ------ | -------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `300`  | PSB            | MOTTATT      | Papirsøknad, ikke ferdigstilt, kan sendes inn                                                                 |
| `301`  | PPN (PILS)     | MOTTATT      | Papirsøknad, ikke ferdigstilt, kan sendes inn                                                                 |
| `302`  | OMP_KS         | MOTTATT      | Papirsøknad, ikke ferdigstilt, kan sendes inn                                                                 |
| `303`  | OMP_AO         | MOTTATT      | Papirsøknad, ikke ferdigstilt, kan sendes inn                                                                 |
| `304`  | OMP_MA         | MOTTATT      | Papirsøknad, ikke ferdigstilt, kan sendes inn                                                                 |
| `305`  | OMP            | MOTTATT      | Papirsøknad, ikke ferdigstilt, kan sendes inn                                                                 |
| `310`  | Ukjent (null)  | MOTTATT      | Ferdigstilt, kan **ikke** sendes inn, sakstype mangler                                                        |
| `311`  | PPN (PILS)     | JOURNALFOERT | Ferdigstilt, kan **ikke** sendes inn, innsendingtype UKJENT                                                   |
| `312`  | PSB            | JOURNALFOERT | Ferdigstilt, kan sendes inn, reservert saksnummer med fagsakId                                                |
| `314`  | OMP            | MOTTATT      | Ferdigstilt, kan sendes inn, reservert saksnummer, behandlingsår 2022, barnliste                              |
| `315`  | Uavklart (`-`) | MOTTATT      | Ferdigstilt, kan **ikke** sendes inn, innsendingtype UKJENT, sakstype uavklart                                |
| `320`  | PSB            | JOURNALFOERT | Ferdigstilt, kan **ikke** sendes inn, kan ikke opprette journalføringsoppgave, har fagsakId og pleietrengende |
| `206`  | –              | –            | HTTP 403 Forbidden                                                                                            |
| `200`  | –              | –            | Standard mock-data (journalpost.json), journalpostId settes dynamisk                                          |

Andre nummer ikke listet ovenfor går mot standard mockdata.
