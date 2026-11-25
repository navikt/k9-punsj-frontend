# Playwright

The Chromium Playwright suite runs the frontend with its existing MSW test handlers. It does not call the backend.

The PR workflow runs the full suite in two Playwright shards with two workers each when a pull request is opened or synchronized. The `Playwright` check succeeds only if both shards succeed. Each runner repeats installation and server startup, so splitting the suite does not guarantee halving CI time.

To inspect a shard, download its `playwright-<run-id>-<attempt>-shard-<index>` artifact from the Actions run summary. Each artifact contains that shard's HTML report and failure results, including traces and screenshots when available. Extract the artifacts into separate directories and run `yarn exec playwright show-report <extracted-directory>/playwright-report` for each report.

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

Run both CI shards locally in sequence because they use the same port:

```sh
yarn test:pw --workers=2 --shard=1/2
yarn test:pw --workers=2 --shard=2/2
```

Each run overwrites `playwright-report/` and `test-results/`; open or save the first shard's report before starting the second. Open the current report with `yarn exec playwright show-report playwright-report`.

## PSB form save and submission

`psb-punch-form.spec.ts` replaces all five mapped checks from `cypress/e2e/pleiepenger/PleiepengerPunsj.cy.js`.

| Cypress block (migration baseline) | Playwright coverage |
| --- | --- |
| Earlier migration, line 8: Submit PSB application | The journey verifies the edited date in the validation request and final receipt, plus the applicant and application IDs in the submit request. |
| B52: Confirmed-send failure and retry | `sender inn PSB-søknaden på nytt etter midlertidig sendefeil` verifies the first confirmed POST fails with 500, the actionable error and edited date remain, then the actual review/confirmation flow retries the identical request and shows the 202 receipt. |
| Earlier migration, line 18: Save updated received date on blur | The journey verifies the prefilled date, the edited date in the successful save request, and that the field retains the edit. |
| B51: Autosave failure and recovery | The journey verifies the visible PUT 500 error, retained inputs, and unchanged draft on GET. The next user-triggered PUT 200 and GET readback preserve both date and time edits; the error clears and the saved status appears without validation or submission. Only the intended save fails; other valid saves follow the normal mock path without a fixed PUT count. |
| B53: Save and reload a PSB draft | `beholder endret PSB-utkast etter omlasting` verifies the initial GET and values, a matching successful autosave, then a real reload whose GET returns that PUT snapshot and whose form displays the edited date. The journey sends no validation or submission. |
| B40, line 6: Freelancer validation | `viser valideringsfeil når frilanserens sluttdato er før startdato` verifies the end date remains and is invalid. |
| B41, line 18: Longer work-time periods | `registrerer arbeidstid for lengre perioder og konverterer tidsformat` verifies both periods and the 10 registered days. |
| B42, line 65: Time-format conversion | The same work-time test verifies decimal conversion, conversion back to hours and minutes, and the saved values on each day in both periods. |

The B52 journey installs its own MSW handlers after loading the approved draft fixture. It checks successful save and validation independently from the first confirmed-send 500, observes the modal closing and the user-facing backend problem detail, then retries through the form's normal validation and confirmation flow. Both navigation-observed send requests must have the same path, applicant header and exact body; the 202 response and completion receipt retain the edited date.

The B53 journey registers page-local MSW handlers before the app starts. Its successful PUT response is the only value persisted in that test page's `sessionStorage`; after a real `page.reload()`, the new document's GET serves that saved DTO. This verifies frontend reload behavior, not backend persistence or write ordering.

PSB autosave retains only patches passed for persistence, not local-only form edits such as enabling an employment type. Successful PUT responses acknowledge sent values without clearing newer patches. Request IDs guard responses before Redux dispatch and again after JSON decoding; snapshot and save status update together. Draft/form resets, global reset, and load entry invalidate the previous save and clear its status/error. Tests using the production root reducer cover older 200 and 500 responses after a newer 200, after reset, and during/after loading another draft, plus delayed JSON decoding and clearing completed save status. Component tests retain coverage of local-only edits and acknowledgement reconciliation. These client-side guards do not establish backend write ordering.

## PSB existing applications

`psb-existing-applications.spec.ts` replaces the active journalpost-panel check and four commented journeys in `cypress/e2e/pleiepenger/EksisterendeSoknader.cy.js`. The Cypress spec was removed after the three Playwright journeys passed; nine Cypress specifications remain, down from ten.

| Cypress check | Playwright coverage |
| --- | --- |
| Active: journalpost, applicant and child panel values | All three journeys verify the panel through the real Fordeling and registration-choice flow. |
| Commented: empty-list information and manual-create button | The old expectation is obsolete: an empty lookup automatically creates an application. `fordeling-psb.spec.ts`, `journalfører valgt PSB-sak og går til riktig registreringsvalg`, verifies the empty lookup, exact create payload, returned ID and visible form. |
| Commented: back to Fordeling | `går tilbake fra eksisterende PSB-søknader til journalposten` verifies the panel after returning without creating, validating or submitting an application. |
| Commented: start a new registration | `starter manuell PSB-registrering fra en liste med eksisterende søknader` verifies the create payload, 201 response ID, form GET and visible form. |
| Commented: continue an existing application | `viser eksisterende PSB-søknader, avbryter og fortsetter på en kompatibel søknad` verifies the list data and compatibility gates, cancel without fetching the application, then resume through its ID without creating an application. |

## PLS existing applications

`pls-existing-applications.spec.ts` covers the three nonempty-list journeys through real Fordeling and registration choice. The existing empty-list auto-create journey remains in `fordeling-pls-classification.spec.ts`.

| Journey | Playwright coverage |
| --- | --- |
| Resume an existing application | `viser eksisterende PLS-søknader, avbryter og fortsetter på en kompatibel søknad` checks the list values, case and child compatibility, suppression of new registration when the current journalpost is listed, cancellation without a form GET or write, and resume through the selected application's ID. |
| Create from a nonempty list | `starter manuell PLS-registrering fra en liste med eksisterende søknader` checks the available button, exact create payload, 201 response ID, form GET and visible form. |
| Go back | `går tilbake fra PLS-søknadslisten uten å opprette en søknad` checks the preceding registration-choice screen without fetching a form or creating, validating or submitting an application. |

## PLS form saving and submission

`pls-punch-form.spec.ts` covers the PLS slice of B49 through journalpost classification, registration choice and the real form. Scenario-local MSW handlers are installed before classification and application requests. The classified journalpost refresh is matched by a GET that starts after the classification POST response.

| Journey | Playwright coverage |
| --- | --- |
| Successful submission | Checks the full initial 201 DTO and matching GET; edits the received date/time, signature choice, application period and medical-information flag; checks PUT and validation bodies, the default `PT7H30M` withdrawal in both K9 receipts, review, confirmation, one send with the actual identity body/header, the completion receipt and **Tilbake til LOS**. |
| Backend validation rejection | Returns a 400 `SøknadFeil` with a synthetic error code for otherwise valid inputs, checks the safe summary fallback and retained values, and verifies there is no preview, confirmation or send. It does not assert whether field errors are present. |

