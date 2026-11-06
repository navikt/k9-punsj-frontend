# Playwright

The Chromium smoke suite runs the frontend with its existing MSW test handlers. It does not call the backend.

Install Chromium once:

```sh
yarn exec playwright install chromium
```

Run the suite:

```sh
yarn test:pw
yarn test:pw --workers=1
yarn test:pw -g "viser inngangen"
yarn test:pw:ui
```

Playwright starts `yarn start:e2e`, waits for `/health/isReady`, and stops the server after the run. The app uses port 8080, which it shares with local development and Cypress; only one server can use that port at a time. If the port is occupied, stop the server you started before running the suite.

## Fordeling PSB pilot

Run the focused modal test, preserve the existing letter integration, and run both independent browser journeys with one and the default worker count:

```sh
yarn test src/test/components/fordeling/KlassifiserModal.spec.tsx
yarn test src/test/components/brev/BrevIntegrations.spec.tsx
yarn test:pw e2e/tests/fordeling-psb.spec.ts --workers=1
yarn test:pw e2e/tests/fordeling-psb.spec.ts
yarn lint
yarn build-storybook
```

The modal spec covers the Fortsett/Vent summary for an existing PSB case with a child and Vent without a child, cancellation, successful classification and Redux refresh, Vent ordering, classification retry, Vent-only retry, and the current 403 refresh-error behavior. The Playwright journeys use test-only journalpost IDs `930300` and `930301`, with existing synthetic applicant, child, and case data from `jpPSB300.json` and `fagsaker.json`.

If the post-classification journalpost refresh returns 403, the current modal shows the access warning, stays on the journalpost, and offers **Gå til LOS**. It has no in-modal refresh retry; the pilot records this existing behavior without changing production.

| Existing `cypress/e2e/fordeling/PSB.cy.js` assertion                                                                                                           | Automatic destination                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| PSB is selected, the two-applicant checkbox is visible and unchecked, and both journalfør buttons start disabled                                               | `fordeling-psb.spec.ts` — `velger saker med og uten barn, og åpner riktig modal uten å utføre handlingen` |
| Confirm the applicant; select the existing case without a child; verify its link, “Barn: ikke satt”, journalpost panel and button states; open and cancel Vent | The same Playwright journey                                                                               |
| Change to the existing case with a child; verify the child name/ID and journalpost panel update; open and cancel both Fortsett and Vent                        | The same Playwright journey                                                                               |
| Confirm the selected child case, verify the classification request and refreshed journalpost, then display the PSB registration choice                         | `fordeling-psb.spec.ts` — `journalfører valgt PSB-sak og går til riktig registreringsvalg`                |
| Modal summary fields, warning, action callbacks, error/retry behavior and Redux update after refresh                                                           | `KlassifiserModal.spec.tsx`                                                                               |
| Document-type option list, reserved/new cases, multiple applicants and the remaining PSB variants                                                              | Still in Cypress or later migration scope; not replaced by this pilot                                     |

