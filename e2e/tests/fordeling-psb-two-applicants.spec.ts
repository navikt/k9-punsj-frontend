import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpostFixture from '../../cypress/fixtures/jpPSB300.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';
import { FORDELING_PSB_SCENARIOS } from '../../src/mocks/fordelingPsbTestScenarioIds';

const JOURNALPOST_ID = FORDELING_PSB_SCENARIOS.twoApplicants;
const KOPIERT_JOURNALPOST_ID = '9303171';
const KOPIERT_SAKSNUMMER = 'KOPI123';
const SØKER_ID = journalpostFixture.norskIdent;
const ANNEN_SØKER_ID = '02918496664';
const FAGSAK = fagsaker[2];
const BARN = FAGSAK.pleietrengende!;
const journalpostPath = (id: string) => ApiPath.JOURNALPOST_GET.replace('{journalpostId}', id);
const copyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', JOURNALPOST_ID);

type NetworkEvent = {
    kind: 'request' | 'response';
    method: string;
    path: string;
    status?: number;
};

const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const installScenarioHandlers = async (page: Page) => {
    await page.evaluate(
        ({ path, personPath, applicant }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            const copyPending = new Promise<void>((resolve) => {
                (window as Window & { releasePsbCopy?: () => void }).releasePsbCopy = resolve;
            });
            msw.worker.use(
                msw.http.post(path, async () => {
                    await copyPending;
                }),
                msw.http.get(personPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicant) return;
                    return msw.HttpResponse.json({
                        etternavn: 'KAKE',
                        fornavn: 'TUNGSINDIG',
                        fødselsdato: '1981-12-18',
                        identitetsnummer: applicant,
                        mellomnavn: null,
                        sammensattNavn: 'TUNGSINDIG KAKE',
                    });
                }),
            );
        },
        { path: copyPath, personPath: ApiPath.PERSON, applicant: ANNEN_SØKER_ID },
    );
};