Both journeys observe writes from navigation onward and verify that no validation occurs before the explicit **Send inn** action, without fixing autosave counts. The local store has separate persistence paths for `PUT /pleiepenger-livets-sluttfase-soknad/oppdater` (200) and successful `POST /pleiepenger-livets-sluttfase-soknad/valider` (202); rejected validation does not persist. Read-only browser GET probes verify the stored DTO after PUT and validation, including the differing save/validation shapes. `POST /pleiepenger-livets-sluttfase-soknad/send` (202) loads that store and maps its receipt, rather than reusing the validation response or incoming send body.

Existing frontend gap: validation currently sends the application ID in `X-Nav-NorskIdent`; send uses the applicant ID. The test does not require the incorrect validation header, but checks the send header. Signature is UI state, not part of the application DTO. Production code, shared fixtures, Cypress, OLP and OMPKS remain unchanged.

Codex verified the create response and default withdrawal in the sibling backend source. The public backend service, DTO and mapper source also show `tilPlsvisning()` for create and GET, the default withdrawal, validation using stored journalposts and existing K9 periods, persistence on success, and send mapping the stored entity again. The initial DTO uses modeled values for the journalpost-derived date/time. The rejection code is synthetic, not a verified backend example. These frontend MSW tests do not verify backend runtime deserialization, validation, responses or persistence.

## OLP existing applications

`olp-existing-applications.spec.ts` covers four isolated browser journeys. It observes requests from journalpost navigation and installs context-local MSW handlers after the initial journalpost response, before classification and OLP list/create requests. Existing applications use `olpSoknad.json`; the separate create response and following GET explicitly model the new-draft DTO defaults and fields assigned during first submission. Its child object has null identity and birth date, with no populated data copied from the existing-application fixture.

| Journey | Playwright coverage |
| --- | --- |
| Resume an existing application | Checks the applicant header and OLP list response, meaningful row values, hidden new-registration button when the current journalpost is listed, enabled rows with a different case or child, cancellation without a form GET or write, and resume through the selected ID. |
| Create from a nonempty list | Checks the available button and no premature POST, then verifies one create request with `pleietrengendeId`, the full 201 DTO, matching form GET and visible loaded form. |
| Go back | Uses **Tilbake** and checks the registration choice and journalpost panel without a form GET or application write. |
| Create from an empty list | Verifies that a successful empty-list lookup precedes one automatic create request, then checks the same create-to-form contract. |

The list and registration-choice components share a React Query key, so these checks validate the list response without assuming a fixed lookup count. The backend source trace confirms that the create API accepts `pleietrengendeIdent` (alias `barnIdent`), while the frontend sends `pleietrengendeId`. `førsteInnsendingOlp` maps a null `barnIdent` to a child DTO with null identity and birth date. This is a source-confirmed contract mismatch; the test request and fixture do not hide it. Playwright uses MSW, so backend deserialization, runtime response and persistence are not tested.

## OLP form saving and submission

`olp-punch-form.spec.ts` covers the OLP form slice of B49 through journalpost classification and the real form. Each journey installs isolated MSW handlers before classification and application requests; the journalpost refresh is matched only after the classification response.

| Journey | Playwright coverage |
| --- | --- |
| Successful submission | Keeps the real create body and full initial DTO, including a child with null identity; checks the matching GET, then verifies form hydration from the selected child ID in the saved and validation bodies. Checks applicant, child, journalpost, application/case identity, received date and course data; reads back the PUT and successful validation state; reviews the mapper-shaped receipt, confirms once, then checks one send from saved state and the completion receipt. |
| Backend validation rejection | Sends otherwise valid form values, returns HTTP 400 in the backend `SøknadFeil` shape, checks visible feedback, unchanged saved values and no send. The shape follows the backend source; the example error code/message are synthetic because the source does not define a concrete rejection for these valid values. |

The local MSW store keeps creation, PUT save, validation and send separate. PUT returns the DTO and updates the draft; successful validation maps the incoming values with stored journalposts and the scenario's existing K9 periods, then persists the values before returning 202. Rejected validation does not persist. Send checks the applicant header and request, then builds its 202 receipt from the saved draft, including the mapper's default `PT7H30M` course withdrawal. The tests verify methods, paths, relevant headers, bodies and statuses without pinning autosave or validation counts.

The case ID is checked in the create DTO, initial DTO/form GET and K9-period lookup. MSW stores it separately on the application entity. After PUT and successful validation, GET returns the stored DTO with `k9saksnummer: null`, matching the backend mapper: `utfyllendeInnsendingOlp` stores the incoming DTO JSON, and `tilOlpvisning` does not add the entity's case number back. A rejected validation leaves that saved DTO unchanged.

The backend source confirms that the create endpoint receives `OpprettNySøknad`, while the frontend sends `pleietrengendeId` and the backend DTO reads `pleietrengendeIdent`/`barnIdent`. The test preserves that real frontend request and checks that the form hydrates its missing child identity from the selected journalpost context. These Playwright/MSW journeys do not test backend runtime deserialization, validation, or persistence. Production code, shared fixtures, Cypress and other application families remain unchanged.

## OMPAO existing applications

`ompao-existing-applications.spec.ts` replaces the active journalpost-panel check and five commented checks in `cypress/e2e/omsorgspenger-alene-om-omsorgen/eksisterendeSoeknader.cy.js`. The four Playwright journeys passed before the Cypress spec was removed; eight Cypress specifications remain, down from nine.

| Cypress check | Playwright coverage |
| --- | --- |
| Active: journalpost and applicant panel values | All four journeys verify the panel through journalpost classification and the registration-choice screen, including child and case context. |
| Commented: empty-list information | The old manual-click expectation is obsolete: an empty lookup automatically creates an application. `oppretter OMPAO-søknad automatisk når listen er tom` verifies lookup-before-create order, the exact create payload, returned ID, form GET and visible form. |
| Commented: continue an existing application | `viser eksisterende OMPAO-søknader, avbryter og fortsetter på en kompatibel søknad` checks the list columns and child/case gates, cancel without fetching the application, then resume by ID without creating, validating or submitting. |
| Commented: back to Fordeling | `går tilbake fra OMPAO-søknadslisten uten å opprette en søknad` uses the application's **Tilbake** button and verifies the preceding registration-choice screen without writes or a selected-application GET. |
| Commented: start a new registration | `starter manuell OMPAO-registrering fra en liste med eksisterende søknader` verifies the exact create payload, 201 DTO, form GET and visible form. |
| Commented: hide new registration when the current journalpost is listed | The resume journey verifies that **Start ny registrering** is absent when a listed application includes the current journalpost. |

The table's informational alert may still say that a new registration is unavailable when its button is present: the parent does not pass its computed availability flag to the table. The test checks the actual button state and does not treat the contradictory alert as expected behavior.

## OMPKS existing applications

`ompks-existing-applications.spec.ts` uses `jpOMPKS302.json` and the OMPKS case with a child at `fagsaker.json[11]`. Its page-local responses use the OMPKS list shape `{ søker, fagsakTypeKode: "OMP_KS", søknader }`; the shared OMPKS map mock has an OMPAO family code and is left unchanged.