Five manual modal stories are available at [Fortsett med eksisterende sak og barn](http://localhost:6006/?path=/story/components-klassifisermodal--fortsett-med-eksisterende-sak-og-barn), [Vent med eksisterende sak og barn](http://localhost:6006/?path=/story/components-klassifisermodal--vent-med-eksisterende-sak-og-barn), [Vent uten barn](http://localhost:6006/?path=/story/components-klassifisermodal--vent-uten-barn), [Journalfør-feil med vellykket nytt forsøk](http://localhost:6006/?path=/story/components-klassifisermodal--journalfor-feil-med-vellykket-nytt-forsok), and [Vent-feil med vellykket retry](http://localhost:6006/?path=/story/components-klassifisermodal--vent-feil-med-vellykket-retry). They use isolated stores, routers, query clients and named MSW groups; the LOS action is local Storybook feedback.

For browser review, start Storybook with `yarn storybook --host 127.0.0.1` and the [Playwright UI](http://127.0.0.1:9324/) with `yarn test:pw:ui e2e/tests/fordeling-psb.spec.ts --ui-host=127.0.0.1 --ui-port=9324`. For direct app links, start `yarn start:e2e` on port 8080 only when Playwright is not running tests; the two processes cannot share that port. Open [journalpost 930300](http://127.0.0.1:8080/journalpost/930300) to switch from the case without a child to the case with a child and cancel each modal. Open [journalpost 930301](http://127.0.0.1:8080/journalpost/930301), choose the existing case with a child, confirm journalføring, then choose **Registrere opplysninger til K9**. Stop manually started servers with Ctrl+C in their terminals. The pilot stops at the registration choice: it does not create, edit, validate or submit a PSB application.

## Fordeling nullstilling

Kjør de to reset-reisene alene og sammen med PSB-piloten:

```sh
yarn test:pw e2e/tests/fordeling-reset.spec.ts --workers=1
yarn test:pw e2e/tests/fordeling-reset.spec.ts e2e/tests/fordeling-psb.spec.ts
```

Validering 2026-11-06 etter integrering av #3973: kombinert kjøring av reset- og PSB-testene med standard workers (2) ga fire bestått, uten forventede feil eller skips. Kjøringen brukte eksisterende MSW-testserver med bekreftet oppdatert kode og midlertidig konfigurasjon utenfor repoet. `yarn lint` og `git diff --check` bestod. Dette avslutter regresjonsoppfølgingen for B27, ikke hele Fordeling-migreringen.

| Eksisterende `cypress/e2e/fordeling/PSB.cy.js`-assertion                                                                                 | Automatisk dekning                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 354–364: Ny-sak-modus fjerner gammel sak fra panelet og deaktiverer handlingene | Søkerreisen, steget «Bytt til ny fagsak og fjern tidligere valg», kontrollerer også tom/deaktivert select og fjernet saksinformasjon |
| 627–637: Nei fjerner saksvalg, reservasjon, pleietrengende-input, «har ikke fødselsnummer» og informasjon, og deaktiverer begge handlinger | `fordeling-reset.spec.ts` — `nullstiller søker og barn når søkeridenten endres`, steget «Bytt til ny fagsak og fjern tidligere valg»             |
| 638–657: Ny søker og barn vises i panelet og aktiverer handlingene                                                                        | Samme reise, steget «Velg ny søker og barn, og avbryt begge modalene»; lookup-header og eget, avgrenset saksdatasett kontrolleres også. Vent er deaktivert etter at ny søker er lastet, før barn velges |
| 659–719: Fortsett- og Vent-modal for ny søker/barn uten saksnummer eller periode, med avbryt                                               | Samme reise og steg; felles modaltekst og handlinger dekkes også av `KlassifiserModal.spec.tsx` — `$name viser valgt sak og avbryter uten å journalføre` (Fortsett med eksisterende sak og barn / Vent med eksisterende sak og barn / Vent med eksisterende sak uten barn) |
| 721–737: Ja gjenoppretter journalpostens søker og fjerner ny søker/barn                                                                    | Samme reise, steget «Bekreft opprinnelig søker på nytt»; panel og Fortsett er verifisert. Vent er deaktivert rett etter søkerbyttet og fortsatt deaktivert etter at «Det gjelder et annet barn» åpnes med nullstilt checkbox |
| PLS mellom PSB-valg, deretter nytt PSB-valg uten gammel sak/barn                                                                           | `fordeling-reset.spec.ts` — `nullstiller sak og barn ved bytte av dokumenttype`; tilleggsdekning utover gammel Cypress                         |

Reisene bruker `930302` og `930303`. Sakslisten for ny søker installeres med sidens eksisterende `window.msw.worker.use` før søkerbyttet, bare i den første reset-testen. Andre journalposter, Cypress og MSW-defaults beholder opprinnelige data. URL-kontrollen sammenligner pathname og tillater dokumentparameteren `?dok=1`. Dokumenttypebyttene verifiserer GET, søkerheader, 200 og synlig saksliste; Ja etter retur til PSB kontrollerer synlig resultat uten å kreve et ekstra lookup når søkeridenten er uendret.

Begge nye reisene avbryter modalene og kontrollerer at mottak, Vent, kopiering, behandlingsår, Gosys og lukking ikke kalles, også GET-basert lukking.

### Rettet reset-regresjon (B27)

Feilen med foreldet `barnetHarIkkeFnr` er rettet i #3973 og integrert fra master. Checkbox, identfelt, informasjon og Vent-regelen bruker nå samme state, og tillatelsen nullstilles ved relevante kontekstbytter.

Søkerreisen i `930302` passerer normalt uten `test.fail`. Den velger **Pleietrengende har ikke fødselsnummer**, bytter søker og kontrollerer deaktivert Vent etter at ny søker er lastet, før et barn velges. Etter barnevalg og avbrutte Fortsett-/Vent-modaler bytter den tilbake til opprinnelig søker og kontrollerer deaktivert Vent før **Det gjelder et annet barn** klikkes. Dermed kan ikke barnevalg eller checkbox-handlinger maskere en feil i søkerreset. Til slutt verifiseres tomt barnevalg, synlig og ikke valgt checkbox, aktivt identfelt, manglende infotekst og fortsatt deaktivert Vent. Begge reset-reisene beholder kontrollen av at ingen mutasjoner sendes. Øvrig Fordeling-dekning og Cypress-migrering gjenstår.

## Brevtester og historier

Kjør brevtestene og den ene Playwright-reisen fra repository-roten:

```sh
yarn test src/test/components/brev
yarn test:pw e2e/tests/send-brev.spec.ts
yarn test:pw e2e/tests/send-brev.spec.ts --workers=1
yarn test:pw -g "viser inngangen"
yarn test:pw:ui e2e/tests/send-brev.spec.ts --ui-host=127.0.0.1 --ui-port=9323
yarn exec playwright show-report
yarn storybook --host 127.0.0.1
```

Storybook bruker syntetiske testverdier: søker `08438323288`, aktør `81549300`, PSB-sak `1DMU93A`, arbeidsgiver `979312059`, tredjepart `889640782` og malen `GENERELT_FRITEKSTBREV`. Brevhistoriene returnerer samme faste PDF med teksten **Test letter preview**. PDF-en er kun en mock; skjema- og saksverdiene verifiseres separat i request-assertions.

Storybook bruker `msw-storybook-addon` sin CSF 3-loader. Hvis en preview-iframe ennå ikke styres av service worker-en, lastes bare den iframen automatisk på nytt før historien vises. Du trenger ikke laste Storybook-siden på nytt manuelt.

| Gruppe        | Story                           | Link                                                                                                                        |
| ------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Brevkomponent | Tomt skjema                     | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--vanlig-brev)                                  |
| Brevkomponent | Mal med bare fritekst           | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--bare-fritekst)                                |
| Brevkomponent | Mal uten fritekst               | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--uten-fritekst)                                |
| Brevkomponent | Arbeidsgiver som mottaker       | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--arbeidsgiver)                                 |
| Brevkomponent | Tredjepart med navneoppslag     | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--tredjepart)                                   |
| Brevkomponent | Sendefeil med nytt forsøk       | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--sending-feiler-med-nytt-fors%C3%B8k)          |
| Brevkomponent | Sending uten bekreftelsesdialog | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--uten-bekreftelsesdialog)                      |
| Brevkomponent | Brev i annen modal              | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--brev-i-annen-modal)                           |
| Brevkomponent | Malhenting feiler               | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--malhenting-feiler)                            |
| Brevkomponent | Forhåndsvisning av PDF          | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--forhaandsvisning)                             |
| Brevkomponent | Preview-feil med nytt forsøk    | [Åpne historien](http://localhost:6006/?path=/story/components-brevcomponent--forhaandsvisning-feiler-med-nytt-fors%C3%B8k) |
| Avsluttet sak | Tomt skjema                     | [Åpne historien](http://localhost:6006/?path=/story/components-sendbreviavsluttetsak--tomt-skjema)                          |
| Avsluttet sak | Laster fagsaker                 | [Åpne historien](http://localhost:6006/?path=/story/components-sendbreviavsluttetsak--laster-fagsaker)                      |
| Avsluttet sak | Ingen fagsaker                  | [Åpne historien](http://localhost:6006/?path=/story/components-sendbreviavsluttetsak--ingen-fagsaker)                       |
| Avsluttet sak | Oppslagsfeil med nytt forsøk    | [Åpne historien](http://localhost:6006/?path=/story/components-sendbreviavsluttetsak--oppslagsfeil-med-nytt-fors%C3%B8k)    |
| Avsluttet sak | Valgt PSB-sak                   | [Åpne historien](http://localhost:6006/?path=/story/components-sendbreviavsluttetsak--valgt-sak)                            |
| Avsluttet sak | Brev bestilt og LOS-modal       | [Åpne historien](http://localhost:6006/?path=/story/components-sendbreviavsluttetsak--brev-bestilt)                         |
| Særtilstand   | Brev i vent/lukk-modal          | [Åpne historien](http://localhost:6006/?path=/story/components-brevspecialscenarios--brev-i-modal)                          |
| Særtilstand   | Varsel om usendt brev           | [Åpne historien](http://localhost:6006/?path=/story/components-brevspecialscenarios--varsel-om-usendt-brev)                 |
| Særtilstand   | Guard ved uavklart sakstype     | [Åpne historien](http://localhost:6006/?path=/story/components-brevspecialscenarios--uavklart-sakstype)                     |
| Særtilstand   | Brev etter klassifisering       | [Åpne historien](http://localhost:6006/?path=/story/components-brevspecialscenarios--brev-etter-klassifisering)             |

Manuell gjennomgang:

1. **Tomt skjema** er den eneste brevkomponenthistorien som starter uten utfylte felt. De andre positive historiene klargjør skjemaet automatisk: fritekstmalen har mottaker og innhold, malen uten fritekst har mottaker, og arbeidsgiver- og tredjepartshistoriene har mottaker, tittel og innhold. I **Tredjepart med navneoppslag** skal organisasjonsnummer `889640782` gi navnet **Test Navn**. Feltene kan fortsatt redigeres.
2. I **Tomt skjema**, **Arbeidsgiver som mottaker**, **Tredjepart med navneoppslag**, **Sending uten bekreftelsesdialog** og **Brev i modal** kan du teste den gjenværende sendehandlingen. I standardhistoriene kontrollerer du først at bekreftelsesdialogen kan avbrytes uten bestilling, og sender deretter brevet. Historien uten bekreftelsesdialog sender direkte.
3. **Forhåndsvisning av PDF** klargjør et gyldig brev uten å åpne PDF-en. Velg **Forhåndsvis brev** for å åpne mock-PDF-en i et separat `blob:`-vindu. **Preview-feil med nytt forsøk** starter med feilmelding og beholdte verdier; velg nytt forsøk for å få PDF-en. **Sendefeil med nytt forsøk** starter med feilmelding og beholdte verdier; prøv sendingen på nytt for å fullføre.
4. I **Tomt skjema** under **SendBrevIAvsluttetSak**, skriv `08438323288`, velg `1DMU93A`, og fullfør et brev. Kontroller også historiene for lasting, ingen saker og oppslagsfeil/forsøk. LOS er isolert til Storybook; suksess skal ikke navigere bort.
5. I wrapper-historiene kontrollerer du modalåpning/-avbrytelse, varsel etter usendt brev og guard ved uavklart sakstype. **Brev etter klassifisering** viser brevtilbudet med returnert reservert saksnummer. Gå tilbake til standardhistoriene etter feilvariantene for å kontrollere at handlers og skjema ikke lekker mellom historier.

Den automatiske Playwright-reisen dekker kun representativ hovedsideflyt med tredjepart, PDF, 500-feil og vellykket nytt forsøk. De øvrige fullflytene, inkludert sending fra fagsak, uavklart sakstype og vent/lukk/ferdigstilling, ligger fortsatt i Cypress; Vitest dekker lokale brevregler og tilkoblingskontrakter, inkludert LOS-redirect tre sekunder etter sending i avsluttet sak og norsk reservetekst når preview-feil mangler statustekst.

## Journalpost stories and tests

Run the focused checks from the repository root:

```sh
yarn test src/test/components/opprett-journalpost/OpprettJournalpost.spec.tsx
yarn test:pw e2e/tests/opprett-journalpost.spec.ts
yarn test:pw e2e/tests/opprett-journalpost.spec.ts --workers=1
yarn test:pw:ui e2e/tests/opprett-journalpost.spec.ts
yarn lint
yarn lint:css
yarn exec stylelint src/app/opprett-journalpost/opprettJournalpost.css
yarn storybook
```

After a Playwright run, open its HTML report with `yarn exec playwright show-report`. Stop Playwright UI and Storybook with Ctrl+C in the terminals running those commands.

The Playwright journey uses existing applicant `08438323288` and complete case `1DQBDDC` from `cypress/fixtures/fagsaker.json` (PSB, not reserved, child `24420167209`, period `2024-04-15`–`2024-04-15`). A test-only MSW override fails the first creation attempt with 500 and returns only `{ journalpostId: "920001" }` on the retry. Before opening the result, the journey installs an exact-ID GET override with completed status `FERDIGSTILT`, `erFerdigstilt: true`, and populated case data. The generic handler, shared journalpost `200`, and shared fixtures remain unchanged.

These overrides are installed only in the test's browser context. Opening the destination URL separately does not install this scenario; use the test's Playwright UI snapshot to review the completed screen.

The journey starts on the main page, checks the lookup header, and submits the form once to a 500 response. It checks the request body, the error, retained values and the available create button, then retries with the same request body. It reads the created ID from the successful POST response, checks that **Gå til journalpost** replaces the create button, observes the exact GET response, and waits for `/journalpost/920001/pleiepenger-sykt-barn/` (document query parameters and trailing-slash normalization are harmless). The loaded screen must show **Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.**, both handling choices, **Sett på vent**, and the matching journalpost number. It stops before choosing a handling action or registering an application.

To review the journey in browser-accessible Playwright UI:

```sh
yarn test:pw:ui e2e/tests/opprett-journalpost.spec.ts --ui-host=127.0.0.1 --ui-port=9323
```

Open `http://127.0.0.1:9323`, run the test, select **oppretter journalpost fra hovedsiden etter feil og nytt forsøk, og åpner den opprettede journalposten**, and select its final **Expect "toBeVisible"** action and **After** snapshot. Expect the completed screen described above with **Journalpostnummer: 920001**. Reuse an already running UI instead of starting another on the same ports.

Storybook runs at `http://localhost:6006`. Stories can be opened from the sidebar or directly. The CSF 3 loader waits for MSW startup and, if the preview is not yet controlled by the service worker, reloads only the preview iframe once before rendering the story. A manual page reload is not required.

The eight stories use synthetic data: fnr `08438323288`, ordinary cases `ABC123` and `DEF456`, historical case `HIST001`, and in-memory creation result `200`. Storybook navigation only updates a location display; it does **not** render the full application destination verified by Playwright. The API calls are handled by Storybook MSW; no backend is needed. The 14 component tests and the single Playwright journey are independent of the story count.

The component's `msw.handlers` defaults provide named `lookup` and `creation` groups. Each exceptional story overrides only its affected group; Storybook merges these objects by key, whereas handler arrays replace inherited arrays. The addon resets handlers when switching stories. Run `yarn exec msw init` to update both configured worker directories, `src/mocks` and `.storybook/public`, from the installed MSW version.

| Story                                  | Link                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Tomt skjema                            | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--tomt-skjema)                        |
| Henter fagsaker                        | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--henter-fagsaker)                    |
| Fagsaker funnet uten historisk tilgang | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--fagsaker-funnet)                    |
| Historisk fagsak med tilgang           | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--historisk-med-tilgang)              |
| Ingen fagsaker                         | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--ingen-fagsaker)                     |
| Feil ved henting med nytt forsøk       | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--henting-feiler-med-ny-forsøk)       |
| Feil ved oppretting med nytt forsøk    | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--opprettelse-feiler-med-nytt-forsøk) |
| Opprettelse vellykket                  | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--opprettelse-vellykket)              |

Manual click-through:

1. **Tomt skjema** starts without an applicant. Enter `08438323288`, select `ABC123`, enter a title and note (at least three characters each), then choose **Opprett journalpost**. Expect ID `200` and **Gå til journalpost** instead of the create button. Choose it and expect `Gjeldende adresse: /journalpost/200`.
2. **Fagsaker funnet uten historisk tilgang** enters the synthetic fnr and loads cases, with `HIST001` disabled. Wait for the story interaction to finish, select `ABC123`, enter a title and note (at least three characters each), then choose **Opprett journalpost**. Expect ID `200`; choose **Gå til journalpost** and expect the visible location display to show `Gjeldende adresse: /journalpost/200`. **Historisk fagsak med tilgang** uses the same case data and lookup/creation mocks, but permits selecting `HIST001`; complete the same flow with that case. Navigation stays in memory in both variants, and each story gets a fresh store.
3. **Ingen fagsaker** enters the same fnr. Expect the no-cases message and no selectable case.
4. **Feil ved henting med nytt forsøk** starts with a failed lookup. Choose **Hent fagsaker på nytt**, select `ABC123`, enter a title and note, then create successfully and use **Gå til journalpost**. Expect ID `200` and the in-memory location `/journalpost/200`.
5. **Feil ved oppretting med nytt forsøk** submits the prefilled form once. Expect an error with the entered values retained; submit again and expect ID `200`.
6. Fill a case, title and note in either access variant, then switch to the other. In both directions expect no selected case, empty title/note and `/opprett-journalpost` in the location display; ordinary cases remain selectable, while `HIST001` is enabled only in **Historisk fagsak med tilgang**. Switch from each failure story to **Tomt skjema** or **Fagsaker funnet uten historisk tilgang** and complete creation to check that failure handlers do not leak. Return to each failure story and expect its initial failure again. The story IDs/URLs are unchanged; there are still eight stories.
7. In **Henter fagsaker**, expect the disabled Aksel select with the loader immediately to its right, vertically centred on the control rather than its label. Its accessible description is **Henter fagsaker**. The loader slot remains reserved when switching back to a non-loading story, so the control and fields below do not shift.

Playwright and Cypress share port 8080 with local development. Stop the server you started before running either suite if that port is occupied.

## JournalpostLoader

Kjør testene og bygg Storybook fra repository-roten:

```sh
yarn test src/test/containers/JournalpostLoader.spec.tsx
yarn test:pw e2e/tests/journalpost-loader.spec.ts --workers=1
yarn test:pw e2e/tests/journalpost-loader.spec.ts
yarn test:pw:ui e2e/tests/journalpost-loader.spec.ts --ui-host=127.0.0.1 --ui-port=9324
yarn lint
yarn build-storybook
yarn storybook --host 127.0.0.1
yarn exec playwright show-report
```

Playwright starter appen på port 8080 og stopper den etter en CLI-kjøring; Playwright UI holder den oppe mens UI-et kjører. Playwright UI bruker port 9324. Storybook kjører på port 6006. Ikke start en ny server hvis den aktuelle porten allerede brukes.

Stories bruker ekte `JournalpostLoader`, en fersk Redux-store per rendering, router og norske meldinger. Lukkeflytene bruker ekte knapphandlinger i `play`, viser lukkestatusen og klikker deretter på **Gå til LOS**. Storybook erstatter redirect-funksjonen med en Actions-mock, så klikket vises i Actions-panelet uten å navigere bort fra historien. MSW-addon registrerer de komplette, navngitte handlergruppene på nytt ved storybytte; last historien på nytt for å starte med ny store og ferske handlere. Åpne direkte:

| Story                             | Link                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Laster                            | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--laster)           |
| 403 – ingen tilgang               | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--ikke-tilgang)     |
| 404 – ikke funnet                 | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--ikke-funnet)      |
| Ingen dokumenter                  | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--ingen-dokumenter) |
| Generell feil (representativ 500) | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--serverfeil)       |
| Kjent 409 og vellykket lukking    | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--kjent-409)        |
| Lukking – 404                     | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--lukking-404)      |
| Lukking – 400                     | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--lukking-400)      |
| Lukking – 500                     | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-journalpostloader--lukking-500)      |

