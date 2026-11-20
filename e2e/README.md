# Playwright

The Chromium Playwright suite runs the frontend with its existing MSW test handlers. It does not call the backend.

The PR workflow runs the full suite when a pull request is opened or synchronized. To inspect a run, download its `playwright-<run-id>-<attempt>` artifact from the Actions run summary. It contains the HTML report and failure results, including traces and screenshots when available. Run `yarn exec playwright show-report playwright-report` after extracting the artifact to view the report locally.

## Storybook browser tests

Install Chromium, build Storybook, then run its browser tests:

```sh
yarn exec playwright install chromium
yarn build-storybook
yarn test:storybook
```

The isolated Vitest config renders every discovered story in headless Chromium and executes its `play` function, using the Storybook preview annotations and MSW handlers. It does not start the application server or run ordinary unit tests. The command writes `storybook-junit.xml`; the PR job uploads that report for seven days. These are render and interaction checks, not visual snapshot comparisons.

Ordinary Vitest remains a single unsharded PR job with two workers. Sharding is deferred until comparable GitHub Actions timings show that the latency savings justify the duplicated job setup.

After the master update on 2026-11-17, case lookup tests distinguish access denial (403) from other errors. The Fordeling browser tests and the creation/letter component tests also verify that backend reasons are not displayed. The replaced Cypress lookup regressions have been removed after assertion mapping. Home routing assertions allow the PDF document query parameter.

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

## PSB form save and submission

`psb-punch-form.spec.ts` replaces all five mapped checks from `cypress/e2e/pleiepenger/PleiepengerPunsj.cy.js`.

| Cypress block (migration baseline) | Playwright coverage |
| --- | --- |
| Earlier migration, line 8: Submit PSB application | The journey verifies the edited date in the validation request and final receipt, plus the applicant and application IDs in the submit request. |
| Earlier migration, line 18: Save updated received date on blur | The journey verifies the prefilled date, the edited date in the successful save request, and that the field retains the edit. |
| B40, line 6: Freelancer validation | `viser valideringsfeil når frilanserens sluttdato er før startdato` verifies the end date remains and is invalid. |
| B41, line 18: Longer work-time periods | `registrerer arbeidstid for lengre perioder og konverterer tidsformat` verifies both periods and the 10 registered days. |
| B42, line 65: Time-format conversion | The same work-time test verifies decimal conversion, conversion back to hours and minutes, and the saved values on each day in both periods. |

## OMPAO form save and submission

`ompao-punch-form.spec.ts` replaces all three active checks in `nySoknad.cy.js`.

| Cypress block (B43) | Playwright coverage |
| --- | --- |
| Line 16: Successful submission | `sender inn OMPAO-søknaden og viser kvitteringen` verifies the fixture, validation and save payloads, the saved-date receipt, and that `/send` starts only after the final save succeeds. |
| Line 27: Client validation | `viser klientfeil når signatur og startdato mangler` verifies both missing-field errors, no preview or confirmation, and no `/send`; the existing `/valider` call remains. |
| Line 35: Backend validation | `viser backendfeil uten å åpne preview eller sende inn` verifies the validation body and backend error, no preview or confirmation, and no `/send`. |

## OMPUT form save and submission

`omput-punch-form.spec.ts` replaces all eight active checks in `cypress/e2e/omsorgspenger-utbetaling/nySoknad.cy.js` and `korrigering.cy.js`.

| Cypress block | Playwright coverage |
| --- | --- |
| New application: employee success | `sender inn ny søknad for arbeidstaker` checks employer and absence values, common fields, validation/save payloads, confirmation ordering, and the receipt. |
| New application: freelancer success | `sender inn ny søknad for frilanser` checks care-day selection, activity dates, absence values, payloads, confirmation ordering, and the receipt. |
| New application: self-employed success | `sender inn ny søknad for selvstendig næringsdrivende` checks business and accountant details, absence values, payloads, confirmation ordering, and the receipt. |
| New application: client validation | `stanser innsending ved klientvalidering uten forhåndsvisning` checks the error summary and confirms there is no preview, confirmation, or `/send`; `/valider` is still called. |
| New application: backend validation | `viser backendvalideringsfeil uten forhåndsvisning eller innsending` checks the edited validation payload and original backend message without preview, confirmation, or `/send`. |
| Correction: employee success | `sender inn korrigering for arbeidstaker` checks existing periods, correction selection, hidden common fields, filtered payload, confirmation ordering, and the receipt. |
| Correction: freelancer success | `sender inn korrigering for frilanser` also checks that the care-day question is hidden and freelancer details remain editable. |
| Correction: self-employed success | `sender inn korrigering for selvstendig næringsdrivende` also checks hidden care-day, blad B, business-name and accountant fields, and filtered business payload. |

The two startup fixtures use matching route, application, save, validation and submit IDs. The correction fixture returns the existing September periods before the form is used. Each test has its own page and local mutation handlers; the test does not call the backend. The submission response is checked separately from the validation receipt retained by the OMPUT container.

## Replaced Cypress lookup regressions

All nine tests in `cypress/e2e/fagsakLookupErrors.cy.js` have been replaced by the component tests below. These tests render the actual creation and letter entry components; successful application navigation remains covered by `opprett-journalpost.spec.ts` and `send-brev.spec.ts`.

| Removed Cypress assertions | Automatic replacement |
| --- | --- |
| Creation: 403 access message, hidden backend reason and retry button; 500 generic message without access message; successful retry clears the error and lists cases | `OpprettJournalpost.spec.tsx`: parameterized lookup test for 400/403/500 |
| Creation: empty case list shows the existing warning without access message | `OpprettJournalpost.spec.tsx`: `viser varsel når søkeren ikke har fagsaker` |
| Letter: 403 access message, hidden backend reason and retry button; 500 generic message without access message; successful retry clears the error and lists cases | `BrevIntegrations.spec.tsx`: parameterized lookup test for 400/403/500 |
| Letter: empty case list shows the existing warning without access message | `BrevIntegrations.spec.tsx`: lookup/loading and applicant-change test |
| Letter: deleting the last ident digit clears both access message and retry button | `BrevIntegrations.spec.tsx`: `fjerner tilgangsmelding og retry-knapp når fødselsnummeret endres` |

The component fixtures use their own synthetic case IDs instead of the Cypress fixture IDs; each test verifies that a successful lookup makes the returned case available.

## Brev på fagsak og lukking av oppgave

[`send-brev.spec.ts`](tests/send-brev.spec.ts) erstatter de sju aktive blokkene i `cypress/e2e/sendBrevPåFagsak/sendBrevPåFagsak.js`.

| Cypress-blokk (startlinje før sletting) | Playwright-dekning |
| --- | --- |
| 10: Åpne journalpost, bekreft søker, velg sak og journalfør | Steg 1 kontrollerer start-GET, valgt fagsak i klassifisering og oppfrisking med samme sak. Velger deretter sending av brev og kontrollerer `/send-brev-fagsak/`-ruten. |
| 23: Vis brevskjema | Steg 2 kontrollerer mal, mottaker, tredjepartsvalg og sendeknapp. |
| 31: Velg mottaker og mal, fyll ut fritekst | Steg 2 velger arbeidsgiver og fritekstmal og fyller ut tittel og innhold. |
| 38: Send brev | Steg 3 kontrollerer HTTP 200, suksessmeldingen og hele forespørselen for journalpost og valgt fagsak. |
| 72: Stans identisk brev | Steg 4 kontrollerer duplikatmeldingen uten en ny bestillingsforespørsel. |
| 80: Feil ved lukking | Steg 5 kontrollerer HTTP 500 og feilmeldingen. |
| 103: Nytt forsøk på lukking | Steg 6 kontrollerer samme lukkepayload, HTTP 200 med tomt svar og lukket-oppgave-dialogen. Steg 7 bekrefter navigering til en kontrollert lokal LOS-destinasjon. |

Testen bruker nettleserkontekstbaserte MSW-svar for klassifisering, brev og lukking. LOS-trafikken går bare til lokal testdestinasjon. Detaljert skjemavalidering og komponentkobling dekkes av Vitest.

### Brev for journalpost med uavklart ytelse

`send-brev.spec.ts` erstatter de to blokkene i `cypress/e2e/fordeling/SendBrevUavklartSakstype.cy.js` og beholder fixturen `jpUavklartSakstype315.json`.

| Cypress-blokk (startlinje før sletting) | Playwright-dekning |
| --- | --- |
| 19: Åpne brev-ruten direkte uten avklart ytelse | `hindrer brev for uavklart ytelse til PSB er valgt på journalposten` kontrollerer journalpostsvaret fra MSW, sperren og retur til oversikten. |
| 6: Velg ytelse og åpne brevskjema | Samme reise kontrollerer varselet og deaktivert knapp, velger PSB og verifiserer malforespørselen med `sakstype=PSB` og `avsenderApplikasjon=K9PUNSJ`. |

### Brev for inntektsmelding uten krav