| Journey | Playwright coverage |
| --- | --- |
| Resume an existing application | Checks the journalpost panel and meaningful row values, disables the different-case and different-child rows, hides **Start ny registrering** when the current journalpost is listed, cancels without a form GET or write, then resumes through the selected ID. |
| Create from a nonempty list | Checks the available button and no premature POST, then verifies one create POST with `pleietrengendeIdent`, its full 201 application DTO, the matching form GET and visible form. |
| Go back | Uses **Tilbake** and checks the registration choice and journalpost panel without a form GET or writes. |
| Create from an empty list | Adds OMPKS-specific empty-list coverage: verifies the successful lookup response precedes one create POST, checks the same payload, full 201 application DTO and matching form GET, and verifies the visible form. |

## OMPKS form saving and submission

`ompks-punch-form.spec.ts` covers two B49 journeys through journalpost classification and the real form. Scenario-local MSW handlers are installed before classification and application requests; the refresh GET must start after the classification response.

| Journey | Playwright coverage |
| --- | --- |
| Confirmed submission | Checks the create body, full initial DTO and matching GET; saves date, time and both flags; reads the stored draft after PUT and successful validation; checks the review, confirmation, send body and applicant header, receipt and **Tilbake til LOS**. |
| Validation rejection | Returns a synthetic 400 `SøknadFeil` for otherwise valid values, verifies that the changed time remains visible while GET still returns the previously saved time, and checks no send. The matching PUT is held until after the readback and released independently in a `finally` block. A third time exercises interim validation after the send attempt. |

The MSW store models PUT and successful validation as separate updates, keeps journalposts and the entity's case number separately, and builds the send receipt from the stored draft. In the successful journey, the final time edit triggers a PUT held until send; the readback and send receipt therefore verify the newer value persisted by validation, independently of that PUT. GET restores the entity's case number, as `tilOmsKSBvisning` does. The public backend service, routes, DTO, mapper and `MappeService` show these paths, including validation against stored journalposts and the mapper's child, flags and `kroniskEllerFunksjonshemming: true`. The initial date and time are modeled. These tests do not verify backend runtime validation or persistence.

Existing frontend gap: validation sends the application ID in `X-Nav-NorskIdent`, while send uses the applicant ID. The test checks the validation body and send header without requiring the incorrect validation header. Production code, Cypress and shared fixtures remain unchanged.

## OMPMA existing applications

`ompma-existing-applications.spec.ts` uses `jpOMPMA304.json` and the OMPMA case with a related person at `fagsaker.json[18]`. Page-local responses use `{ søker, fagsakTypeKode: "OMP_MA", søknader }` and the OMPMA create contract `{ journalpostId, norskIdent, annenPart, barn: [], k9saksnummer }`; shared mocks and existing OMPMA Fordeling Cypress coverage remain unchanged.

| Journey | Playwright coverage |
| --- | --- |
| Resume an existing application | Checks the journalpost panel and meaningful row values, disables different-case and different-other-parent rows, hides **Start ny registrering** when the current journalpost is listed, cancels without a form GET or write, then resumes through the selected ID and checks loaded form values. |
| Create from a nonempty list | Checks the available button and no premature POST, then verifies one create POST with the full 201 application DTO, the matching form GET and visible loaded values. |
| Go back | Uses **Tilbake** and checks the registration choice and journalpost panel without a form GET or writes. |
| Create from an empty list | Verifies the successful lookup response precedes one automatic create POST, checks the same request and full response DTO, then verifies the matching form GET and visible loaded values. |

## OMPMA Fordeling case selection

`fordeling-ompma-case-selection.spec.ts` opens `jpOMPMA304` through the journalpost UI, selects the OMPMA subtype and uses applicant-scoped page-local MSW data from `fagsaker.json[18]` and `[19]`. The response, status, service worker and URL pathname are checked. The two fixtures have the same related person, so the reserved-case transition verifies that the ordinary case ID and K9 link disappear while the correct related-person details remain.

### Task 66 mapping at baseline `e659c507`

| Cypress block | Playwright coverage |
| --- | --- |
| 65–90: Confirm applicant and select ordinary case | `velger ordinær og reservert OMPMA-sak og fjerner foreldede detaljer` checks the applicant-scoped lookup response, selected case ID, related-person name and ID, K9 link, journalpost-panel case and related-person ID, manual-input absence, and enabled actions. |
| 92–154: Cancel Fortsett and Vent for ordinary case | `avbryter Fortsett for ordinær OMPMA-sak` and `avbryter Vent for ordinær OMPMA-sak` check the distinct headings and confirm labels, OMPMA type, applicant, related person, case number, period, irreversible-information warning, no LOS action, enabled buttons, retained selection and no writes. |
| 156–177: Select reserved case | The selection journey verifies the reserved case ID and related-person details, absence of the K9 link, removal of ordinary-case details, and enabled actions. |
| 179–241: Cancel Fortsett and Vent for reserved case | `avbryter Fortsett for reservert OMPMA-sak` and `avbryter Vent for reservert OMPMA-sak` verify the corresponding reserved-case modal contents and cancel without writes or losing the selected case. |

Task 66 removed only the four mapped modal blocks; both case-selection blocks remained in `OMPMA.cy.js`.

### Task 67 mapping at baseline `95f62424`

| Cypress block | Playwright coverage |
| --- | --- |
| 65–90: Confirm applicant and select ordinary case; 92–113: select reserved case | `velger ordinær og reservert OMPMA-sak og fjerner foreldede detaljer` checks the applicant-scoped lookup response, selected case IDs, related-person name and ID, K9 link, journalpost-panel values, removal of the ordinary case after selecting the reserved case, manual-input absence, and enabled actions. |
| 115–144: Reserve a new case and enter a manual other party | `reserverer ny OMPMA-sak og registrerer manuell annen part` checks that the reserved case and related-person ID leave the panel, manual input appears, actions are disabled until entry, and the `GET /person` response and resulting panel, no-case notice and enabled actions. Cypress retains the reservation check and ID entry as stateful setup for applicant-switch tests. |
| 146–175: Cancel Fortsett without a selected case; 177–206: cancel Vent | `avbryter Fortsett for OMPMA uten valgt sak` and `avbryter Vent for OMPMA uten valgt sak` check distinct headings and confirm labels, OMPMA type, applicant and manual other party, absent case and period, irreversible-information warning, no LOS action, enabled buttons, retained reservation and input after cancel, and no writes. |
| 299–328: Empty case lookup | `viser manuell annen part når OMPMA-oppslaget ikke finner saker` checks the applicant-scoped 200 response with `[]`, service worker and request header, absence of the case selector, and the manual other-party panel, no-case notice and enabled actions. |

Task 67 removed the two mapped no-case modal blocks and empty-lookup describe. The reservation and manual-entry actions remain for applicant-switch tests. `OMPMA.cy.js` remains, and the configured Cypress pattern still matches `OMPMA.cy.js`, `OMPAO.cy.js` and `OMPKS.cy.js`.

### Task 68 mapping at baseline `283e769c`