Testmodus registrerer disse syntetiske scenarioene før første app-render; direkte appvisning er tilgjengelig på `http://127.0.0.1:8080/journalpost/{id}` når `yarn start:e2e` kjører. Alle journalpostkall bruker `GET /api/k9-punsj/journalpost/{id}`; lukking bruker `GET /api/k9-punsj/journalpost/lukkDebugg/{id}` uten body. `930002` holder lasting åpen til siden lastes på nytt eller navigeres bort fra.

| ID       | Scenario                              |
| -------- | ------------------------------------- |
| `930001` | Gyldig journalpost, 200               |
| `930002` | Uavsluttet lasting                    |
| `930003` | Manglende tilgang, 403                |
| `930004` | Ikke funnet, 404                      |
| `930005` | Tom dokumentliste, 200                |
| `930006` | Støttet konflikt, 409                 |
| `930007` | Serverfeil ved lasting, 500           |
| `930008` | Ukjent konflikttype, 409              |
| `930009` | Konflikt uten type, 409               |
| `930101` | Lukking: journalpost ikke funnet, 404 |
| `930102` | Lukking: ferdig behandlet, 400        |
| `930103` | Lukking: generell serverfeil, 500     |
| `930104` | Lukking vellykket, 200                |

Komponentmatrisen ligger i Vitest, inkludert vellykket lasting, lukkesuksess og alle tre generelle feiltilfellene: 500, ukjent 409 og 409 uten type. Storybook viser lasting, feil og interaktive lukkeflyter. Playwright beholder direkte lasting/reload med synlig PDF og fungerende **Skjul** etter omlasting, ukjent 409 gjennom appens Redux-flyt og kjent 409 med GET-lukking og reell kontrollert redirect. Den erstattede Cypress-spesifikasjonen er fjernet etter kontroll av assertion-paritet. Storybook-innhold og alle MSW-svar bruker den eksisterende syntetiske `jpPSB300`-fixturen.