test('journalfører PSB og kopierer til annen søker før originalen behandles videre', async ({ page }) => {
    const events: NetworkEvent[] = [];
    const mutations: string[] = [];
    const closedPaths = [ApiPath.JOURNALPOST_LUKK_OPPGAVE, ApiPath.JOURNALPOST_LUKK_DEBUGG].map((path) =>
        path.replace('{journalpostId}', JOURNALPOST_ID),
    );
    const closeRequests: string[] = [];
    const observedPaths = new Set([
        journalpostPath(JOURNALPOST_ID),
        journalpostPath(KOPIERT_JOURNALPOST_ID),
        ApiPath.JOURNALPOST_MOTTAK,
        copyPath,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        const method = request.method();
        if (observedPaths.has(path)) events.push({ kind: 'request', method, path });
        if (
            (path.startsWith('/api/k9-punsj/') || path.startsWith('/api/k9-formidling/')) &&
            method !== 'GET' &&
            method !== 'HEAD'
        ) {
            mutations.push(`${method} ${path}`);
        }
        if (closedPaths.includes(path)) closeRequests.push(`${method} ${path}`);
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (observedPaths.has(path)) {
            events.push({ kind: 'response', method: response.request().method(), path, status: response.status() });
        }
    });

    const initial = page.waitForResponse((response) => isResponse(response, 'GET', journalpostPath(JOURNALPOST_ID)));
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    const initialResponse = await initial;
    expect(initialResponse.status()).toBe(200);
    expect(initialResponse.fromServiceWorker()).toBe(true);
    expect(await initialResponse.json()).toEqual({ ...journalpostFixture, journalpostId: JOURNALPOST_ID });
    await installScenarioHandlers(page);

    const lookup = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );
    await page.getByRole('radio', { name: 'Ja' }).check();
    const lookupResponse = await lookup;
    expect(lookupResponse.status()).toBe(200);
    expect(lookupResponse.fromServiceWorker()).toBe(true);
    expect(await lookupResponse.json()).toEqual(fagsaker);

    const panel = page.locator('.journalpostpanel');
    const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
    const holdButton = page.locator('[data-test-id="journalførOgVent"]');
    const twoApplicants = page.getByLabel(
        'Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)',
    );
    await expect(panel).toContainText(SØKER_ID);
    await twoApplicants.check();
    await expect(page.locator('[data-test-id="infoOmRegisteringAvToSokere"]')).toContainText(
        'Du skal registrere informasjon for en søker av gangen i Punsj.',
    );
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenSøker"]')).toContainText(
        'Du må fylle ut fødselsnummer til annen søker',
    );
    await expect(continueButton).toBeDisabled();
    await expect(holdButton).toBeDisabled();

    const personLookup = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.PERSON) &&
            response.request().headers()['x-nav-norskident'] === ANNEN_SØKER_ID,
    );
    const secondApplicant = page.getByLabel('Fødselsnummer annen søker:');
    await secondApplicant.fill(ANNEN_SØKER_ID);
    const personResponse = await personLookup;
    expect(personResponse.status()).toBe(200);
    expect(personResponse.fromServiceWorker()).toBe(true);
    expect(await personResponse.json()).toMatchObject({
        identitetsnummer: ANNEN_SØKER_ID,
        fornavn: 'TUNGSINDIG',
        etternavn: 'KAKE',
    });
    await expect(page.getByText('Navn: TUNGSINDIG KAKE')).toBeVisible();
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenSøker"]')).toHaveCount(0);
    await expect(page.locator('[data-test-id="toSøkereIngenPleietrengende"]')).toContainText(
        'Du må velge pleietrengende eller fagsak',
    );
    await expect(continueButton).toBeDisabled();
    await expect(holdButton).toBeDisabled();

    const caseSelect = page.getByLabel('Velg fagsak');
    await caseSelect.selectOption(FAGSAK.fagsakId);
    await expect(page.locator('[data-test-id="toSøkereIngenPleietrengende"]')).toHaveCount(0);
    await expect(page.locator('.fagsakSelectedInfo')).toContainText(BARN.navn);
    await expect(page.locator('.fagsakSelectedInfo')).toContainText(BARN.identitetsnummer);
    await expect(panel).toContainText(FAGSAK.fagsakId);
    await expect(panel).toContainText(BARN.identitetsnummer);
    await expect(continueButton).toBeEnabled();
    await expect(holdButton).toBeEnabled();

    await continueButton.click();
    const dialog = page.getByRole('dialog');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    await expect(
        dialog.getByRole('heading', { name: 'Vil du lagre følgende informasjon til journalposten?' }),
    ).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info).toContainText('Pleiepenger sykt barn');
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info).toContainText(SØKER_ID);
    await expect(info).not.toContainText(ANNEN_SØKER_ID);
    await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
    await expect(info).toContainText(BARN.identitetsnummer);
    await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
    await expect(info).toContainText(FAGSAK.fagsakId);
    await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    await expect(info).toContainText('15.04.2024');
    await expect(dialog.getByText('Informasjonen kan ikke endres etter journalposten er journalført.')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Avbryt' }).click();
    await expect(dialog).toBeHidden();
    await expect(twoApplicants).toBeChecked();
    await expect(secondApplicant).toHaveValue(ANNEN_SØKER_ID);
    await expect(caseSelect).toHaveValue(FAGSAK.fagsakId);
    await expect(panel).toContainText(SØKER_ID);
    await expect(panel).toContainText(BARN.identitetsnummer);
    expect(mutations).toEqual([]);
    expect(closeRequests).toEqual([]);

    await continueButton.click();
    await expect(dialog).toBeVisible();
    const classification = page.waitForResponse((response) => isResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK));
    const copyRequest = page.waitForRequest(
        (request) => request.method() === 'POST' && new URL(request.url()).pathname === copyPath,
    );
    const copyResponsePromise = page.waitForResponse((response) => isResponse(response, 'POST', copyPath));
    await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();
    const classificationResponse = await classification;
    expect(classificationResponse.status()).toBe(200);
    expect(classificationResponse.fromServiceWorker()).toBe(true);
    expect(classificationResponse.request().headers()['content-type']).toBe('application/json');
    expect(classificationResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classificationResponse.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: BARN.identitetsnummer,
        fagsakYtelseTypeKode: 'PSB',
        saksnummer: FAGSAK.fagsakId,
        periode: FAGSAK.gyldigPeriode,
        relatertPersonIdent: '',
    });
    expect(await classificationResponse.json()).toEqual({ saksnummer: FAGSAK.fagsakId });

    const pendingCopy = await copyRequest;
    expect(pendingCopy.headers()['content-type']).toBe('application/json');
    expect(pendingCopy.headers()['x-nav-norskident']).toBeUndefined();
    expect(pendingCopy.postDataJSON()).toEqual({
        til: ANNEN_SØKER_ID,
        barn: BARN.identitetsnummer,
        ytelse: 'PSB',
    });
    await expect(dialog.getByText('Journalpost kopieres....')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Videre' })).toBeDisabled();
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${JOURNALPOST_ID}`);
    const copyRequestIndex = events.findIndex(
        (event) => event.kind === 'request' && event.method === 'POST' && event.path === copyPath,
    );
    const classificationResponseIndex = events.findIndex(
        (event) =>
            event.kind === 'response' &&
            event.method === 'POST' &&
            event.path === ApiPath.JOURNALPOST_MOTTAK &&
            event.status === 200,
    );
    expect(classificationResponseIndex).toBeGreaterThanOrEqual(0);
    expect(copyRequestIndex).toBeGreaterThan(classificationResponseIndex);
    expect(events.slice(copyRequestIndex + 1)).not.toContainEqual(
        expect.objectContaining({ kind: 'request', method: 'GET', path: journalpostPath(JOURNALPOST_ID) }),
    );
    expect(events).not.toContainEqual(expect.objectContaining({ kind: 'response', method: 'POST', path: copyPath }));

    const refresh = page.waitForResponse((response) => isResponse(response, 'GET', journalpostPath(JOURNALPOST_ID)));
    await page.evaluate(() => {
        const release = (window as Window & { releasePsbCopy?: () => void }).releasePsbCopy;
        if (!release) throw new Error('Kopieringsresponsen kan ikke frigis.');
        release();
    });
    const copyResponse = await copyResponsePromise;
    expect(copyResponse.status()).toBe(201);
    expect(copyResponse.fromServiceWorker()).toBe(true);
    expect(await copyResponse.json()).toEqual({
        nyJournalpostId: KOPIERT_JOURNALPOST_ID,
        saksnummer: KOPIERT_SAKSNUMMER,
        til: ANNEN_SØKER_ID,
        pleietrengende: BARN.identitetsnummer,
        annenPart: null,
        ytelse: 'PSB',
    });
    expect(KOPIERT_JOURNALPOST_ID).not.toBe(JOURNALPOST_ID);
    expect(KOPIERT_SAKSNUMMER).not.toBe(FAGSAK.fagsakId);

    const refreshResponse = await refresh;
    expect(refreshResponse.status()).toBe(200);
    expect(refreshResponse.fromServiceWorker()).toBe(true);
    expect(refreshResponse.request().headers()['x-nav-norskident']).toBeUndefined();
    expect(await refreshResponse.json()).toEqual({
        ...journalpostFixture,
        journalpostId: JOURNALPOST_ID,
        erFerdigstilt: true,
        journalpostStatus: 'JOURNALFOERT',
        sak: {
            fagsakId: FAGSAK.fagsakId,
            sakstype: 'PSB',
            gyldigPeriode: FAGSAK.gyldigPeriode,
            pleietrengendeIdent: BARN.identitetsnummer,
            relatertPersonIdent: null,
            reservertSaksnummer: false,
        },
    });
    const copyResponseIndex = events.findIndex(
        (event) =>
            event.kind === 'response' && event.method === 'POST' && event.path === copyPath && event.status === 201,
    );
    const refreshRequestIndex = events.findIndex(
        (event, index) =>
            index > copyResponseIndex &&
            event.kind === 'request' &&
            event.method === 'GET' &&
            event.path === journalpostPath(JOURNALPOST_ID),
    );
    expect(copyResponseIndex).toBeGreaterThan(copyRequestIndex);
    expect(refreshRequestIndex).toBeGreaterThan(copyResponseIndex);
    expect(events.slice(classificationResponseIndex + 1, copyResponseIndex)).not.toContainEqual(
        expect.objectContaining({ kind: 'request', method: 'GET', path: journalpostPath(JOURNALPOST_ID) }),
    );
    await expect(dialog.getByText(/Kopi av journalposten er opprettet/)).toContainText(ANNEN_SØKER_ID);
    await expect(dialog.getByText(/Kopi av journalposten er opprettet/)).toContainText(BARN.identitetsnummer);
    await expect(dialog.getByRole('button', { name: 'Videre' })).toBeEnabled();
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${JOURNALPOST_ID}`);
    await expect(panel).toContainText(SØKER_ID);
    await expect(panel).not.toContainText(ANNEN_SØKER_ID);

    await dialog.getByRole('button', { name: 'Videre' }).click();
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${JOURNALPOST_ID}/pleiepenger-sykt-barn/`);
    await expect(page.locator('[data-test-id="alertJournalført"]')).toContainText('Journalposten er journalført.');
    await expect(panel).toContainText(JOURNALPOST_ID);
    await expect(panel).toContainText(SØKER_ID);
    await expect(panel).toContainText(BARN.identitetsnummer);
    await expect(panel).not.toContainText(ANNEN_SØKER_ID);
    const registration = page.getByRole('radio', { name: 'Registrere opplysninger til K9' });
    await expect(registration).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bekreft' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Sett på vent' })).toBeEnabled();
    await registration.check();
    await expect(page.getByRole('button', { name: 'Bekreft' })).toBeEnabled();
    expect(events).not.toContainEqual(
        expect.objectContaining({ kind: 'request', method: 'GET', path: journalpostPath(KOPIERT_JOURNALPOST_ID) }),
    );
    expect(mutations).toEqual([`POST ${ApiPath.JOURNALPOST_MOTTAK}`, `POST ${copyPath}`]);
    expect(closeRequests).toEqual([]);
});