| Cypress block | Playwright coverage |
| --- | --- |
| 113–119: Reserve a new case and enter a manual other party as stateful setup | `reserverer ny OMPMA-sak og registrerer manuell annen part` independently covers reservation, manual entry and enabled actions; the Cypress setup blocks are no longer needed. |
| 121–134: Reset applicant while retaining the manual other party | `nullstiller og erstatter OMPMA-søker med manuell annen part` checks that the case controls disappear, the manual ID remains in the input and journalpost panel, and both actions are disabled. |
| 136–147: Enter replacement applicant | The same journey verifies the applicant-scoped case and person requests (200, MSW, request identity and response body), replacement identity, removal of old applicant/case details, retained manual party, reservation notice and enabled actions. The case response uses nonempty OMPMA fixtures. |
| 149–178 and 180–209: Cancel Fortsett and Vent for the replacement applicant | The same journey checks each distinct heading and confirm label, OMPMA type, replacement applicant and manual party, absent case/period fields, irreversible-information warning, no LOS action, enabled controls, retained reservation/input/panel state after cancel, and no writes. Neither confirmation is executed. |

Task 68 removed only those four applicant-switch/modal blocks and their two stateful setup blocks from `OMPMA.cy.js`. The earlier case-selection blocks and separate two-applicant describe remained at that point; Task 69 maps and removes the latter. The Cypress file remains, and the unchanged configured pattern continues to match `OMPMA.cy.js`, `OMPAO.cy.js` and `OMPKS.cy.js`.

### Task 69 mapping at baseline `54d80ab2`

| Cypress block | Playwright coverage |
| --- | --- |
| 114–120: Open journalpost and select OMPMA subtype | `avbryter Fortsett og Vent for OMPMA med to søkere og manuell annen part` opens the journalpost through the UI and checks the response, URL pathname and selected subtype. |
| 122–149: Two-applicant and manual-party gating | The same journey confirms the primary applicant using the nonempty OMPMA case response, checks the paper two-applicant information and missing-applicant warning, then verifies the local PERSON response and retained second-applicant ID. The missing OMPMA other-party warning appears and keeps both actions disabled until new-case reservation and manual-party entry; the no-case notice and enabled actions then appear. |
| 151–178: Cancel Fortsett | The journey verifies the distinct heading and confirm label, OMPMA type and primary applicant, absent case/period fields, irreversible-information warning, no LOS action and enabled controls. Cancel closes the dialog and retains both applicant IDs, reservation, manual-party input/panel and enabled actions without writes. |
| 180–207: Cancel Vent | The same checks cover the Vent heading and confirm label. Neither modal is confirmed; no classification, hold, copy, treatment-year or application write occurs. |

Task 69 removed only this four-block two-applicant describe and its now-unused constants. The nine main-describe case-selection and initial-state blocks remain. The Cypress file remains, and the unchanged configured pattern matches `OMPMA.cy.js`, `OMPAO.cy.js` and `OMPKS.cy.js`.

### Task 70 mapping at baseline `3277a93b`

| Cypress block | Playwright coverage |
| --- | --- |
| 14–16: Open journalpost from the real route | `velger ordinær og reservert OMPMA-sak og fjerner foreldede detaljer` enters `/journalpost/304`; `openJournalpost` verifies the pathname, MSW response status `201` and complete `jpOMPMA304` fixture. It also checks the automatically selected OMPMA subtype before any input. |
| 18–20: Hide the document | The same journey verifies the PDF is visible, clicks **Skjul** and verifies the PDF is hidden. |
| 22–31: Initial journalpost panel | The same journey checks journalpost number, applicant ID and OMPMA case type before applicant confirmation. |
| 33–39: Document choices | The same journey checks the **Dette gjelder:** heading and the four visible choices: Pleiepenger sykt barn, Omsorgspenger/omsorgsdager, Pleiepenger i livets sluttfase and Annet. |
| 41–44: Selected OMPMA subtype | `openJournalpost` asserts the OMPMA subtype is checked immediately after loading the journalpost, without selecting the parent or subtype in test setup. |
| 46–48: Two-applicant checkbox | The same journey checks that the paper two-applicant checkbox is visible before applicant confirmation. |
| 50–53: Initially disabled journal actions | The same journey checks that both **Journalfør og fortsett** and **Journalfør og vent** are disabled before applicant confirmation. |
| 55–80: Confirm applicant and select ordinary case | The same journey verifies the applicant-scoped lookup response, selected ordinary case ID, related-person name and ID, K9 link, journalpost-panel case and related-person ID, manual-input absence, and enabled actions. |
| 82–103: Select reserved case | The same journey verifies the reserved case ID and related-person details, absence of the K9 link, removal of ordinary-case details, and enabled actions. |

Task 70 removed only `OMPMA.cy.js` after the two required Playwright specs passed. Shared fixtures and Cypress utilities remain unchanged. The configured Cypress pattern now matches exactly `OMPAO.cy.js` and `OMPKS.cy.js`.

## OMPMA form saving and submission

`ompma-punch-form.spec.ts` replaces the abandoned checks in `cypress/e2e/omsorgspenger-midlertidig-alene/omsorgspengerMidlertidigAlene.cy.js`. The former Cypress file was commented out. B46's `ompma-existing-applications.spec.ts` continues to cover the journalpost and application-list journeys.

| Legacy Cypress check | Playwright coverage |
| --- | --- |
| Journalpost and applicant details | B46 checks the journalpost panel and selected case while listing, resuming, creating and returning. |
| Empty-list information | No longer describes the UI: an empty lookup automatically creates a draft. B46 verifies the lookup, create request, returned DTO and form GET. |
| Resume an existing application | B46 verifies compatible and incompatible applications, cancels and resumes by application ID, and checks loaded form values. |
| Return to Fordeling | B46 uses **Tilbake** and verifies the registration choice without writes or a draft GET. |
| Start a new registration | B46 checks manual creation from a nonempty list and automatic creation from an empty list. |
| Required fields, other-parent situation, description and period | B47 checks the four current required-field errors and confirms client validation makes no `/valider` or `/send` request. |
| Backend validation error and retained inputs | B47 returns the existing OMPMA `SøknadFeil` shape (`feil` / `generiskFeil`), checks visible feedback and retained values, and verifies there is no send. |
| Medical-information checkbox and successful submission | B47 verifies the registered child, other parent, journalpost and medical-information flag in the saved DTO and K9 receipt; it checks saved and validated domain values agree, reviews the summary, confirms, sends once and checks the completion receipt and **Tilbake til LOS**. |
| Do not offer a new registration for a listed current journalpost | B46 verifies **Start ny registrering** is absent when the current journalpost is listed. |

The signature choice **Ikke relevant** is exercised as in the old scenario, but it is not part of the OMPMA application DTO or K9 receipt.

## Korrigering IM form saving and submission

`korrigering-im-punch-form.spec.ts` replaces both commented scenarios in `cypress/e2e/korrigeringAvInntektsmelding/KorrigeringAvInntektsmeldingPunsj.cy.js`. The tests enter through the journalpost UI and install page-local MSW handlers before classification and application requests.