`send-brev.spec.ts` erstatter de fem blokkene i `cypress/e2e/inntektsmeldingUtenKrav/inntektsmeldingUtenKrav.cy.js`.

| Cypress-blokk (startlinje før sletting) | Playwright-dekning |
| --- | --- |
| 4: Åpne journalpost 202 og kontroller tilgjengelige handlinger | Steg 1 verifiserer journalpostsvaret, bekrefter søker og kontrollerer de tre valgene. |
| 13: Åpne brevskjema og velg mal | Steg 2 kontrollerer feltene for `INNHEN` og `GENERELT_FRITEKSTBREV`, velger søker som mottaker og fyller ut brevet. |
| 29: Avbryt sending | Steg 3 avbryter bekreftelsen og kontrollerer at ingen bestilling ble sendt. |
| 85: Avbryt Sett på vent | Steg 4 kontrollerer advarselen om usendt brev, avbryter og verifiserer at utkastet er beholdt uten Vent-bestilling. |
| 55: Send brev uten fagsak | Steg 5 kontrollerer én HTTP 200-bestilling med `GENERELL_SAK`, journalpost 202, OMP, søker som `AKTØRID`, valgt mal og ferdig tittel og innhold. |

Validering før sletting og på endelig diff: `yarn test:pw e2e/tests/send-brev.spec.ts` bestod med fire tester. `yarn lint` og `git diff --check` bestod.

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
| Reserved/new single-applicant PSB cases                                                                                                                      | See the bounded new/reserved mapping below; not replaced by this pilot alone                               |
| Document-type option list                                                                                                                                      | The same selection journey checks the radio group under “Dette gjelder:”                                   |

### PSB classification Cypress migration

The seven blocks in `cypress/e2e/klassifisering/PSB.cy.js` are replaced as follows:

| Cypress block | Automatic replacement | Remaining gap |
| --- | --- | --- |
| 1: `PSB Åpne journalpost 300 fra LOS` | `fordeling-psb.spec.ts` opens the PSB route directly; `journalpost-loader.spec.ts` checks **Skjul** hides the PDF. | No LOS-origin flow; Cypress also opened the URL directly. |
| 2: Classification error and cancellation | `KlassifiserModal.spec.tsx` — `avbryter etter klassifiseringsfeil uten å starte nye handlinger`; the existing `Journalfør-feil med vellykket nytt forsøk` Storybook story checks the generic error. | None for the block's assertions. |
| 3: Copy error with two applicants | `KlassifiserModal.spec.tsx` checks copy retry/explicit **Videre**, hidden **Avbryt**, and the generic 500 refresh error after copy. `To søkere: kopieringsfeil og nytt forsøk` checks the generic copy error (409 mock) and successful copy identities (201). | None for the block's assertions. |
| 4: Copy error with two applicants, then Vent | `fordeling-psb.spec.ts` — `journalfører PSB før Vent, prøver Vent på nytt og navigerer til lokal LOS`; the existing `Vent-feil med vellykket retry` story remains the component retry check. | The original block reloads and does not select two applicants; actual Vent with two applicants remains uncovered. LOS is a local destination, not a real service. |
| 5: `PSB Åpne journalpost 300 fra LOS` (duplicate) | Same direct-open Playwright check and **Skjul** loader check as block 1. | No additional gap. |
| 6: `PSB journalfør journalposten` | `fordeling-psb.spec.ts` — `journalfører valgt PSB-sak og går til riktig registreringsvalg` checks the classification contract and refresh. | None for the block's assertions. |
| 7: `PSB journalposten journalført` | The same Playwright journey checks panel values, success notice, both registration choices, and disabled **Bekreft** before selection. After **Bekreft**, it verifies an empty application lookup, exactly one automatic draft creation with the selected journalpost, applicant, child, and case number, and `PSBPunchForm` opening for the ID returned with 201. | Journalføring is the only mutation before **Bekreft**; draft creation is the only additional mutation. The test stops at form opening. |