## Home journalpostsøk

Kjør Home-testene og bygg Storybook fra repository-roten:

```sh
yarn test src/test/components/home/Home.spec.tsx
yarn test:pw e2e/tests/home.spec.ts --workers=1
yarn test:pw e2e/tests/home.spec.ts
yarn lint
yarn build-storybook
yarn storybook --host 127.0.0.1
```

Storyene bruker en fersk Redux-store og router per visning, ekte Home-inntasting og navngitte MSW-grupper. Åpne dem direkte:

| Story         | Scenario                                                      | Link                                                                                |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Tomt søk      | Manuell søking; `930001` gir en lokal rutedestinasjon         | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-home--tomt-sok)      |
| Laster        | `930002`, uavsluttet svar                                     | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-home--laster)        |
| Ikke funnet   | `930004`, 404                                                 | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-home--ikke-funnet)   |
| Ingen tilgang | `930003`, 403                                                 | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-home--ingen-tilgang) |
| Generell feil | `930007`, 500                                                 | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-home--generell-feil) |
| Kjent 409     | `930104`, vellykket GET-lukking og trygg LOS Actions-feedback | [Åpne historien](http://127.0.0.1:6006/?path=/story/components-home--kjent-409)     |

Manuell gjennomgang:

1. Åpne **Tomt søk** direkte. Feltet skal være tomt og Søk deaktivert. Skriv `930001` og velg **Søk**; historien viser den merkede lokale destinasjonen `/journalpost/930001`.
2. Åpne de fire feilhistoriene direkte. `play` skriver inn scenario-ID og søker. Kontroller riktig melding og at journalpostfeltet fortsatt kan redigeres. Endre ID til `930001` og søk igjen; du skal komme til den lokale destinasjonen. Bytt deretter til **Tomt søk** og kontroller at feltet er tomt.
3. I **Laster** skal `930002` holde søket i lasting, med deaktivert felt og knapp. Bytt historie eller last preview-iframe på nytt for å starte fra en fersk tilstand.
4. I **Kjent 409** søker `play` opp `930104`, lukker oppgaven med GET og klikker **Gå til LOS**. Handlingen skal vises i Actions-panelet uten å navigere bort. Bruk **Interactions → Rerun** for å gjenta hele flyten; last siden på nytt for en ny gjennomgang.

Playwright bruker den eksisterende `930001`-fixturen. Den venter på den eksakte journalpost-GET-en før Søk klikkes, forventer 200 og kontrollerer navigasjon til `/journalpost/930001` og synlig journalpostnummer. Reisen stopper før handlinger i Fordeling. Den erstattede Forside-Cypress-spesifikasjonen er fjernet etter assertion-paritet.
