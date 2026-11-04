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

Both Playwright journeys use existing applicant `08438323288` and complete case `1DQBDDC` from `cypress/fixtures/fagsaker.json` (PSB, not reserved, child `24420167209`, period `2024-04-15`–`2024-04-15`). A test-only MSW override returns only `{ journalpostId: "920001" }` from creation. Before opening the result, the successful journey installs an exact-ID GET override with completed status `FERDIGSTILT`, `erFerdigstilt: true`, and populated case data. The generic handler, shared journalpost `200`, and shared fixtures remain unchanged.

These overrides are installed only in each test's browser context. Opening the destination URL separately does not install this scenario; use the test's Playwright UI snapshot to review the completed screen.

The first journey reads the created ID from the POST response, checks that **Gå til journalpost** replaces the create button, observes the exact GET response, and waits for `/journalpost/920001/pleiepenger-sykt-barn/` (document query parameters and trailing-slash normalization are harmless). The loaded screen must show **Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.**, both handling choices, **Sett på vent**, and the matching journalpost number. It stops before choosing a handling action or registering an application. The retry journey checks retained values and the available create button after failure, then the success/button transition after retry, without navigating again.

To review the first journey in browser-accessible Playwright UI:

```sh
yarn test:pw:ui e2e/tests/opprett-journalpost.spec.ts --ui-host=127.0.0.1 --ui-port=9323
```

Open `http://127.0.0.1:9323`, run the tests, select **oppretter journalpost fra hovedsiden og åpner den opprettede journalposten**, and select its final **Expect "toBeVisible"** action and **After** snapshot. Expect the completed screen described above with **Journalpostnummer: 920001**. Reuse an already running UI instead of starting another on the same ports.

Storybook runs at `http://localhost:6006`. On a fresh browser origin, open the Storybook root first, wait for the preview to load, then choose a story from the sidebar. The MSW service worker may not control the preview iframe if an API-backed story is opened directly on the first visit.

The eight stories use synthetic data: fnr `08438323288`, ordinary cases `ABC123` and `DEF456`, historical case `HIST001`, and in-memory creation result `200`. Storybook navigation only updates a location display; it does **not** render the full application destination verified by Playwright. The API calls are handled by Storybook MSW; no backend is needed. The 14 component tests and two Playwright journeys are independent of the story count.

The component's `msw.handlers` defaults provide named `lookup` and `creation` groups. Each exceptional story overrides only its affected group; Storybook merges these objects by key, whereas handler arrays replace inherited arrays. The addon resets handlers when switching stories. Run `yarn exec msw init` to update both configured worker directories, `src/mocks` and `.storybook/public`, from the installed MSW version.

| Story | Link |
|---|---|
| Tomt skjema | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--tomt-skjema) |
| Henter fagsaker | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--henter-fagsaker) |
| Fagsaker funnet uten historisk tilgang | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--fagsaker-funnet) |
| Historisk fagsak med tilgang | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--historisk-med-tilgang) |
| Ingen fagsaker | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--ingen-fagsaker) |
| Feil ved henting med nytt forsøk | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--henting-feiler-med-ny-forsøk) |
| Feil ved oppretting med nytt forsøk | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--opprettelse-feiler-med-nytt-forsøk) |
| Opprettelse vellykket | [Open story](http://localhost:6006/?path=/story/components-opprettjournalpost--opprettelse-vellykket) |

Manual click-through:

1. **Tomt skjema** starts without an applicant. Enter `08438323288`, select `ABC123`, enter a title and note (at least three characters each), then choose **Opprett journalpost**. Expect ID `200` and **Gå til journalpost** instead of the create button. Choose it and expect `Gjeldende adresse: /journalpost/200`.
2. **Fagsaker funnet uten historisk tilgang** enters the synthetic fnr and loads cases, with `HIST001` disabled. Wait for the story interaction to finish, select `ABC123`, enter a title and note (at least three characters each), then choose **Opprett journalpost**. Expect ID `200`; choose **Gå til journalpost** and expect the visible location display to show `Gjeldende adresse: /journalpost/200`. **Historisk fagsak med tilgang** uses the same case data and lookup/creation mocks, but permits selecting `HIST001`; complete the same flow with that case. Navigation stays in memory in both variants, and each story gets a fresh store.
3. **Ingen fagsaker** enters the same fnr. Expect the no-cases message and no selectable case.
4. **Feil ved henting med nytt forsøk** starts with a failed lookup. Choose **Hent fagsaker på nytt**, select `ABC123`, enter a title and note, then create successfully and use **Gå til journalpost**. Expect ID `200` and the in-memory location `/journalpost/200`.
5. **Feil ved oppretting med nytt forsøk** submits the prefilled form once. Expect an error with the entered values retained; submit again and expect ID `200`.
6. Fill a case, title and note in either access variant, then switch to the other. In both directions expect no selected case, empty title/note and `/opprett-journalpost` in the location display; ordinary cases remain selectable, while `HIST001` is enabled only in **Historisk fagsak med tilgang**. Switch from each failure story to **Tomt skjema** or **Fagsaker funnet uten historisk tilgang** and complete creation to check that failure handlers do not leak. Return to each failure story and expect its initial failure again. The story IDs/URLs are unchanged; there are still eight stories.
7. In **Henter fagsaker**, expect the disabled Aksel select with the loader immediately to its right, vertically centred on the control rather than its label. Its accessible description is **Henter fagsaker**. The loader slot remains reserved when switching back to a non-loading story, so the control and fields below do not shift.

Playwright and Cypress share port 8080 with local development. Stop the server you started before running either suite if that port is occupied.