| Legacy check | Playwright coverage |
| --- | --- |
| Submit a correction with received date/time, treatment year, employer and a withdrawal period | `lagrer, validerer, bekrefter og sender korrigering av inntektsmelding` verifies classification and draft IDs, year-based employer and employment lookups, exact save and validation bodies, expanded K9 absence days, review, one confirmed send and the completion receipt. |
| Show the required-absence error without a withdrawal period or claim | `viser backendvalidering når fraværsperioder mangler uten å sende` verifies that the frontend sends validation with an empty period list, displays the backend's 400 `SøknadFeil`, and does not send. The form has no client-side absence guard. |
| No legacy scenario: recover after a backend validation error | `beholder verdiene og kan prøve valideringen på nytt etter backendfeil` verifies retained inputs, no send on 400 and a successful retry to review. A known production issue can make the first click issue duplicate validation requests through the click handler and `FormChangeObserver` when `hasSubmitted` changes. The test does not assert request counts: scenario-local MSW returns 400 during the initial attempt and switches to 202 immediately before the explicit retry. |

These are frontend contract tests with MSW; they do not exercise backend persistence. Save uses `PUT /omsorgspenger-soknad/oppdater` (200), validation uses `POST /omsorgspenger-soknad/valider` (202 K9 DTO or 400 `SøknadFeil`), and send uses `POST /omsorgspenger-soknad/send` (202 K9 DTO). The send mock builds its receipt from the last successful save, not the validation request.

The same spec covers ordinary and reserved Fordeling cases from `cypress/e2e/fordeling/KorrigeringIM.cy.js`, lines 56–234 at commit `8d83f000`, using the existing synthetic cases and page-local MSW:

| Cypress assertions | Playwright coverage |
| --- | --- |
| Ordinary case selection, lines 56–84 | The existing form journey checks the selected case, treatment year, visible K9 link containing the case ID, journalpost panel and enabled Fortsett/Vent actions before continuing through classification and form opening. |
| Ordinary Fortsett and Vent modals, lines 85–145 | The form journey checks and cancels Fortsett before reopening it to continue. The focused Vent test checks and cancels Vent without executing it. |
| Reserved case selection and both modals, lines 146–234 | The reserved-case test checks the selected case, treatment year, absent K9 link, journalpost panel and enabled actions, then opens and cancels Fortsett and Vent. |

All four modal variants check the heading, case type, applicant, case number, period, immutable-information warning, absent LOS action and enabled confirm/cancel buttons. Cancellation retains the selected case and available actions on Fordeling without classification, treatment-year, hold or application writes.