The selection journey also replaces the four initial Cypress checks for the journalpost panel, selected document type, two-applicant checkbox and disabled journalfør buttons. See [the final 13 blocks](#de-siste-13-blokkene-i-fordeling-psb) for the opening, PDF and selection checks.

The table below maps the three modal blocks for existing cases. Line numbers refer to the Cypress file before those blocks were removed.

| Removed Cypress block | Assertions | Automatic replacement |
| --- | --- | --- |
| 91–121: existing case without a child, Vent | Vent heading; Sakstype, Søkers ID, Saksnummer and Periode labels with values; no Pleietrengendes ID; warning in the alert block; no Gå til LOS; confirm and cancel enabled; “Journalfør og sett på vent”; modal closes after cancel | `fordeling-psb.spec.ts` selection journey, step 1, via `expectModalCase` (now also checks the Søkers ID/Saksnummer labels, the alert block and enabled confirm/cancel). `KlassifiserModal.spec.tsx` — “Vent med eksisterende sak uten barn” also verifies the labels, enabled confirm, `lukkModal` and no mutations |
| 148–178: existing case with a child, Fortsett | Fortsett heading; the same summary plus Pleietrengendes ID label and child ID; warning; no Gå til LOS; confirm and cancel enabled; “Journalfør journalposten”; modal closes after cancel | Same journey, step 2 (now also checks the Pleietrengendes ID label). `KlassifiserModal.spec.tsx` — “Fortsett med eksisterende sak og barn” |
| 180–210: existing case with a child, Vent | Vent heading; same summary with child; warning; no Gå til LOS; confirm and cancel enabled; “Journalfør og sett på vent”; modal closes after cancel | Same journey, step 2, followed by a check that the selected case is retained. `KlassifiserModal.spec.tsx` — “Vent med eksisterende sak og barn” |

Five manual modal stories are available at [Fortsett med eksisterende sak og barn](http://localhost:6006/?path=/story/components-klassifisermodal--fortsett-med-eksisterende-sak-og-barn), [Vent med eksisterende sak og barn](http://localhost:6006/?path=/story/components-klassifisermodal--vent-med-eksisterende-sak-og-barn), [Vent uten barn](http://localhost:6006/?path=/story/components-klassifisermodal--vent-uten-barn), [Journalfør-feil med vellykket nytt forsøk](http://localhost:6006/?path=/story/components-klassifisermodal--journalfor-feil-med-vellykket-nytt-forsok), and [Vent-feil med vellykket retry](http://localhost:6006/?path=/story/components-klassifisermodal--vent-feil-med-vellykket-retry). They use isolated stores, routers, query clients and named MSW groups; the LOS action is local Storybook feedback.

For browser review, start Storybook with `yarn storybook --host 127.0.0.1` and the [Playwright UI](http://127.0.0.1:9324/) with `yarn test:pw:ui e2e/tests/fordeling-psb.spec.ts --ui-host=127.0.0.1 --ui-port=9324`. For direct app links, start `yarn start:e2e` on port 8080 only when Playwright is not running tests; the two processes cannot share that port. Open [journalpost 930300](http://127.0.0.1:8080/journalpost/930300) to switch from the case without a child to the case with a child and cancel each modal. Open [journalpost 930301](http://127.0.0.1:8080/journalpost/930301), choose the existing case with a child, confirm journalføring, then choose **Registrere opplysninger til K9** and click **Bekreft**. The empty lookup opens a new draft without editing, validating, or submitting it. Stop manually started servers with Ctrl+C in their terminals.

### PLS classification Cypress migration

The seven blocks in `cypress/e2e/klassifisering/PILS.cy.js` are replaced as follows:

| Cypress block | Replacement coverage | Remaining gap |
| --- | --- | --- |
| 21: Direct opening and **Skjul** | Both journeys in `fordeling-pls-classification.spec.ts` verify the direct PLS GET; `journalpost-loader.spec.ts` checks **Skjul** hides the PDF. | None for the block's assertions. |
| 26: Classification 500 and cancel | `KlassifiserModal.spec.tsx` — `avbryter etter klassifiseringsfeil uten å starte nye handlinger`; Storybook `JournalforFeilMedVellykketNyttForsok` checks the generic error. | No separate PLS error handling exists. |
| 56: Copy error and retry with two applicants | `KlassifiserModal.spec.tsx` covers retry, hidden **Avbryt**, explicit **Videre** and refresh failure; `ToSokereKopierFeilMedVellykketNyttForsok` covers the generic copy error and successful identities. | No PLS-specific copy behavior; successful copy returns 201. |
| 112: Vent failure and retry | `fordeling-pls-classification.spec.ts` checks the PPN mottak body, Vent 500 then empty 200 response, retry and local LOS navigation. | The original block reloads without reselecting two applicants; actual Vent with two applicants remains uncovered. |
| 174: Duplicate direct opening and **Skjul** | Same direct GET and loader coverage as block 21. | No additional gap. |
| 179: Successful classification | The Fortsett journey checks the PPN request, selected case, care recipient, period and refreshed journalpost. | None for the block's assertions. |
| 191: Journalført panel and form opening | The Fortsett journey checks panel labels and values, the journalført alert, choices, disabled **Bekreft**, the empty lookup, one draft POST and the PLS form route. | Stops at form opening; form editing and submission are outside scope. |

The journeys use journalpost 301 and the existing fixtures. Local MSW handlers are isolated to each browser context and match the journalpost ID. The classification and draft contracts are checked against the selected PPN case; no form edits, validation or submission are performed.

### PLS case selection Cypress migration

The seven mapped selection blocks in `cypress/e2e/fordeling/PILS.cy.js` are replaced as follows. Line numbers refer to the file before removal.

| Cypress block | Playwright coverage |
| --- | --- |
| 67: Existing case without a care recipient | `fordeling-pls-case-selection.spec.ts` selects the case and checks the selected-case information, journalpost summary, K9 link and Vent/Fortsett states. |
| 122: Existing case with a care recipient | The same journey checks the care recipient's name and ID, journalpost summary, K9 link and both enabled actions. |
| 210: Reserved case with a care recipient | The same journey checks the care recipient's name and ID, journalpost summary, absence of the K9 link and both enabled actions. |
| 297: Reserved case without a care recipient | The same journey checks `ikke satt`, the journalpost summary, absence of the K9 link and only Vent enabled. |
| 349: Switch to a new case | `fordeling-pls-case-selection.spec.ts` switches from a reserved case, clears its number and disables both actions. |
| 361: Enter a manual care-recipient ID | The same new-case journey checks the journalpost summary, reservation notice and both enabled actions. |
| 444: No care-recipient ID | The same journey checks that the ID clears, the explanatory notice appears and only Vent remains enabled. |

The case-selection journeys stop before opening the classification modal.

### PLS opening and empty-lookup Cypress migration

The final ten opening and empty-lookup blocks in `cypress/e2e/fordeling/PILS.cy.js` are replaced as follows. Line numbers refer to the file before removal.

| Cypress block | Playwright replacement |
| --- | --- |
| 13: Direct opening | `fordeling-pls-case-selection.spec.ts` opens journalpost 301 directly as the first step of the PLS start-state and empty-lookup journey. |
| 17: **Skjul** | `journalpost-loader.spec.ts` verifies that **Skjul** hides the PDF while keeping the journalpost visible. |
| 32: Document choices | `fordeling-gosys-annet.spec.ts` checks the shared document radio group, including PLS. |
| 21, 40, 45, 49: PLS initial state | `fordeling-pls-case-selection.spec.ts` checks journalpost 301, the fixture applicant and PLS benefit in the panel, selected PLS radio, two-applicant checkbox, and disabled **Fortsett** and **Vent**. |
| 57: Empty case lookup | The same journey installs a browser-context MSW override for the fixture applicant, verifies the service-worker response is 200 with `[]`, and checks that **Velg fagsak** is absent. |
| 72, 86: Manual care-recipient ID and no ID | The same journey checks the manually entered ID, reservation notice and enabled actions, then verifies that selecting **Pleietrengende har ikke fødselsnummer** clears the ID and leaves only **Vent** enabled. |

The journey uses the existing journalpost 301 fixture, manual care-recipient ID and case-selection locators. It stops at the button state; the separate stale case-select fix, actual two-applicant Vent and form submission remain outside scope.

### PLS classification modal Cypress migration

The nine single-applicant modal blocks in `cypress/e2e/fordeling/PILS.cy.js` are replaced as follows. Line numbers refer to the file before removal.

| Cypress block | Playwright replacement |
| --- | --- |
| 75: Existing case without a care recipient, Vent | `fordeling-pls-classification.spec.ts` — `viser og avbryter modal for eksisterende sak uten pleietrengende, Vent` |
| 108: Existing case with a care recipient, Fortsett | The same spec — `viser og avbryter modal for eksisterende sak med pleietrengende, Fortsett` |
| 141: Existing case with a care recipient, Vent | The same spec — `viser og avbryter modal for eksisterende sak med pleietrengende, Vent` |
| 174: Reserved case with a care recipient, Fortsett | The same spec — `viser og avbryter modal for reservert sak med pleietrengende, Fortsett` |
| 207: Reserved case with a care recipient, Vent | The same spec — `viser og avbryter modal for reservert sak med pleietrengende, Vent` |
| 240: Reserved case without a care recipient, Vent | The same spec — `viser og avbryter modal for reservert sak uten pleietrengende, Vent` |
| 272: New case with a manually entered care-recipient ID, Fortsett | The same spec — `viser og avbryter modal for ny sak med manuelt registrert pleietrengende, Fortsett` |
| 308: New case with a manually entered care-recipient ID, Vent | The same spec — `viser og avbryter modal for ny sak med manuelt registrert pleietrengende, Vent` |
| 339: New case without a care-recipient ID, Vent | The same spec — `viser og avbryter modal for ny sak uten fødselsnummer for pleietrengende, Vent` |

Each journey checks the PLS benefit and applicant, and verifies whether the case number, period and care-recipient ID should appear. It uses **Avbryt**, checks that the modal closes, and asserts that no mutation or debug-close request was sent. The existing PLS Fortsett journey continues to verify the summary and successful classification for an existing case with a care recipient; `KlassifiserModal.spec.tsx` covers shared headings, actions and cancellation.

Applicant-switch coverage is mapped below. Two-applicant preparation and cancellation coverage is mapped in [PLS two-applicant Cypress migration](#pls-two-applicant-cypress-migration). The final opening and empty-lookup blocks are mapped in [PLS opening and empty-lookup Cypress migration](#pls-opening-and-empty-lookup-cypress-migration).

### PLS applicant-switch Cypress migration

The five mapped applicant-switch and reset blocks in `cypress/e2e/fordeling/PILS.cy.js` are replaced as follows. Line numbers refer to the file before removal.

| Cypress block | Playwright replacement |
| --- | --- |
| 64: Reset the original applicant after new-case/no-ID selection | `fordeling-pls-classification.spec.ts` — `bytter til alternativ søker for PLS og nullstiller panelet ved retur`; checks the notice before **Nei**, then verifies the case, reservation and care-recipient controls are gone and both actions are disabled. |
| 79: Select a PLS case for the alternate applicant | The same journey waits for the lookup by alternate applicant ID, exits new-case mode, selects `fagsaker[5]` and verifies applicant, case, care-recipient ID and enabled actions in the journalpost panel. |
| 101: Open and cancel **Fortsett** for the alternate applicant | The same journey checks the PLS benefit, alternate applicant, case, period and care-recipient ID in the dialog, cancels and verifies no mutation. |
| 133: Open and cancel **Vent** for the alternate applicant | The same journey checks the same summary in the Vent dialog, cancels and verifies no mutation. |
| 165: Return to the original applicant | The same journey waits for the original applicant's case lookup and verifies the panel no longer contains the alternate applicant, case or care recipient; both actions are disabled. |

**Known issue.** After returning to the original applicant, **Velg fagsak** can still display the previous case even though the journalpost panel clears the case and care-recipient details and both actions are disabled. The journey covers the panel and action reset. Clearing the select is a separate fix.

The Playwright journey starts from a fresh page. Its ten remaining opening and empty-lookup Cypress blocks are mapped in [PLS opening and empty-lookup Cypress migration](#pls-opening-and-empty-lookup-cypress-migration). The two-applicant preparation and cancellation blocks are mapped below.

### PLS two-applicant Cypress migration

The three blocks in `cypress/e2e/fordeling/PILS.cy.js` are replaced as follows. Line numbers refer to the file before removal.

| Cypress block | Playwright replacement |
| --- | --- |
| 60: Prepare two applicants and enter a manual care-recipient ID | `fordeling-pls-classification.spec.ts` — `avbryter Fortsett og Vent for PLS med to søkere og ny sak`; checks the initial empty selection, lookup for both applicants, guidance and missing-information notices, new-case reservation and journalpost summary. |
| 103: Open and cancel **Fortsett** | The same journey checks the PLS benefit, original applicant and care-recipient ID, absence of case number, period and **Gå til LOS**, and the non-editable-information warning. Cancel closes the dialog and preserves the selection without a mutation or debug-close request. |
| 134: Open and cancel **Vent** | The same journey checks the Vent heading and confirmation, then verifies cancellation preserves the selection without a mutation or debug-close request. |

The final opening and empty-lookup Cypress blocks are mapped in [PLS opening and empty-lookup Cypress migration](#pls-opening-and-empty-lookup-cypress-migration). Actual two-applicant classification, copying and Vent execution are outside this migration.

### De siste 13 blokkene i Fordeling PSB

Playwright erstatter alle de siste 13 blokkene i `cypress/e2e/fordeling/PSB.cy.js`. Bare denne Cypress-filen er fjernet. Kartleggingen gjelder ikke øvrige PSB- eller Fordeling-scenarier.

| Cypress-blokk (startlinje før sletting) | Playwright-dekning |
| --- | --- |
| 17: Åpne journalpost fra LOS | [`fordeling-psb.spec.ts`](tests/fordeling-psb.spec.ts): åpner PSB-journalposten direkte på `/journalpost/:id` og sjekker respons og panel. Cypress åpnet også URL-en direkte, uten å starte i LOS. |
| 21: Skjul dokumentvindu | [`journalpost-loader.spec.ts`](tests/journalpost-loader.spec.ts): viser PDF, klikker Skjul og sjekker at PDF-en er borte mens panelet fortsatt vises. Gjentar etter omlasting. |
| 25: Dokumentvalg | Saksvalgreisen i `fordeling-psb.spec.ts`: sjekker de fire dokumentvalgene i radiogruppen under «Dette gjelder:». |
| 33: Bekreft søker og velg ordinær sak uten barn | Samme reise: bekrefter søker og sjekker valgt verdi, saksnummer, «Barn: ikke satt», fravær av Barnets ID, K9-lenke og bare aktiv Vent. |
| 56: Velg ordinær sak med barn | Samme reise: sjekker valgt verdi, saksnummer, barnets navn og ID, K9-lenke og begge handlingene aktive. |
| 81: Velg reservert sak med barn | [`fordeling-psb-new-and-reserved.spec.ts`](tests/fordeling-psb-new-and-reserved.spec.ts), reisen «velger reserverte saker og journalfører valgt nummer med barn til PSB»: sjekker valgt verdi, saksnummer, navn og ID, ingen K9-lenke og begge handlingene aktive. |
| 104: Velg reservert sak uten barn | Samme reise: sjekker valgt verdi, saksnummer, «Barn: ikke satt», fravær av Barnets ID og K9-lenke, og bare aktiv Vent. |
| 125: Reserver saksnummer til ny fagsak | Samme reise, steget «Bytt fra reservert sak uten barn til ny sak»: sjekker at tidligere sak og Saksnummer-feltet forsvinner, og at begge handlingene deaktiveres. Flaggtestene dekker også ordinær sak med barn → ny sak. |
| 137: Velg barn med sak, flagg `true` | `fordeling-psb-new-and-reserved.spec.ts`, flaggtesten for `true`: sjekker listeverdi, Barnets ID, varsel med saks- og barne-ID og begge handlingene aktive. |
| 162: Velg barn med sak, flagg `false` | Flaggtesten for `false`: bytter fra barn uten treff til barn med treff og tilbake. Sjekker listeverdi, Barnets ID, varsel med saks- og barne-ID og begge handlingene deaktivert ved treff. |
| 191: Velg barn uten treff fra liste | Samme `false`-reise: sjekker listeverdi, Barnets ID, informasjon om journalføring uten fagsak, fravær av treffvarsel og begge handlingene aktive. |
| 206: Det gjelder et annet barn | Samme reise: fjerner forrige barn og deaktiverer begge handlingene, fyller ut gyldig manuell ident og sjekker panel, informasjon og begge handlingene aktive. |
| 230: Pleietrengende har ikke fødselsnummer | Samme reise: fjerner Barnets ID og manuell ident, viser informasjon og holder bare Vent aktiv. Reisen avbryter modalene og sjekker at ingen mutasjoner sendes. |

## Gosys-oppgave for Annet

[`fordeling-gosys-annet.spec.ts`](tests/fordeling-gosys-annet.spec.ts) erstatter alle seks blokkene i `cypress/e2e/fordeling/Annet.cy.js`:

| Cypress-blokk | Playwright-dekning |
| --- | --- |
| Åpne journalpost og velg Annet | Åpner journalpost 305, sjekker GET fra service worker og skjuler PDF-en før Annet velges. |
| Journalpostpanel | Sjekker journalpostnummer, søker og sakstype med etiketter og verdier. |
| To søkere | Sjekker at checkboxen mangler for Annet. |
| Dokumentvalg | Sjekker «Dette gjelder» og de fire opprinnelige alternativene. |
| Gosys-feil | Sjekker kategorioppslag, deaktivert knapp, POST-innhold, HTTP 500, feilmelding og beholdte verdier for nytt forsøk. |
| Gosys-suksess | Sjekker samme POST med HTTP 200 og tomt svar, rekkefølge og dialog, og returnerer til lokal LOS først etter OK. |

Gosys-svarene er lokale MSW-svar; LOS-destinasjonen er den lokale startsiden, ikke en faktisk LOS-tjeneste. Reisen kontrollerer også at ingen andre mutasjoner eller debugglukking sendes.

## Inngang til Fordeling

[`fordeling-entry.spec.ts`](tests/fordeling-entry.spec.ts) erstatter de sju aktive blokkene i `cypress/e2e/fordeling/Fordeling.cy.js`. De fire dokumentvalgene på toppnivå gjenbruker dekningen i [`fordeling-gosys-annet.spec.ts`](tests/fordeling-gosys-annet.spec.ts).

| Cypress-blokk (startlinje før sletting) | Playwright-dekning |
| --- | --- |
| 9: Dokumentvalg på toppnivå | `fordeling-gosys-annet.spec.ts`: sjekker de fire alternativene under «Dette gjelder». |
| 31: Underalternativer for Omsorgspenger | `fordeling-entry.spec.ts`: sjekker at de tre underalternativene først mangler, deretter vises, og at korrigering er valgt. |
| 65: Midlertidig alene om omsorgen | Samme spec velger undertype og Ja, kontrollerer søkeroppslaget og blir på `/journalpost/200`. |
| 76: Alene om omsorgen | Samme spec velger undertype og Ja, kontrollerer søkeroppslaget og blir på `/journalpost/200`. |
| 87: Direkte utbetaling uten fagsaker | Samme spec bruker et lokalt, ident-avgrenset tomt saksoppslag. Den kontrollerer Ja, tomt svar, fravær av «Velg fagsak» og synlig behandlingsår når reservert ny sak er aktiv. Den gamle blokkens tittel sier at behandlingsår vises, men eneste aktive Cypress-assertion var at «Velg fagsak» manglet; kontrollen av behandlingsår var kommentert ut. |
| 105: Direkte utbetaling | Samme spec velger undertype og blir på `/journalpost/200`; den aktive Cypress-blokken bekreftet ikke Ja eller navigerte videre. |
| 139: Gyldig søkeridentitet | Samme spec velger PSB og Nei, validerer den syntetiske identiteten, sjekker at feltverdien beholdes og at ugyldig-ident-meldingen mangler. |

De tre blokkene om eksisterende søknader utførte bare forberedelse av valg og bekreftelse; videre navigering og søknadsskjema var kommentert ut. Playwright-testene bevarer denne grensen og utfører ikke journalføring eller videreføring.

## Fordeling fosterbarn

[`fordeling-entry.spec.ts`](tests/fordeling-entry.spec.ts) erstatter de sju blokkene i `cypress/e2e/fordeling/TestFosterbarn.cy.js`. Bare denne Cypress-filen er fjernet; de delte fixturene er beholdt.

| Cypress-blokk (startlinje før sletting) | Playwright-dekning |
| --- | --- |
| 23: Fosterbarn, én søker, vellykket oppfrisking | Én-søker-scenarioet viser fosterbarn-ID i modalen og når direkteutbetalingsregistreringen etter journalføring. |
| 42: Fosterbarn, én søker, oppfrisking med 403 | Kontrollerer journalført status, tilgangsavslag, aktiv **Gå til LOS** og fravær av registrering. |
| 77: Fosterbarn, to søkere, vellykket oppfrisking | Kontrollerer fosterbarn-ID, klassifiseringsforespørselen, kopi til søker nummer to og **Videre** til registrering. |
| 123: Fosterbarn, to søkere, oppfrisking med 403 | Beholder journalførings- og kopibekreftelsen og viser tilgangsavslag med aktiv **Gå til LOS**. |
| 172: Uten fosterbarn, to søkere | Kontrollerer tilgjengelig fosterbarn-kontroll, fravær av fosterbarn-raden i modalen, kopi og **Videre** til registrering. |
| 218: Uten fosterbarn, én søker | Kontrollerer tilgjengelig fosterbarn-kontroll, fravær av fosterbarn-raden i modalen og direkteutbetalingsregistrering. |
| 252: Fosterbarn-kontroll for OMPMA og KorrigeringIM | De eksisterende inngangstestene bekrefter søker og ny sak, og kontrollerer at fosterbarn-kontrollen vises. |

Scenarioene bruker separate Playwright-kontekster og et behandlingsår valgt fra aktive UI-valg. Testene kontrollerer at behandlingsåret lagres før klassifisering, at `JOURNALPOST_MOTTAK` sender `OMP` og fosterbarn-ID-ene (eller utelater feltet uten fosterbarn), og at oppfriskingen returnerer en journalpost med sakstype `OMP`. Kopieringsforespørselen bruker `OMP_UT`; HTTP 201-svaret returnerer `OMP`. Fortsett går fortsatt til registrering av direkte utbetaling.

## Allerede behandlet journalpost

`fordeling-already-processed.spec.ts` erstatter alle 12 blokkene i `cypress/e2e/fordeling/JpAlleredeBehandlet.cy.js`. Oppstartsblokkene er samlet i én test; de sju dokumentvariantene kjører i separate Playwright-kontekster. Alle testene verifiserer at Kopier ikke sendes og at ruten forblir på journalposten.

| Cypress-blokk | Playwright-dekning |
| --- | --- |
| Åpne journalpost 310 | Oppstartstesten åpner `/journalpost/310` og kontrollerer GET-status 201 og svar fra service worker. |
| Skjul dokumentvindu | Oppstartstesten viser PDF-en, klikker **Skjul** og sjekker at PDF-en skjules. |
| Journalpostpanel | Oppstartstesten sjekker journalpostnummer, søkeretikett og -identitet, og at Sakstype mangler. |
| Kopieringsinformasjon | Oppstartstesten sjekker varselet for en allerede behandlet journalpost. |
| Dokumentvalg | Oppstartstesten sjekker Pleiepenger, Omsorgspenger og Pleiepenger i livets sluttfase, alle fem underalternativene, fravær av **Annet** og deaktivert Kopier før et konkret valg. |
| Pleiepenger | Den parameteriserte reisen sjekker barn nummer tre, manuell ident med overgang tilbake til barnelisten og kopiering til annen søker. |
| Ekstra omsorgsdager ved kronisk sykdom eller funksjonshemming | Samme barneliste-, manuell ident- og annen søker-reise for dette underalternativet. |
| Ekstra omsorgsdager når søker er alene om omsorgen | Samme barneliste-, manuell ident- og annen søker-reise for dette underalternativet. |
| Ekstra omsorgsdager når søker er midlertidig alene om omsorgen | Sjekker deaktivert Kopier, annen part, informasjonen for to søkere, annen søker og at annen part beholdes. |
| Direkte utbetaling av omsorgspenger | Sjekker deaktivert Kopier, et tilgjengelig behandlingsår, annen søker og at året beholdes. |
| Korrigering av inntektsmelding omsorgspenger AG | Sjekker deaktivert Kopier, et tilgjengelig behandlingsår, annen søker og at året beholdes. |
| Pleiepenger i livets sluttfase | Sjekker manuell pleietrengende, annen søker og korrigering av partsforhold når søker også er pleietrengende. |

## Fordeling nullstilling

Kjør reset-testene alene og sammen med PSB-piloten:

```sh
yarn test:pw e2e/tests/fordeling-reset.spec.ts --workers=1
yarn test:pw e2e/tests/fordeling-reset.spec.ts e2e/tests/fordeling-psb.spec.ts
```

Validering 2026-11-06 etter integrering av #3973: kombinert kjøring av reset- og PSB-testene med standard workers (2) ga fire bestått, uten forventede feil eller skips. Kjøringen brukte eksisterende MSW-testserver med bekreftet oppdatert kode og midlertidig konfigurasjon utenfor repoet. `yarn lint` og `git diff --check` bestod. Dette avslutter regresjonsoppfølgingen for B27, ikke hele Fordeling-migreringen.

| Eksisterende `cypress/e2e/fordeling/PSB.cy.js`-assertion                                                                                 | Automatisk dekning                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 354–364: Ny-sak-modus fjerner gammel sak fra panelet og deaktiverer handlingene | Søkerreisen, steget «Bytt til ny fagsak og fjern tidligere valg», kontrollerer også tom/deaktivert select og fjernet saksinformasjon |
| Fjernet: `Test at state fjernet etter avbekreft søker` | [`fordeling-reset.spec.ts`](tests/fordeling-reset.spec.ts), reisen `nullstiller søker og barn når søkeridenten endres`, steget «Bytt til ny fagsak og fjern tidligere valg»: aktivt valg uten fødselsnummer før Nei; deretter ingen saksvalg, reservasjon, identfelt, checkbox eller informasjon, og begge handlinger deaktivert |
| Fjernet: `Test ny søker og barn` | Samme reise, steget «Velg ny søker og barn, og avbryt begge modalene»: paneletikettene Søkers ID og Barnets ID med riktige verdier, valgt barn fra listen, handling uten fagsak og aktive knapper. Saksoppslagets service-worker-svar, header og avgrensede datasett kontrolleres; Vent er deaktivert før barnevalg |
| Fjernet: `Åpne klassifiser modal fortsett med ny søker, reserver fagsak og barn fra liste` | Samme steg via `expectApplicantModal`: Fortsett-overskrift og handlingstekst; etiketter og verdier for sakstype, søker og barn; ingen Saksnummer, Periode eller Gå til LOS; advarsel og aktive bekreft-/avbrytknapper. Avbryt fjerner modalen og beholder søker/barn |
| Fjernet: `Åpne klassifiser modal sett på vent med ny søker, reserver fagsak og barn fra liste` | Samme steg og hjelper: tilsvarende sammendrag og kontroller, med Vent-overskrift og «Journalfør og sett på vent». Avbryt fjerner modalen og beholder søker/barn; ingen journalføring eller Vent utføres |
| Fjernet: `Test bekreft søker på nytt og pleietrengende fjernet fra state` | Samme reise, steget «Bekreft opprinnelig søker på nytt»: Søkers ID og opprinnelig søker vises; ny søker, Barnets ID og tidligere barn er borte. Begge handlinger er deaktivert før nytt barnevalg; no-ID-checkbox, identfelt og informasjon er nullstilt |
| PLS mellom PSB-valg, deretter nytt PSB-valg uten gammel sak/barn                                                                           | `fordeling-reset.spec.ts` — `nullstiller sak og barn ved bytte av dokumenttype`; tilleggsdekning utover gammel Cypress                         |

De fem siste Cypress-blokkene for søkerbytte ble fjernet 2026-11-18 etter bekreftet Playwright-dekning. Se [De siste 13 blokkene i Fordeling PSB](#de-siste-13-blokkene-i-fordeling-psb) for Playwright-dekningen av den tidligere valgkjeden. Reisen avviser mutasjoner og GET-debugglukking; varianten med tomt saksoppslag er fortsatt en egen reset-test.

### Erstattede kontroller fra `NullstillingPleietrengende.cy.js`

| Cypress-test | Dekning i [`fordeling-reset.spec.ts`](tests/fordeling-reset.spec.ts) |
| --- | --- |
| Nullstiller tillatelsen ved søkerbytte før annet barn velges | Velger PSB-sak med barn, går til ny sak, velger annet barn og krysser av for manglende fødselsnummer. Fortsett er deaktivert, Vent følger av/på, og Vent-modalen åpnes og avbrytes. Nei og ny søker gir tomt saksoppslag og en barneliste for riktig ident, med Vent deaktivert. Ja gjenoppretter opprinnelig søker. Før barnevalg er den nye søkeren og barn borte fra panelet, og begge handlingene er deaktivert. «Det gjelder et annet barn» viser uvalgt avkrysningsboks, aktivt identfelt og ingen infotekst; Vent forblir deaktivert. |
| Nullstiller tillatelsen ved dokumenttypebytte | PSB med tom saks- og barneliste: avkrysset manglende fødselsnummer gir deaktivert identfelt, synlig informasjon og aktiv Vent. Etter PSB → Omsorgspenger → PSB er boksen uvalgt, identfeltet aktivt, informasjonen borte og Vent deaktivert. |
| Nullstiller tillatelsen ved bytte mellom ny og eksisterende sak | Velger sak med barn, går til ny sak og aktiverer manglende fødselsnummer. Etter ny → eksisterende → ny er Vent deaktivert før «Det gjelder et annet barn» klikkes. Deretter er boksen uvalgt, identfeltet aktivt og informasjonen borte. |

Testene bruker `930302` og `930303`. Oppslag med avvikende data settes med `window.msw.worker.use` i den enkelte nettleserkonteksten, og testene verifiserer status, søkerheader og data fra service worker. Alle fem reset-testene observerer fra før navigasjon og avviser andre metoder enn GET og HEAD mot K9 Punsj, samt GET til debugglukking for alle journalpost-ID-er.

[`journalpost-loader.spec.ts`](tests/journalpost-loader.spec.ts) dekker **Skjul** og at PDF-en faktisk skjules, også etter omlasting. Den manuelle Gosys-GET-proben kontrollerte Cypress-oppsettet og var ingen brukerhandling; den er ikke gjenskapt.

Validering 2026-11-18: 5 bestått med én worker og 7 bestått sammen med PSB-piloten med standard workers (2). De tre reset-testene fra Cypress er erstattet. Søkerreisen med én sak og barnevalg og PSB → PLS → PSB er beholdt. Øvrig Fordeling-migrering gjenstår.

## Fordeling uten fagsaker og med oppslagsfeil

Kjør tomresultat- og feilreisene alene eller sammen med de tidligere Fordeling-testene:

```sh
yarn test:pw e2e/tests/fordeling-empty-and-lookup.spec.ts --workers=1
yarn test:pw e2e/tests/fordeling-empty-and-lookup.spec.ts e2e/tests/fordeling-reset.spec.ts e2e/tests/fordeling-psb.spec.ts
yarn test src/test/components/fordeling/KlassifiserModal.spec.tsx
```

De to Cypress-blokkene «søker uten fagsaker» og «søker uten liste med barn» er fjernet etter kartleggingen under. Linjenumrene viser `cypress/e2e/fordeling/PSB.cy.js` før denne oppryddingen.

| Tidligere Cypress-assertion | Automatisk dekning |
| --- | --- |
| 834–836 og 945–947: Åpne journalpost og klikk Skjul | `journalpost-loader.spec.ts` kontrollerer samme journalpost-fixture, synlig PDF, Skjul og skjult PDF, også etter omlasting |
| 832–862: Tom fagsakliste, barnevalg med etikett og verdi, panelinformasjon, informasjonsvarsel og aktiverte handlinger | `fordeling-empty-and-lookup.spec.ts` — `håndterer tomt saksoppslag med barn fra listen og manuell ident`; kontrollerer også eksakt «Barnets ID:» og ident i panelet |
| 864–886: Bytt til annet barn, fjern tidligere barn fra panelet, deaktiver handlingene og oppgi gyldig ident | Samme reise kontrollerer at både etiketten og tidligere ident mangler før inntasting. Manuell ident gjenoppretter etikett, panelinformasjon, varsel og aktive handlinger |
| 888–900: Manglende fødselsnummer fjerner etikett og ident, viser informasjon og deaktiverer Fortsett, men ikke Vent | Samme reise; avbryter også Vent-modal uten saks- eller barnedata og kontrollerer at valget beholdes |
| 902–940: Etter valgt manglende fødselsnummer: Nei → Ja erstatter fylt barneliste med tom liste; manuell ident og nytt valg uten fødselsnummer | Samme reise, steget «Bytt fra utfylt barneliste til tom liste via Nei og Ja etter valg uten fødselsnummer», verifiserer begge nye 200-svar, nullstilte kontroller, panel, informasjon og Fortsett/Vent |
| 943–988: Eksisterende sak med tom barneliste, bytte til ny sak, manuell ident og manglende fødselsnummer | `bytter fra eksisterende sak til ny sak når barnelisten er tom` kontrollerer eksakt paneletikett og ident, fjerning av tidligere ident, informasjon og Fortsett/Vent |
| Tillegg: Tomme saks- og barnelister allerede ved første bekreftelse av søker | `håndterer tomme saks- og barnelister uten å be om annet barn` kontrollerer manuell ident uten valg for annet barn, eksakt panelinformasjon og no-ID-tilstander |
| Modalinnhold og avbrytelse uten fagsak, med og uten barn | `KlassifiserModal.spec.tsx`; de to tilhørende interaktive historiene kontrolleres separat i Storybook |

Overgangen fra fylt til tom barneliste kjøres uten ny sideåpning og med manglende fødselsnummer valgt før Nei → Ja. Den uavhengige reisen som starter med tomme lister erstatter ikke denne overgangen. Eksisterende modalavbrytelser, kontraktkontroller og vern mot mutasjoner er beholdt.

Tillegg utover Cypress dekker 200 med bare andre ytelsers saker, samt 403 og 500 for både fagsak- og barnesøk. Sakssøkfeil viser den eksisterende feilmeldingen og forblir forskjellig fra et vellykket tomt svar. Barnesøkfeil viser først den eksisterende manuelle fallbacken; gyldig ident, person- og panelinformasjon samt Fortsett/Vent-tilstander kontrolleres før Vent-modalens avbrytelse og beholdte verdier. Nei → Ja utløser deretter et nytt oppslag, og en vellykket barneliste erstatter fallbacken. Begge gjenopprettingsreisene velger barn fra listen, bytter eksplisitt til et annet barn og kontrollerer at manuell registrering fortsatt fungerer. Alle reisene kontrollerer metode, sti, søkerheader, status og relevante svar, avbryter eventuelle modalvinduer og verifiserer at ingen journalførings-, vent-, kopierings-, behandlingsår-, Gosys- eller lukkemutasjoner sendes.

Reisene bruker test-ID-ene `930304`–`930311`. Browser-MSW-overstyringene er avgrenset til søker `17420373147`; andre svar og standardhandlere endres ikke. Ingen av reisene forsøker å journalføre eller reservere et saksnummer.

### Feilmeldinger ved fagsakoppslag

`cypress/e2e/fordeling/FagsakLookupErrors.cy.js` er fjernet etter kartleggingen under. Linjenumrene viser filen før sletting. Oppslagskontrollene fra den separate Cypress-filen er kartlagt under [Replaced Cypress lookup regressions](#replaced-cypress-lookup-regressions).

| Tidligere Cypress-kontroll | Automatisk dekning i `fordeling-empty-and-lookup.spec.ts` |
| --- | --- |
| 19–24: 403 viser tilgangsmelding, uten generell feil eller backendårsak | `viser fagsakoppslagsfeil ved status 403 uten å starte ny sak` |
| 27–31: 500 viser generell feil, uten tilgangsmelding | `viser fagsakoppslagsfeil ved status 500 uten å starte ny sak` kontrollerer også at backendårsaken ikke vises |
| 34–38: 200 med tom liste viser ingen av feilmeldingene | `håndterer tomt saksoppslag med barn fra listen og manuell ident` kontrollerer svaret og at begge meldingene mangler |

### Gjenoppretting etter feil ved barnesøk

`ChildLookupRecovery.cy.js` er fjernet etter kartleggingen under. Linjenumrene viser filen før sletting. Begge gjenopprettingsreisene i `fordeling-empty-and-lookup.spec.ts` dekker henholdsvis 403 og 500.

| Tidligere Cypress-kontroll | Automatisk dekning |
| --- | --- |
| 91–93: Åpne journalpost og skjul PDF | `journalpost-loader.spec.ts` bruker samme journalpost-fixture, klikker Skjul og verifiserer at PDF-en skjules. Gjenopprettingsreisene bruker samme visning med PDF-en åpen |
| 119–153: Første barnesøk feiler, sakssøk returnerer tom liste, og Nei → Ja gir vellykket barnesøk | Gjenopprettingsreisene kontrollerer GET, sti, søkerheader, status og svarinnhold for begge oppslagene |
| 138, 156–172: Fallback, nullstilte valg, barnevalg, panel, knapper og annet barn | Reisene kontrollerer at fallbacken forsvinner, valgene nullstilles, barnet vises i panelet og handlingene aktiveres. De bytter også til annet barn og fyller ut identen |
| 96–103, 173: Ingen mutasjoner eller debug-lukking | Reisene kontrollerer ingen skrivende K9 Punsj-kall, uavhengig av journalpost-ID, og ingen debug-lukking for journalposten |

Cypress sjekket ett barnesøk ved første feil og mer enn ett ved gjenoppretting. MSW-håndteren gir feil bare ved første treff, og Playwright venter separat på feilen og et nytt 200-svar etter Nei → Ja. Det viser rekkefølgen og minst to oppslag, men fastsetter ingen øvre grense for ekstra oppslag.

### Rettet reset-regresjon (B27)

Feilen med foreldet `barnetHarIkkeFnr` er rettet i #3973 og integrert fra master. Checkbox, identfelt, informasjon og Vent-regelen bruker nå samme state, og tillatelsen nullstilles ved relevante kontekstbytter.

Søkerreisen i `930302` passerer normalt uten `test.fail`. Den velger **Pleietrengende har ikke fødselsnummer**, bytter søker og kontrollerer deaktivert Vent etter at ny søker er lastet, før et barn velges. Etter barnevalg og avbrutte Fortsett-/Vent-modaler bytter den tilbake til opprinnelig søker og kontrollerer deaktivert Vent før **Det gjelder et annet barn** klikkes. Dermed kan ikke barnevalg eller checkbox-handlinger maskere en feil i søkerreset. Til slutt verifiseres tomt barnevalg, synlig og ikke valgt checkbox, aktivt identfelt, manglende infotekst og fortsatt deaktivert Vent. Begge reset-reisene beholder kontrollen av at ingen mutasjoner sendes. Øvrig Fordeling-dekning og Cypress-migrering gjenstår.

## Fordeling med nye og reserverte PSB-saker

Fem uavhengige tester i `fordeling-psb-new-and-reserved.spec.ts` bruker journalpostene `930312`–`930316` og eksisterende syntetiske person- og saksfixtures. Frontendflagget settes separat i hver nettleserkontekst før søker-/saksvalg. Avkrysning for **Reserver saksnummer til ny fagsak** sender ingen mutasjon; først bekreftet journalføring sender mottakskallet.

| Kilde i `cypress/e2e/fordeling/PSB.cy.js` / kontrakt | Navngitt automatisk dekning |
| --- | --- |
| 215–353: Reserverte option-etiketter, valgt verdi, barnets navn/ID eller «ikke satt», ingen K9-lenke, journalpostpanel og Fortsett/Vent-tilstander | `velger reserverte saker og journalfører valgt nummer med barn til PSB` velger begge reserverte fixtures |
| 215–353: Fortsett/Vent med barn og Vent uten barn, sammendrag, periode, advarsel, handling og avbrytelse uten mutasjon | Samme nettlesertest; modaltabellen i `KlassifiserModal.spec.tsx` har radene `Fortsett med reservert sak og barn`, `Vent med reservert sak og barn` og `Vent med reservert sak uten barn` |
| 354–369: Reserver nullstiller gammel sak/barn og saksnummer i panelet; begge handlingene er deaktivert før nytt barnevalg | Reisen for reserverte saker starter overgangen fra reservert sak uten barn. Begge flaggtestene starter den fra ordinær sak med barn. |
| 370–420: Barn med eksisterende PSB-sak gir identifiserende advarsel; frontendflagget tillater eller blokkerer begge handlinger | De samme to flaggtestene gjennom faktisk Fordeling-UI; ingen innsending |
| 421–498: Barn uten matchende sak fra listen, panel, informasjon, aktive handlinger og Fortsett/Vent-sammendrag uten sak/periode, med avbrytelse | `false`-varianten og `journalfører ny PSB-sak uten gammelt nummer og viser returnert reservasjon`; eksisterende komponenttest `viser modal for Fortsett uten fagsak med barn og avbryter uten mutasjon` og ny tabellrad `Vent uten fagsak med barn` dekker felles modalinnhold |
| 499–620: Eksplisitt annet barn, gyldig manuell fixture-ident og manglende fødselsnummer; panel, informasjon, knappetilstander og modalavbryt | `false`-varianten gjør alle overgangene med ikke-tom saksliste og avbryter begge modalene for manuelt barn samt Vent uten ident. Tilsvarende tomliste-/reset-assertions beholdes i `håndterer tomt saksoppslag med barn fra listen og manuell ident` og `nullstiller søker og barn når søkeridenten endres`; eksisterende komponenttest `viser modal for Vent uten fagsak eller barn og avbryter uten mutasjon` dekker felles sammendrag uten barn |
| B34 utover åpning/avbrytelse: Valgt reservert nummer sendes med barn og periode; 200, komplett journalpostrefresh og riktig PSB-destinasjon | `velger reserverte saker og journalfører valgt nummer med barn til PSB` kontrollerer request, søkerheader, returnert nummer, full refresh og reservert suksessinformasjon |
| B34: Ny reservasjon utelater `saksnummer` og `periode` på wire og bruker et nytt returnert nummer, ikke tidligere valgt fixture-sak | `journalfører ny PSB-sak uten gammelt nummer og viser returnert reservasjon`; komponenttesten `bruker det returnerte nye nummeret i callback, oppdaterer journalpost og navigerer til PSB` kontrollerer `setFagsak`, barn, PSB, tom periode, `reservertSaksnummer`, Redux og navigasjon |
| Tillegg utover Cypress: Backendformet 409 selv om frontendflagget tillater ny sak | `viser generisk feil ved backendkonflikt og beholder ny-sak-valgene etter avbryt` kontrollerer ProblemDetail, request/header/status, generisk klassifiseringsfeil, mulig nytt forsøk/avbrytelse, beholdte valg, ingen refresh, suksess eller navigasjon |

Linjenumrene i tabellen over gjelder en eldre versjon av `PSB.cy.js`. Tabellen under viser linjenumrene før de tre modalblokkene for reserverte saker ble fjernet. Selve saksvalgene er kartlagt under [de siste 13 blokkene](#de-siste-13-blokkene-i-fordeling-psb).

| Fjernet Cypress-blokk | Assertions | Automatisk dekning |
| --- | --- | --- |
| 139–169: reservert sak med barn, Fortsett | Fortsett-overskrift; Sakstype, Søkers ID, Saksnummer, Periode og Pleietrengendes ID med verdier; reservert saksnummer; advarsel i varselblokken; ingen Gå til LOS; aktiv bekreft og Avbryt; «Journalfør journalposten»; modalen lukkes | `velger reserverte saker og journalfører valgt nummer med barn til PSB` via `expectSummary` og `cancelSummary`. Hjelperen kontrollerer nå også feltetikettene, varselblokken og aktiv Avbryt, og reisen kontrollerer at saksvalget beholdes etter Fortsett-avbrytelse. `KlassifiserModal.spec.tsx` — `Fortsett med reservert sak og barn` |
| 171–201: reservert sak med barn, Vent | Vent-overskrift; samme sammendrag med barn; advarsel; ingen Gå til LOS; aktiv bekreft og Avbryt; «Journalfør og sett på vent»; modalen lukkes | Samme reise, etterfulgt av kontroll av beholdt saksvalg. `KlassifiserModal.spec.tsx` — `Vent med reservert sak og barn` |
| 224–253: reservert sak uten barn, Vent | Vent-overskrift; sammendrag med reservert saksnummer og periode uten Pleietrengendes ID; advarsel; ingen Gå til LOS; aktiv bekreft og Avbryt; «Journalfør og sett på vent»; modalen lukkes | Samme reise, første sak i løkken, med kontroll av beholdt saksvalg. `KlassifiserModal.spec.tsx` — `Vent med reservert sak uten barn` |

De utvidede kontrollene i `expectSummary` gjelder også modalene i ny-sak- og 409-reisene i samme fil.

De fem modalblokkene for ny sak og én søker er fjernet etter kartleggingen under. Linjenumrene viser `PSB.cy.js` før disse blokkene ble fjernet. [De siste 13 blokkene](#de-siste-13-blokkene-i-fordeling-psb) viser hvor valgkjeden dekkes.

Alle fem dekkes av `ny-sak-modus respekterer frontendflagget false uten mutasjoner`: `expectSummary` kontrollerer overskrift, sakstype og søker med etiketter og verdier, ingen saksnummer eller periode, varsel, fravær av Gå til LOS og aktive knapper med riktig handlingstekst. `cancelSummary` kontrollerer at modalen fjernes. Reisen kontrollerer beholdte valg og at ingen mutasjoner sendes.

| Fjernet Cypress-blokk | Automatisk dekning |
| --- | --- |
| 241–270: barn fra liste, Fortsett | Reisen kontrollerer barnets etikett og ident i sammendraget og beholdt barnevalg etter avbryt. `KlassifiserModal.spec.tsx`: `viser modal for Fortsett uten fagsak med barn og avbryter uten mutasjon` |
| 272–301: barn fra liste, Vent | Samme reise kontrollerer barnets etikett og ident og beholdt barnevalg. `KlassifiserModal.spec.tsx`: `Vent uten fagsak med barn` |
| 327–356: annet barn, Fortsett | Samme reise kontrollerer manuell barneident i sammendraget og at valget og identen beholdes. Komponenttesten for Fortsett uten fagsak bruker også manuell barneident |
| 358–387: annet barn, Vent | Samme reise kontrollerer manuell barneident i sammendraget og beholdt valg og ident. Komponenttesten for Vent uten fagsak med barn dekker det felles sammendraget |
| 403–431: manglende fødselsnummer, Vent | Samme reise kontrollerer at barnets etikett og tidligere barneidenter mangler i sammendraget og at valget beholdes. `KlassifiserModal.spec.tsx`: `viser modal for Vent uten fagsak eller barn og avbryter uten mutasjon` |

Begge suksessreisene velger **Registrere opplysninger til K9** og kontrollerer aktiv **Bekreft**, men klikker ikke. Request-lyttere registreres før første sideåpning og kontrollerer at bare tilsiktet mottak sendes; Vent, kopiering, behandlingsår, Gosys, lukking og oppretting/innsending av søknad skal ikke kalles. Refresh verifiseres som full journalpost for samme ID, med endelig SAF-status, riktig barn og `sak.reservertSaksnummer: true`, uten å telle nøyaktig antall GET-kall. URL-assertions tillater `?dok=1`.

Backendkontrakten er den verifiserte kontrakten i oppgave 12: mottak returnerer 200 med saksnummer. Frontenden sender periode for valgt sak, men backend-DTO-en har ikke dette feltet. Frontendflagget styrer bare UI-et; backendens `ENABLE_SAK_SPLITT_PSB` er uavhengig. MSW beviser frontendkontrakten, ikke faktisk reservasjon, journalføring eller PDL-/K9-/LOS-sideeffekter.

### Validering 2026-11-17

| Sjekk | Resultat |
| --- | --- |
| `yarn test src/test/components/fordeling/KlassifiserModal.spec.tsx` | 15 bestått |
| `yarn test:pw e2e/tests/fordeling-psb-new-and-reserved.spec.ts --workers=1` | 5 bestått |
| `yarn test:pw e2e/tests/fordeling-psb.spec.ts e2e/tests/fordeling-reset.spec.ts e2e/tests/fordeling-empty-and-lookup.spec.ts e2e/tests/fordeling-psb-new-and-reserved.spec.ts` | 17 bestått med standard workers (4) |
| `yarn lint` | Bestått, inkludert begge TypeScript-kontrollene |
| `yarn build-storybook` | Bestått; dette alene er ikke interaksjonsbevis |
| `git diff --check` | Bestått |

Runtime ble kontrollert separat i nettleserens Storybook Interactions-panel på det ferdige bygget: [Reservert sak med barn](http://localhost:6006/?path=/story/components-klassifisermodal--reservert-sak-med-barn) fikk PASS for 17 steg og [Ny sak med backendkonflikt (409)](http://localhost:6006/?path=/story/components-klassifisermodal--ny-sak-med-backendkonflikt) fikk PASS for 22 steg. Begge ble kjørt på nytt med **Reload story** i samme nettleser og fikk samme resultat uten feilede steg. Historiene kontrollerer sammendrag/avbrytelse og feil/avbrytelse med fungerende callbacks og nullstilte request-spioner.

Ingen krav ble blokkert av en produksjonsfeil. Eksisterende fixtures gir React-advarsler om duplikat barne-ID som key; de er ikke endret. Testserverne ble startet bare på ledige porter og stoppet etter kontrollene. Ingen backend- eller full Cypress-kjøring er utført. Dette dekker bare de kartlagte delene av B25/B26/B34; øvrige to-søker-varianter, andre Fordeling-familier, full paritet og Cypress-sletting gjenstår.

## Fordeling PSB med to søkere

`fordeling-psb-two-applicants.spec.ts` har to selvstendige reiser for scenario `930317`: avbrudd med to søkere og ny sak, og journalføring med kopiering til en annen søker. Personoppslaget for annen søker er lokalt i nettleserkonteksten. Bare kopieringsreisen installerer en blokkert kopieringsrespons.

| Kilde i `cypress/e2e/fordeling/PSB.cy.js` / kontrakt | Dekning eller gjenstående gap |
| --- | --- |
| `Test to søkere i journalposten` (linje 364–394 før migrering): registreringsinformasjon, advarsel før og etter personoppslag, manglende barn, deaktiverte handlinger, barnevalg, panel og aktiverte handlinger | Avbruddsreisen bekrefter opprinnelig søker, annen søkers header og vellykkede service-worker-svar, advarsler og knapper før og etter valg av første barn fra `barn.json`. `fordelingUtils.spec.ts` beskytter også manglende/ugyldig annen søker og identkollisjoner |
| `Åpne klassifiser modal fortsett med med 2 søkere, reserver fagsak og barn fra liste` (linje 396–425 før migrering): Fortsett-sammendrag, advarsel og avbryt | Avbruddsreisen kontrollerer feltetiketter og verdier uten saksnummer/periode, fravær av Gå til LOS, advarselen, aktive knapper, avbrudd, beholdte valg og fravær av mutasjoner |
| `Åpne klassifiser modal sett på vent med 2 søkere, reserver fagsak og barn fra liste` (linje 427–457 før migrering): Vent-sammendrag, advarsel og avbryt | Avbruddsreisen kontrollerer samme sammendrag og avbryter Vent-modalen uten mutasjoner. Faktisk Vent-handling med to søkere gjenstår |
| Tillegg: mottak, kopi og refresh av original før eksplisitt Videre | Nettleserreisen kontrollerer rekkefølge, pending-tilstand, request/response, opprinnelig søker og journalpost, ingen navigasjon før klikk og PSB-skjermen etterpå. Den oppretter eller sender ikke søknad |
| Tillegg: kopieringsfeil og tilgangsfeil | `KlassifiserModal.spec.tsx` dekker nytt kopieringsforsøk uten nytt mottak, Videre uten nytt kopieringsforsøk og representativ tilgangsfeil (403) ved refresh etter vellykket kopi |

Mottak sender i dag `relatertPersonIdent: ""` også for PSB; backend behandler blank verdi som fraværende. Øvrige ubrukte, udefinerte felt utelates. Kopikallet sender bare mottaker, barn og PSB. MSW kontrollerer frontendflyten, ikke faktiske sideeffekter i SAF, Dokarkiv, PDL, K9 Sak eller LOS.

Den interaktive historien [To søkere: kopieringsfeil og nytt forsøk](http://localhost:6006/?path=/story/components-klassifisermodal--to-sokere-kopier-feil-med-vellykket-nytt-forsok) viser generisk kopieringsfeil, nytt forsøk og aktiv **Videre**. Den lokale destinasjonen er bare en demonstrasjon; Playwright kontrollerer applikasjonsskjermen.

To-søker-Vent med faktisk utførelse og samtidighet, behandling av kopiert journalpost og allerede behandlede journalposter gjenstår. Avbruddsreisen journalfører, kopierer eller setter ikke journalposten på vent. Kopier-og-lukk er kartlagt separat nedenfor. Dette gir ikke full B25/B26/B34-paritet og erstatter ikke de gjenværende Cypress-testene.

```sh
yarn test src/test/components/fordeling/KlassifiserModal.spec.tsx
yarn test:pw e2e/tests/fordeling-psb-two-applicants.spec.ts --workers=1
yarn test:pw e2e/tests/fordeling*.spec.ts
```

## Ferdigstilt PSB uten barn: kopier og lukk

`fordeling-psb-copy-and-close.spec.ts` bruker en isolert ferdigstilt kilde med reservert saksnummer og en annen, eksisterende sak for valgt barn.

Den siste Cypress-blokken for ferdigstilt PSB uten barn er fjernet etter at alle assertions ble kartlagt til Playwright, Vitest og Storybook. Linjenumrene i tabellen viser `PSB.cy.js` før oppryddingen.

| Kilde i `cypress/e2e/fordeling/PSB.cy.js` | Dekning eller gjenstående gap |
| --- | --- |
| 991–1041: Åpning, Skjul, ferdigstilt-varsel, låste valg, bekreftet søker, fraværende journalfør-knapper og valg av barn uten treff | Playwright kontrollerer Skjul, varsel, dokumenttype, aktiv og valgt Ja, deaktivert og ikke valgt Nei, verdien til første barnevalg og handlinger. `fordelingUtils.spec.ts` beskytter rene identitets- og toggle-regler. Selve videreføringen, brevet og Vent for barn uten treff er ikke dekket her |
| 1042–1057: Barn med eksisterende sak, skjulte vanlige handlinger, advarsel og kopieringsknapp | Playwright kontrollerer barn, sak, advarsel og handlinger |
| 1058–1067: Modaltittel, forklaring, barn, knapper og kopieringsfeil | Playwright kontrollerer sammendrag og avbryt; `KopierModal.spec.tsx` dekker generisk feil og eksplisitt nytt forsøk med både 201 og 202 |
| 1068–1095: Opprettet kopi, lukkefeil og tilgjengelig nytt forsøk eller retur | Modaltesten dekker kopifeil, 202 ved nytt forsøk og påfølgende lukkefeil. Modaltestene og [Lukkefeil med nytt forsøk](http://localhost:6006/?path=/story/components-kopiermodal--lukkefeil-med-nytt-fors%C3%B8k) dekker begge valgene med kopisvar 201 |
| 1096–1124: Nytt lukkeforsøk, suksess og eksplisitt LOS-retur | Modaltestene og historien dekker nytt forsøk; Playwright kontrollerer faktisk toppnivånavigasjon etter direkte vellykket lukking |

202-forløpet tester frontendens håndtering av den tidligere Cypress-mocken; den verifiserte backendkontrakten for vellykket kopi er 201. Tillegg til Cypress: kontrakter og rekkefølge for kopi og lukking, kildesak mot målsak, avbryt uten mutasjoner, første visning av 403/409, ingen automatisk navigasjon og antall kall ved nytt lukkeforsøk. Modaltesten kontrollerer at «Tilbake til LOS» er deaktivert under pågående lukking. «Lukk journalpost» vises bare etter lukkefeil, forsvinner når nytt forsøk fjerner feiltilstanden og vises igjen dersom lukking feiler på nytt. Denne oppførselen er akseptert.

Dette er ikke task 13 sin refresh av originalen og videreføring til PSB. Gjenstående gap er vern mot flere kopieringsklikk og avbryt under kopiering, gjenoppretting etter 403/409 og foreldede flagg, transporttvetydighet og reload/remount, alternative ruter for barn uten treff, allerede behandlede journalposter, behandling av kopi-ID og to-søker-Vent. MSW viser frontendflyten, ikke faktiske effekter i SAF, Dokarkiv, K9 Sak, Gosys eller LOS. Dette er ikke full Fordeling-paritet; øvrige Cypress-blokker beholdes.

```sh
yarn test src/test/components/fordeling/KopierModal.spec.tsx
yarn test:pw e2e/tests/fordeling-psb-copy-and-close.spec.ts --workers=1
```

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