The four Cypress blocks that open and cancel Fortsett and Vent for ordinary and reserved cases were removed first. Both case-selection blocks remained until the [remaining Korrigering IM Fordeling checks](#remaining-korrigering-im-fordeling-checks) below.

The same spec also replaces these checks from `cypress/e2e/fordeling/KorrigeringIM.cy.js` at commit `aeb6a424`:

| Cypress assertions | Playwright coverage |
| --- | --- |
| Reservation and year gating, lines 113–140 | Selecting a reserved case and reserving a new one clears its number and selection. Both actions are disabled before choosing a year and for an occupied year; a free year shows the no-case notice and enables both actions. MSW case years and selectable years are controlled without fixed calendar years. |
| No-case Fortsett and Vent modals, lines 142–200 | Both dialogs show the heading, case type, applicant and irreversible-information warning, omit case number, period and LOS action, and have enabled confirmation and cancel buttons with distinct confirmation labels. Cancelling returns to Fordeling with the selected year and sends no classification, year, hold or application writes. |
| Empty case lookup, lines 284–313 | A page-local, applicant-scoped MSW response returns 200 and an empty list. The case selector is absent, the year selector is visible, and both actions change from disabled to enabled with the no-case notice after selecting a free year. |

The replaced modal blocks and empty-lookup describe, including its MSW setup, were removed.

The applicant-switch journey replaces the following blocks from `cypress/e2e/fordeling/KorrigeringIM.cy.js` at commit `8b33117b`:

| Cypress block | Playwright coverage |
| --- | --- |
| 109: Prepare a new case | Selects the original applicant's case, reserves a new case and chooses a free year from the UI. |
| 119: Reset applicant | Choosing Nei removes the case and reservation controls and disables Fortsett and Vent. |
| 127: New applicant | An applicant-scoped MSW lookup returns a different case; the panel shows the new ID, reservation remains checked, case selection is disabled and both actions are enabled. The previously selected free year remains selected and is free for both applicants. |
| 142 and 171: Fortsett and Vent without a case | Both dialogs verify the new applicant, case type, headings, warning, absent case number, period and LOS action, and enabled buttons with distinct action labels. Cancelling returns to Fordeling without API writes. |

The four replaced checks and their preparation block were removed from Cypress; the initial, ordinary and reserved case-selection checks remained until the [remaining Korrigering IM Fordeling checks](#remaining-korrigering-im-fordeling-checks) below. The lookup and cancellation checks exercise the frontend with page-local MSW, not backend persistence.

The two-applicant journey replaces the separate describe in `cypress/e2e/fordeling/KorrigeringIM.cy.js` at commit `b98f337a`:

| Cypress block | Playwright coverage |
| --- | --- |
| 110: Open journalpost | Opens the same paper journalpost and selects the correction document through Fordeling. |
| 117: Two applicants and new case | Confirms the primary applicant, checks information and missing-applicant warning, then verifies the second applicant lookup, missing-year warning and disabled actions. Reserving a new case and selecting a free year clears the warning and enables both actions with the no-case notice. Case years and person lookup are controlled by page-local MSW. |
| 145 and 174: Fortsett and Vent modals | Each checks the primary applicant, case type, absent case number and period, warning, heading, confirm label, enabled buttons and absent LOS action. Cancellation retains both applicants and the selected year without classification, hold, copy, year or application writes. The Vent title mentions a child, but its assertions do not select one. |

The replaced two-applicant describe was removed after Playwright passed. The test verifies frontend behavior, not backend persistence; neither action is executed.

### Remaining Korrigering IM Fordeling checks

The seven remaining blocks in `cypress/e2e/fordeling/KorrigeringIM.cy.js` at baseline `8a268483` are now replaced. The spec was removed only after both affected Playwright specs passed (21 tests). Shared fixtures and other Cypress specs are unchanged.

| Cypress block at `8a268483` | Exact Playwright coverage |
| --- | --- |
| 13: Open paper journalpost and select correction | `korrigering-im-punch-form.spec.ts`, `avbryter Fortsett og Vent for korrigering av inntektsmelding med to søkere og ny sak`: opens `jpOMPUT305` through `/journalpost/:id`, checks the 201 MSW response and full fixture, asserts the PDF is visible, clicks **Skjul** and asserts it is hidden, then checks the correction radio is selected. `fordeling-entry.spec.ts`, `viser underalternativer og velger korrigering av inntektsmelding`, also checks the correction suboption appears after selecting Omsorgspenger and becomes checked. |
| 19: Journalpost summary | The same paper journey checks visible labels **Journalpostnummer:**, **Søkers ID:** and **Sakstype:** with their exact fixture values and **Omsorgspenger** in each field, before confirming the applicant. |
| 30: Four document categories | The same paper journey checks the **Dette gjelder:** heading and visible radios **Pleiepenger sykt barn**, **Omsorgspenger/omsorgsdager**, **Pleiepenger i livets sluttfase** and **Annet**. |
| 38: Two-applicant checkbox | The same paper journey checks **Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)** is visible and unchecked before confirming the applicant, then exercises it later. |
| 42: Initially disabled actions | The same paper journey calls `expectFordelingActions(page, false)` before checking **Ja**, asserting both Fortsett and Vent are disabled. |
| 47: Confirm applicant and select ordinary case | `korrigering-im-punch-form.spec.ts`, `avbryter Vent for ordinær sak i fordeling av korrigering av inntektsmelding`: `openCorrectionFordeling` checks the applicant-scoped lookup, 200 MSW response and exact case list; `expectSelectedCase` asserts the selected ordinary case ID, treatment year, visible K9 link whose href contains that ID, exact summary fields including case number, and both enabled actions. |
| 76: Select reserved case | `korrigering-im-punch-form.spec.ts`, `viser reservert sak og avbryter Fortsett og Vent i fordeling av korrigering av inntektsmelding`: the same lookup checks and `expectSelectedCase` assert the reserved case ID, treatment year, no K9 link, exact summary fields including case number, and both enabled actions. |

## OMPUT existing applications

`omput-existing-applications.spec.ts` replaces the active journalpost-panel check and five commented checks in `cypress/e2e/omsorgspenger-utbetaling/eksisterendeSoeknader.cy.js`. The four Playwright journeys passed before the Cypress spec was removed; seven Cypress specifications remain, down from eight.

| Cypress check | Playwright coverage |
| --- | --- |
| Active: journalpost and applicant panel values | All four journeys verify the panel through journalpost classification and the registration-choice screen, including the selected case. |
| Commented: empty-list information | The old manual-click expectation is obsolete: an empty lookup automatically creates an application. `oppretter OMPUT-søknad automatisk når listen er tom` verifies lookup-before-create order, the exact create payload, returned ID, form GET and visible form. |
| Commented: continue an existing application | `viser eksisterende OMPUT-søknader, avbryter og fortsetter på en kompatibel søknad` checks the list columns and case compatibility, cancels without fetching the application, then resumes by ID without creating, validating or submitting. The same journey checks the legacy metadata case fallback. |
| Commented: back to Fordeling | `går tilbake fra OMPUT-søknadslisten uten å opprette en søknad` uses the application's **Tilbake** button and verifies the preceding registration-choice screen without writes or a selected-application GET. |
| Commented: start a new registration | `starter manuell OMPUT-registrering fra en liste med eksisterende søknader` verifies the exact create payload, 201 DTO, form GET and visible form. It also checks that the informational text agrees with the available button. |
| Commented: hide new registration when the current journalpost is listed | The resume journey verifies that **Start ny registrering** is absent when a listed application includes the current journalpost. |

OMPUT has no child column or child-based row gate. The list still emits the existing React missing-key warning for its confirmation modals; this migration does not change production code or suppress the warning. The MSW responses verify frontend behavior, not backend persistence.

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
| B50: Autosave failure and recovery | `beholder OMPUT-endringer ved lagringsfeil og lagrer dem ved neste endring` verifies a matching PUT fails with 500 without changing the saved draft, then a later user edit triggers a successful PUT that retains both edits. |
| B52: Confirmed-send failure and retry | `sender inn OMPUT-søknaden på nytt etter midlertidig sendefeil` verifies the first confirmed POST fails with 500 after the normal save/validation path, then a user-triggered retry completes with 202 and the meaningful receipt. |

The two startup fixtures use matching route, application, save, validation and submit IDs. The correction fixture returns the existing September periods before the form is used. Each test has its own page and local mutation handlers; the test does not call the backend. The submission response is checked separately from the validation receipt retained by the OMPUT container.

The B50 journey first saves the completed employee form, then returns 500 only for the selected application ID and edited absence value. It checks the visible save error, retained form values, no submission, and an MSW GET readback proving the failed edit was not persisted. A later user edit triggers the next matching PUT, which returns 200; the error clears, **Lagret** appears, and the saved DTO contains both edits. The MSW state is local to this test. The API throws on non-OK PUT responses and the existing mutation renders the save error; no production gap was found. This verifies frontend behavior, not backend persistence.

The B52 journey uses a local MSW handler matched by applicant and application ID. It keeps the initial preview validation and each confirmation-triggered save/validation response separate from the send result. After the first confirmed send returns a backend-shaped 500, the real form error remains visible with entered values and no completion receipt. The user starts submission again through the form, reviews and confirms it, and the second 202 send uses the same path, applicant header and exact body. Its completion receipt contains the submitted absence period; no production code or shared mock is changed.

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

## Fordeling OMPUT-saksvalg og modalavbrudd

`fordeling-omput-case-selection.spec.ts` erstatter de fire modalblokkene i `cypress/e2e/fordeling/OMPUT.cy.js` ved baseline `d8029a32`. Reisen går gjennom journalposten og direkte OMPUT-undertype, og installerer lokale MSW-svar for ordinær og reservert sak før oppslaget.

| Baselineblokk | Playwright-dekning |
| --- | --- |
| 56–82: Bekreft søker og velg ordinær sak | `velger ordinær og reservert OMPUT-sak uten foreldede detaljer` sjekker valgt ID, behandlingsår, journalpostpanel, aktive handlinger og K9-lenke med ordinær ID. |
| 85–113: Ordinær sak, Fortsett | `avbryter Fortsett for ordinær OMPUT-sak` kontrollerer Fortsett-overskrift og bekreftelsesetikett, sakstype, søker, saksnummer, periode, advarsel, fravær av LOS, aktive knapper og lukket modal etter avbrudd. Valgt sak og handlinger består uten skriving. |
| 115–144: Ordinær sak, Vent | `avbryter Vent for ordinær OMPUT-sak` kontrollerer Vent-overskrift og bekreftelsesetikett, tilsvarende saksoppsummering, advarsel, fravær av LOS, aktive knapper og lukket modal etter avbrudd. Valgt sak og handlinger består uten skriving. |
| 147–173: Velg reservert sak | Valgreisen velger reservert ID etter ordinær sak og kontrollerer behandlingsår, panel, aktive handlinger, fravær av K9-lenke og at ordinære saksdetaljer er borte. |
| 174–202: Reservert sak, Fortsett | `avbryter Fortsett for reservert OMPUT-sak` kontrollerer Fortsett-overskrift og bekreftelsesetikett, reservert saksoppsummering, advarsel, fravær av LOS, aktive knapper og lukket modal etter avbrudd. Valgt sak og handlinger består uten klassifisering, Vent, behandlingsår- eller søknadsskriving. |
| 204–233: Reservert sak, Vent | `avbryter Vent for reservert OMPUT-sak` kontrollerer Vent-overskrift og bekreftelsesetikett, tilsvarende saksoppsummering, advarsel, fravær av LOS, aktive knapper og lukket modal etter avbrudd. Valgt sak og handlinger består uten klassifisering, Vent, behandlingsår- eller søknadsskriving. |

De to Cypress-valgblokkene og alle kontroller for åpning, søkerbytte og to søkere er beholdt. Ny-sak-blokken beholder bare reservasjon og valg av et ledig tilgjengelig år som stateful oppsett for søkerresetten. Playwright avbryter de fire sak-modalene; den utfører ikke bekreftelseshandlingene. MSW dekker frontendflyten, ikke backendens faktiske skriving.

### Ny sak og tomt saksoppslag (baseline `aa9c39a3`)

Playwright erstatter ny-sak-årskontrollen, begge avbrutte modalene uten fagsak og tomt OMPUT-oppslag. De eksisterende saksvalgsreisene og øvrige Cypress-kontroller er fortsatt beholdt i `cypress/e2e/fordeling/OMPUT.cy.js`.

| Cypress-blokk ved `aa9c39a3` | Playwright-dekning |
| --- | --- |
| 113–140: Reserver ny sak og velg behandlingsår | `reserverer ny OMPUT-sak med ledig behandlingsår` starter med valgt reservert sak, sjekker at saksnummeret fjernes og handlingene er deaktivert uten år. Et tilgjengelig år med fagsak viser konflikt og holder handlingene deaktivert; et ledig tilgjengelig år viser meldingen om reservasjon og aktiverer handlingene. Fixture-år følger nettleserens inneværende år. |
| 142–200: Avbryt Fortsett- og Vent-modal uten fagsak | `avbryter Fortsett og Vent for ny OMPUT-sak uten fagsak` kontrollerer hvert sitt modalhode og bekreftelsesetikett, Omsorgspenger og søker, fravær av saksnummer/periode og LOS, irreversibilitetsvarsel og aktive knapper. Avbryt lukker modalene, beholder valgt år og handlinger og sender ingen klassifiserings-, Vent-, behandlingsår- eller søknadsskriving. |
| 284–313: Tomt fagsaksoppslag | `fordeling-entry.spec.ts`, `viser tomt fagsaksoppslag og behandlingsår for direkte utbetaling` beholder kontroll av søkeravgrenset 200-svar med `[]`, ingen saksvelger og synlig årskontroll. Handlingene er først deaktivert, og blir aktive med reservasjonsteksten etter valg av et faktisk tilgjengelig år. |

Søkerresetten i Playwright er en isolert reise som selv velger reservert sak, reserverer ny sak og velger et ledig år. Dermed er det stateful Cypress-oppsettet og de fire etterfølgende søkerbytte-/modalblokkene fjernet. Oppstart, ordinært og reservert saksvalg, samt den separate to-søker-reisen er beholdt.

### OMPUT med to søkere (baseline `376fbc18`)

`fordeling-omput-case-selection.spec.ts`, `avbryter Fortsett og Vent med to OMPUT-søkere og ny sak`, erstatter de fire blokkene i `Fordeling Omsorgspenger 2 søkere i journalpost`. Reisen åpner journalposten og direkte OMPUT-undertype gjennom UI-et. Saksoppslagene bruker lokale, søkeravgrensede MSW-svar med behandlingsår fra inneværende år; testen velger deretter et ledig år fra kontrollene i UI-et.

| Cypress-blokk ved `376fbc18` | Playwright-dekning |
| --- | --- |
| 112–117: Åpne journalpost og velg OMPUT | Journalpost og subtype velges gjennom UI-et. Testen kontrollerer at PDF-en vises, og at **Skjul** skjuler den. |
| 119–145: To søkere og årsgating | Bekrefter primærsøker med et kontrollert fagsaksoppslag, slår på papirvalget og sjekker informasjonen og varselet om manglende søker nummer to. Et lokalt personoppslag for søker nummer to kontrollerer ident-header, 200-svar, responsinnhold, beholdt ident og at varselet forsvinner. Manglende behandlingsår holder Fortsett og Vent deaktivert. Reservasjon og et ledig UI-år fjerner årvarselet, viser meldingen om ny sak og aktiverer handlingene. |
| 147–174: Avbryt Fortsett | Kontrollerer overskrift, Omsorgspenger, primærsøker, fravær av saksnummer og periode, irreversibilitetsvarsel, fravær av LOS og aktive bekreftelses- og avbrytknapper. Avbryt lukker dialogen og beholder begge søker-ID-er, papirvalget, reservasjonen, året og aktive handlinger uten skriving. |
| 176–203: Avbryt Vent | Kontrollerer den separate Vent-overskriften og bekreftelsesetiketten, samme saksoppsummering og advarsel. Avbryt lukker dialogen og beholder valgene uten klassifiserings-, Vent-, behandlingsår-, kopierings- eller søknadsskriving. |

Dette er bare gating og avbrudd; testen bekrefter ingen handling. Klassifisering og kopiering for to søkere er fortsatt dekket av `fordeling-entry.spec.ts`: `journalfører fosterbarn og kopierer til søker nummer to` og `journalfører uten fosterbarn og kopierer til søker nummer to`. Disse eksisterende reisene fortsetter å utføre og kontrollere klassifisering og kopiering, uten å bli gjentatt her.

### OMPUT søkerbytte (baseline `dd0431cc`)

`nullstiller OMPUT-valg og avbryter begge modalene for ny søker` starter med valgt reservert sak, reserverer et nytt saksnummer og velger et ledig år fra de tilgjengelige valgene. Etter Nei installerer testen et lokalt, søkeravgrenset MSW-svar for den nye søkeren og kontrollerer status, service worker og faktisk svarinnhold.

| Cypress-blokk ved `dd0431cc` | Playwright-dekning |
| --- | --- |
| 111–121: Reserver saksnummer og velg første ledige år som stateful oppsett | Den isolerte Playwright-reisen velger først reservert sak, reserverer nytt saksnummer og velger ledig år fra UI-valgene. Begge handlingene er aktive før Nei. Dette oppsettet er ikke lenger nødvendig i Cypress. |
| 123–129: Avbekreft søker og nullstill | Samme reise klikker Nei og kontrollerer at saksvelger og reservasjon mangler, og at Fortsett og Vent er deaktivert. |
| 131–144: Bytt søker | Kontrollerer 200-svar avgrenset til ny søkerident, svar fra service worker og den faktiske responsen med ny søkers reserverte OMPUT-sak. Panelet viser ny søker uten gammel identitet eller saksnummer; saksvelger er deaktivert, reservasjon og ledig år beholdes, og varsel samt handlinger vises. |
| 146–173: Avbryt Fortsett for ny søker uten fagsak | Kontrollerer Fortsett-overskrift og bekreftelsesetikett, Omsorgspenger og ny søker, fravær av saksnummer/periode og LOS, irreversibilitetsvarsel og aktive knapper. Avbryt lukker modalvinduet og beholder søker, år, reservasjon og handlinger uten mutasjoner. |
| 175–203: Avbryt Vent for ny søker uten fagsak | Kontrollerer tilsvarende Vent-overskrift og «Journalfør og sett på vent», resten av sammendraget og aktive knapper. Avbryt lukker modalvinduet og beholder ny søker uten klassifiserings-, Vent-, behandlingsår- eller søknadsskriving. |

Bare disse fire Cypress-blokkene og det ubrukte reservasjon/år-oppsettet er fjernet. Begge saksvalgsblokkene og den separate to-søker-reisen er urørt.

### Fullført opprydding av OMPUT-Cypress (baseline `a09000b8`)

De sju gjenværende blokkene i `cypress/e2e/fordeling/OMPUT.cy.js` er erstattet av de eksisterende Playwright-reisene. Papirreisen kontrollerer 201-svaret fra MSW mot hele `jpOMPUT305`-fixturen, URL-ens `pathname`, skjuling av PDF-en og OMPUT-undertypen. Cypress-filen ble slettet etter at de to berørte Playwright-spesifikasjonene bestod med 21 tester.

| Cypress-blokk ved `a09000b8` | Playwright-dekning |
| --- | --- |
| 13–17: Åpne journalpost, skjul PDF og velg dokumenttype | `fordeling-omput-case-selection.spec.ts`, `avbryter Fortsett og Vent med to OMPUT-søkere og ny sak`: `openJournalpost` åpner journalposten, kontrollerer 201, service worker og hele fixturen, sjekker URL-ens `pathname`, velger OMPUT-undertype og kontrollerer synlig/skjult PDF. |
| 19–28: Journalpostpanel | Samme reise kontrollerer journalpostnummer, søker-ID og sakstype med eksakte fixturverdier før søkerbekreftelse. |
| 30–36: Dokumentvalg | Samme reise kontrollerer overskriften **Dette gjelder:** og de fire synlige valgene: Pleiepenger sykt barn, Omsorgspenger/omsorgsdager, Pleiepenger i livets sluttfase og Annet. |
| 38–40: Checkbox for to søkere | Samme reise kontrollerer at checkboxen er synlig før søkerbekreftelse. |
| 42–45: Deaktiverte handlinger ved start | Samme reise kontrollerer at Fortsett og Vent er deaktivert før søkerbekreftelse. |
| 47–74: Bekreft søker og velg ordinær sak | `fordeling-omput-case-selection.spec.ts`, `velger ordinær og reservert OMPUT-sak uten foreldede detaljer`: det lokale oppslaget kontrollerer 200, søkerheader og den konkrete saklisten. Valgt ID, behandlingsår, journalpostpanel, K9-lenke med saks-ID og aktive handlinger kontrolleres. |
| 76–102: Velg reservert sak | Samme valgreise kontrollerer reservert ID, behandlingsår, panel og aktive handlinger, fravær av K9-lenke og at ordinære saksdetaljer er fjernet. |

`OMPUT.cy.js` er slettet etter at alle sju blokkene er mappet. Delt fixtures og de øvrige Cypress-spesifikasjonene er beholdt. De gjenværende `OMP*.cy.js`-spesifikasjonene i `cypress/e2e/fordeling/` er `OMPAO.cy.js` og `OMPKS.cy.js`.

## Fordeling OMPAO-saksvalg og modalavbrudd

`fordeling-ompao-case-selection.spec.ts` åpner `jpOMPAO303` gjennom journalposten, kontrollerer 201-svar fra MSW mot hele fixturen, URL-ens `pathname` og valgt OMPAO-undertype. Før oppslaget installerer reisen et søkeravgrenset MSW-svar med de fire eksisterende sakene fra `fagsaker.json[14]`–`[17]`.

| Cypress-blokk ved baseline `205ce67c` | Playwright-dekning |
| --- | --- |
| 70–91: Bekreft søker og velg ordinær sak uten barn | `velger OMPAO-saker med og uten barn og fjerner foreldede detaljer` kontrollerer 200-svaret, søkerheaderen, saklisten, valgt ID, «Barn: ikke satt», K9-lenke med ordinær ID, journalpostpanel uten barnets ID og deaktivert Fortsett/aktivert Vent. |
| 93–124: Avbryt Vent for ordinær sak uten barn | `avbryter Vent for ordinær OMPAO-sak uten barn` kontrollerer Vent-overskrift og bekreftelsesetikett, OMPAO-type, søker, saksnummer, periode, fravær av barn og LOS, irreversibilitetsvarsel og aktive knapper. Avbryt lukker modalvinduet og beholder sak og handlingsgating uten skriving. |
| 125–147: Velg ordinær sak med barn | Valgreisen kontrollerer valgt ID, barnets navn og ID, K9-lenke, journalpostpanel med saksnummer og barnets ID, samt aktive Fortsett- og Vent-knapper. |
| 149–180: Avbryt Fortsett for ordinær sak med barn | `avbryter Fortsett for ordinær OMPAO-sak med barn` kontrollerer Fortsett-overskrift og bekreftelsesetikett, OMPAO-type, søker, saksnummer, periode og barnets ID, advarsel, fravær av LOS og aktive knapper. Avbryt beholder valgt sak og handlinger uten skriving. |
| 181–212: Avbryt Vent for ordinær sak med barn | `avbryter Vent for ordinær OMPAO-sak med barn` kontrollerer Vent-overskrift og bekreftelsesetikett med samme saksoppsummering. Avbryt lukker modalvinduet og beholder valgt sak og handlinger uten skriving. |
| 213–234: Velg reservert sak med barn | Valgreisen kontrollerer reservert ID, barnets navn og ID, fravær av K9-lenke, journalpostpanel og aktive handlinger; ordinære saksdetaljer fjernes. |
| 236–267: Avbryt Fortsett for reservert sak med barn | `avbryter Fortsett for reservert OMPAO-sak med barn` kontrollerer Fortsett-overskrift og bekreftelsesetikett, OMPAO-type, søker, saksnummer, periode og barnets ID, advarsel, fravær av LOS og aktive knapper. Avbryt beholder valgt sak og handlinger uten skriving. |
| 268–299: Avbryt Vent for reservert sak med barn | `avbryter Vent for reservert OMPAO-sak med barn` kontrollerer Vent-overskrift og bekreftelsesetikett med samme saksoppsummering. Avbryt lukker modalvinduet og beholder valgt sak og handlinger uten skriving. |
| 300–319: Velg reservert sak uten barn | Valgreisen kontrollerer «Barn: ikke satt», fravær av K9-lenke og barnets ID i panelet, deaktivert Fortsett og aktivert Vent. Overgangen fra reservert sak med barn fjerner barnedetaljene. |
| 321–351: Avbryt Vent for reservert sak uten barn | `avbryter Vent for reservert OMPAO-sak uten barn` kontrollerer Vent-overskrift og bekreftelsesetikett, OMPAO-type, søker, saksnummer, periode, fravær av barn og LOS, advarsel og aktive knapper. Avbryt beholder valgt sak og handlingsgating uten skriving. |

Barnesakene i `fagsaker.json[15]` og `[16]` har samme navn og identitetsnummer; testen leser barnedata fra hver sak separat. Den nye reisen avbryter alle seks modalene og verifiserer fravær av klassifisering, Vent, kopiering, behandlingsår og søknadsskriving. Bare modalblokkene er fjernet fra `OMPAO.cy.js`. De fire saksvalgsblokkene og alt øvrig stateful oppsett, inkludert ny sak, barn fra liste, manglende ID, søkerbytte, tomt oppslag og to søkere, er beholdt. De eksisterende OMPAO-applikasjons- og skjema-spesifikasjonene er uendret.

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
