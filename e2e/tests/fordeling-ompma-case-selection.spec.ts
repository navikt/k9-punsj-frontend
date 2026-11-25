import { expect, test, type Page, type Response } from '@playwright/test';

import fagsaker from '../../src/mocks/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPMA304 from '../../src/mocks/fixtures/jpOMPMA304.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPMA304.journalpostId;
const SØKER_ID = jpOMPMA304.norskIdent;
const ANNEN_SØKER_ID = '02918496664';
const NY_SØKER_ID = '12448325820';
const MANUELL_ANNEN_PART_ID = '24420167209';
const ORDINÆR_SAK = fagsaker[18];
const RESERVERT_SAK = fagsaker[19];
const OMPMA_SAKER = [ORDINÆR_SAK, RESERVERT_SAK];
const ANNEN_PART = ORDINÆR_SAK.relatertPerson!;
const DOKUMENTTYPE = 'Ekstra omsorgsdager midlertidig alene';
const OMPMA_UNDERTYPE = 'Ekstra omsorgsdager når du er midlertidig alene om omsorgen';
const PERIODE = '31.12.2021 - 31.12.2039';
const JOURNALPOST_PATH = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const MUTATION_PATHS = new Set([
    ApiPath.JOURNALPOST_MOTTAK,
    ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.OMP_MA_SOKNAD_CREATE,
    ApiPath.OMP_MA_SOKNAD_UPDATE,
    ApiPath.OMP_MA_SOKNAD_VALIDER,
    ApiPath.OMP_MA_SOKNAD_SUBMIT,
]);

const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const journalpostpanel = (page: Page) => page.locator('.journalpostpanel');
const selectedInfo = (page: Page) => page.locator('.fagsakSelectedInfo');
const fortsett = (page: Page) => page.locator('[data-test-id="journalførOgFortsett"]');
const vent = (page: Page) => page.locator('[data-test-id="journalførOgVent"]');

const recordMutations = (page: Page) => {
    const mutations: string[] = [];

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (MUTATION_PATHS.has(path) && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
            mutations.push(`${request.method()} ${path}`);
        }
    });

    return mutations;
};

const openJournalpost = async (page: Page) => {
    const responsePromise = page.waitForResponse((response) =>
        isResponse(response, 'GET', JOURNALPOST_PATH),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    const response = await responsePromise;

    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${JOURNALPOST_ID}`);
    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(jpOMPMA304);

    const subtype = page.getByRole('radio', { name: OMPMA_UNDERTYPE, exact: true });
    await expect(subtype).toBeChecked();
};

const installCasesLookupHandler = async (
    page: Page,
    applicantId: string,
    cases: typeof OMPMA_SAKER,
) => {
    await page.evaluate(
        ({ casesPath, applicantId: lookupApplicantId, cases: responseCases }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(casesPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== lookupApplicantId) return;
                    return msw.HttpResponse.json(responseCases, { status: 200 });
                }),
            );
        },
        {
            casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            applicantId,
            cases,
        },
    );
};

const selectApplicantAndLoadCases = async (page: Page) => {
    await installCasesLookupHandler(page, SØKER_ID, OMPMA_SAKER);

    const lookupPromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const response = await lookupPromise;

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual(OMPMA_SAKER);
    await expect(page.getByLabel('Velg fagsak')).toBeEnabled();
};

const expectPanelField = async (page: Page, label: string, value: string) => {
    const field = journalpostpanel(page).getByText(label, { exact: true });
    await expect(field).toBeVisible();
    await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
};

const installPersonLookupHandler = async (page: Page) => {
    await page.evaluate(
        ({ personPath, personId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(personPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== personId) return;
                    return msw.HttpResponse.json({
                        etternavn: 'Test',
                        fornavn: 'Annen part',
                        fødselsdato: '1981-12-18',
                        identitetsnummer: personId,
                        mellomnavn: '',
                        sammensattNavn: 'Annen part Test',
                    });
                }),
            );
        },
        { personPath: ApiPath.PERSON, personId: MANUELL_ANNEN_PART_ID },
    );
};

const installSecondApplicantPersonHandler = async (page: Page) => {
    await page.evaluate(
        ({ personPath, applicantId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(personPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json({
                        etternavn: 'KAKE',
                        fornavn: 'TUNGSINDIG',
                        fødselsdato: '1981-12-18',
                        identitetsnummer: applicantId,
                        mellomnavn: null,
                        sammensattNavn: 'TUNGSINDIG KAKE',
                    });
                }),
            );
        },
        { personPath: ApiPath.PERSON, applicantId: ANNEN_SØKER_ID },
    );
};

const installReplacementApplicantPersonHandler = async (page: Page) => {
    await page.evaluate(
        ({ personPath, applicantId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(personPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json({
                        etternavn: 'Test',
                        fornavn: 'Ny søker',
                        fødselsdato: '1981-12-18',
                        identitetsnummer: applicantId,
                        mellomnavn: '',
                        sammensattNavn: 'Ny søker Test',
                    });
                }),
            );
        },
        { personPath: ApiPath.PERSON, applicantId: NY_SØKER_ID },
    );
};

const enterManualOtherParty = async (page: Page, expectReady = true) => {
    await installPersonLookupHandler(page);
    const personResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.PERSON) &&
            response.request().headers()['x-nav-norskident'] === MANUELL_ANNEN_PART_ID,
    );
    const input = page.getByLabel('Fødselsnummer annen part:', { exact: true });
    await input.fill(MANUELL_ANNEN_PART_ID);

    const personResponse = await personResponsePromise;
    expect(personResponse.status()).toBe(200);
    expect(personResponse.fromServiceWorker()).toBe(true);
    expect(personResponse.request().headers()['x-nav-norskident']).toBe(MANUELL_ANNEN_PART_ID);
    expect(await personResponse.json()).toMatchObject({
        identitetsnummer: MANUELL_ANNEN_PART_ID,
        sammensattNavn: 'Annen part Test',
    });
    await expect(input).toHaveValue(MANUELL_ANNEN_PART_ID);
    await expectPanelField(page, 'Annen part ID:', MANUELL_ANNEN_PART_ID);
    if (!expectReady) return;
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
};

const selectApplicantWithNoCases = async (page: Page) => {
    await page.evaluate(
        ({ casesPath, applicantId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(casesPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json([], { status: 200 });
                }),
            );
        },
        { casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT, applicantId: SØKER_ID },
    );

    const lookupResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const lookupResponse = await lookupResponsePromise;

    expect(lookupResponse.status()).toBe(200);
    expect(lookupResponse.fromServiceWorker()).toBe(true);
    expect(lookupResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await lookupResponse.json()).toEqual([]);
    await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
};

const expectSelectedCase = async (page: Page, sak: (typeof OMPMA_SAKER)[number]) => {
    await expect(page.getByLabel('Velg fagsak')).toHaveValue(sak.fagsakId);
    await expect(selectedInfo(page).getByText('Annen part:', { exact: true })).toBeVisible();
    await expect(
        selectedInfo(page).getByText(`Navn: ${ANNEN_PART.navn}`, { exact: true }),
    ).toBeVisible();
    await expect(
        selectedInfo(page).getByText(`Id: ${ANNEN_PART.identitetsnummer}`, { exact: true }),
    ).toBeVisible();

    const k9Link = selectedInfo(page).getByRole('link', { name: /Se fagsak i K9/ });
    if (sak.reservert) {
        await expect(k9Link).toHaveCount(0);
    } else {
        await expect(k9Link).toHaveAttribute('href', expect.stringContaining(sak.fagsakId));
    }

    await expectPanelField(page, 'Saksnummer:', sak.fagsakId);
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expectPanelField(page, 'Annen part ID:', ANNEN_PART.identitetsnummer);
    await expect(page.getByLabel('Fødselsnummer annen part:')).toHaveCount(0);
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
};

type ModalScenario = {
    action: 'Fortsett' | 'Vent';
    sak: (typeof OMPMA_SAKER)[number];
};

const modalScenarios: ModalScenario[] = [
    { action: 'Fortsett', sak: ORDINÆR_SAK },
    { action: 'Vent', sak: ORDINÆR_SAK },
    { action: 'Fortsett', sak: RESERVERT_SAK },
    { action: 'Vent', sak: RESERVERT_SAK },
];

const selectCase = async (page: Page, sak: (typeof OMPMA_SAKER)[number]) => {
    await page.getByLabel('Velg fagsak').selectOption(sak.fagsakId);
    await expectSelectedCase(page, sak);
};

const expectAndCancelModal = async (
    page: Page,
    scenario: ModalScenario,
    mutations: string[],
) => {
    const isFortsett = scenario.action === 'Fortsett';
    await (isFortsett ? fortsett(page) : vent(page)).click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    const heading = isFortsett
        ? 'Vil du lagre følgende informasjon til journalposten?'
        : 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
    const confirmLabel = isFortsett ? 'Journalfør journalposten' : 'Journalfør og sett på vent';

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText(DOKUMENTTYPE, { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Annen part ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(ANNEN_PART.identitetsnummer, { exact: true })).toBeVisible();
    await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
    await expect(info.getByText(scenario.sak.fagsakId, { exact: true })).toBeVisible();
    await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    await expect(info.getByText(PERIODE, { exact: true })).toBeVisible();
    await expect(
        dialog
            .locator('[data-test-id="klassifiserModalAlertBlokk"]')
            .getByText('Informasjonen kan ikke endres etter journalposten er journalført.', {
                exact: true,
            }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Gå til LOS', exact: true })).toHaveCount(0);
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: confirmLabel, exact: true })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Avbryt', exact: true })).toBeEnabled();

    await dialog.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expectSelectedCase(page, scenario.sak);
    expect(mutations).toEqual([]);
};

type NoCaseModalAction = 'Fortsett' | 'Vent';

const expectAndCancelNoCaseModal = async (
    page: Page,
    action: NoCaseModalAction,
    mutations: string[],
    applicantId: string,
) => {
    const isFortsett = action === 'Fortsett';
    await (isFortsett ? fortsett(page) : vent(page)).click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    const heading = isFortsett
        ? 'Vil du lagre følgende informasjon til journalposten?'
        : 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
    const confirmLabel = isFortsett ? 'Journalfør journalposten' : 'Journalfør og sett på vent';

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText(DOKUMENTTYPE, { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(applicantId, { exact: true })).toBeVisible();
    await expect(info.getByText('Annen part ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(MANUELL_ANNEN_PART_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(info.getByText('Periode:', { exact: true })).toHaveCount(0);
    await expect(
        dialog
            .locator('[data-test-id="klassifiserModalAlertBlokk"]')
            .getByText('Informasjonen kan ikke endres etter journalposten er journalført.', {
                exact: true,
            }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Gå til LOS', exact: true })).toHaveCount(0);
    await expect(dialog.locator('[data-test-id="klassifiserModalGåTilLos"]')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: confirmLabel, exact: true })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Avbryt', exact: true })).toBeEnabled();

    await dialog.getByRole('button', { name: 'Avbryt', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(page.getByLabel('Fødselsnummer annen part:', { exact: true })).toHaveValue(
        MANUELL_ANNEN_PART_ID,
    );
    await expectPanelField(page, 'Søkers ID:', applicantId);
    await expectPanelField(page, 'Annen part ID:', MANUELL_ANNEN_PART_ID);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
    expect(mutations).toEqual([]);
};

test('velger ordinær og reservert OMPMA-sak og fjerner foreldede detaljer', async ({ page }) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);

    await expectPanelField(page, 'Journalpostnummer:', JOURNALPOST_ID);
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);

    const documentHeading = page.getByRole('heading', { name: 'Dette gjelder:', exact: true });
    await expect(documentHeading).toBeVisible();
    const documentChoices = documentHeading.locator('../..').getByRole('radiogroup');
    for (const name of [
        'Pleiepenger sykt barn',
        'Omsorgspenger/omsorgsdager',
        'Pleiepenger i livets sluttfase',
        'Annet',
    ]) {
        await expect(documentChoices.getByRole('radio', { name, exact: true })).toBeVisible();
    }

    await expect(
        page.getByLabel('Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)'),
    ).toBeVisible();
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    const pdf = page.getByTitle('pdf');
    await expect(pdf).toBeVisible();
    await page.getByRole('button', { name: 'Skjul', exact: true }).click();
    await expect(pdf).toBeHidden();

    await selectApplicantAndLoadCases(page);

    await selectCase(page, ORDINÆR_SAK);
    await selectCase(page, RESERVERT_SAK);
    await expect(selectedInfo(page)).not.toContainText(ORDINÆR_SAK.fagsakId);
    await expect(journalpostpanel(page)).not.toContainText(ORDINÆR_SAK.fagsakId);
    expect(mutations).toEqual([]);
});

test('reserverer ny OMPMA-sak og registrerer manuell annen part', async ({ page }) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    await selectApplicantAndLoadCases(page);
    await selectCase(page, RESERVERT_SAK);

    await page.getByLabel('Reserver saksnummer til ny fagsak').check();
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(RESERVERT_SAK.fagsakId);
    await expect(journalpostpanel(page).getByText('Annen part ID:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(ANNEN_PART.identitetsnummer);
    await expect(page.getByLabel('Fødselsnummer annen part:', { exact: true })).toBeVisible();
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await enterManualOtherParty(page);
    expect(mutations).toEqual([]);
});

test('viser manuell annen part når OMPMA-oppslaget ikke finner saker', async ({ page }) => {
    await openJournalpost(page);
    await selectApplicantWithNoCases(page);
    await enterManualOtherParty(page);
});

test('avbryter Fortsett og Vent for OMPMA med to søkere og manuell annen part', async ({ page }) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    await selectApplicantAndLoadCases(page);

    const twoApplicants = page.getByLabel(
        'Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)',
    );
    await twoApplicants.check();
    await expect(page.locator('[data-test-id="infoOmRegisteringAvToSokere"]')).toBeVisible();
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenSøker"]')).toBeVisible();
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenPartMA"]')).toHaveCount(0);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    const secondApplicant = page.getByLabel('Fødselsnummer annen søker:', { exact: true });
    const reservation = page.getByLabel('Reserver saksnummer til ny fagsak');
    await reservation.check();
    await expect(reservation).toBeChecked();
    await enterManualOtherParty(page, false);
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenPartMA"]')).toHaveCount(0);

    // Alt annet er gyldig, men annen søker mangler: begge handlingene skal være sperret
    await expect(secondApplicant).toHaveValue('');
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenSøker"]')).toBeVisible();
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();
    await expect(page.locator('[data-test-id="klassifiserModal"]')).toHaveCount(0);

    // Fjerner annen part igjen for å bevare den opprinnelige sperren for manglende annen part
    const otherParty = page.getByLabel('Fødselsnummer annen part:', { exact: true });
    await otherParty.fill('');
    await expect(otherParty).toHaveValue('');
    await expect(journalpostpanel(page).getByText('Annen part ID:', { exact: true })).toHaveCount(0);

    await installSecondApplicantPersonHandler(page);
    const secondApplicantResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.PERSON) &&
            response.request().headers()['x-nav-norskident'] === ANNEN_SØKER_ID,
    );
    await secondApplicant.fill(ANNEN_SØKER_ID);
    const secondApplicantResponse = await secondApplicantResponsePromise;
    expect(secondApplicantResponse.status()).toBe(200);
    expect(secondApplicantResponse.fromServiceWorker()).toBe(true);
    expect(secondApplicantResponse.request().headers()['x-nav-norskident']).toBe(ANNEN_SØKER_ID);
    expect(await secondApplicantResponse.json()).toMatchObject({
        identitetsnummer: ANNEN_SØKER_ID,
        fornavn: 'TUNGSINDIG',
        etternavn: 'KAKE',
    });
    await expect(secondApplicant).toHaveValue(ANNEN_SØKER_ID);
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenSøker"]')).toHaveCount(0);
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenPartMA"]')).toBeVisible();
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await enterManualOtherParty(page);
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenPartMA"]')).toHaveCount(0);

    for (const action of ['Fortsett', 'Vent'] as const) {
        await expectAndCancelNoCaseModal(page, action, mutations, SØKER_ID);
        await expect(twoApplicants).toBeChecked();
        await expect(secondApplicant).toHaveValue(ANNEN_SØKER_ID);
    }
});

for (const action of ['Fortsett', 'Vent'] as const) {
    test(`avbryter ${action} for OMPMA uten valgt sak`, async ({ page }) => {
        const mutations = recordMutations(page);
        await openJournalpost(page);
        await selectApplicantAndLoadCases(page);
        await selectCase(page, RESERVERT_SAK);

        await page.getByLabel('Reserver saksnummer til ny fagsak').check();
        await enterManualOtherParty(page);

        await expectAndCancelNoCaseModal(page, action, mutations, SØKER_ID);
    });
}

for (const scenario of modalScenarios) {
    test(`avbryter ${scenario.action} for ${scenario.sak.reservert ? 'reservert' : 'ordinær'} OMPMA-sak`, async ({
        page,
    }) => {
        const mutations = recordMutations(page);
        await openJournalpost(page);
        await selectApplicantAndLoadCases(page);
        await selectCase(page, scenario.sak);

        await expectAndCancelModal(page, scenario, mutations);
    });
}

test('nullstiller og erstatter OMPMA-søker med manuell annen part', async ({ page }) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    await selectApplicantAndLoadCases(page);
    await selectCase(page, RESERVERT_SAK);

    await page.getByLabel('Reserver saksnummer til ny fagsak').check();
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await enterManualOtherParty(page);

    await page.getByRole('radio', { name: 'Nei', exact: true }).check();
    await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
    await expect(page.getByLabel('Fødselsnummer annen part:', { exact: true })).toHaveValue(
        MANUELL_ANNEN_PART_ID,
    );
    await expectPanelField(page, 'Annen part ID:', MANUELL_ANNEN_PART_ID);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await installCasesLookupHandler(page, NY_SØKER_ID, OMPMA_SAKER);
    await installReplacementApplicantPersonHandler(page);

    const casesResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === NY_SØKER_ID,
    );
    const personResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.PERSON) &&
            response.request().headers()['x-nav-norskident'] === NY_SØKER_ID,
    );
    const applicantInput = page.getByLabel('Søkers fødselsnummer eller D-nummer:', { exact: true });
    await applicantInput.fill(NY_SØKER_ID);
    const [casesResponse, personResponse] = await Promise.all([
        casesResponsePromise,
        personResponsePromise,
    ]);

    expect(casesResponse.status()).toBe(200);
    expect(casesResponse.fromServiceWorker()).toBe(true);
    expect(casesResponse.request().headers()['x-nav-norskident']).toBe(NY_SØKER_ID);
    expect(await casesResponse.json()).toEqual(OMPMA_SAKER);
    expect(personResponse.status()).toBe(200);
    expect(personResponse.fromServiceWorker()).toBe(true);
    expect(personResponse.request().headers()['x-nav-norskident']).toBe(NY_SØKER_ID);
    expect(await personResponse.json()).toMatchObject({
        identitetsnummer: NY_SØKER_ID,
        sammensattNavn: 'Ny søker Test',
    });

    await expect(page.getByLabel('Søkers fødselsnummer eller D-nummer:', { exact: true })).toHaveValue(
        NY_SØKER_ID,
    );
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(journalpostpanel(page)).not.toContainText(SØKER_ID);
    await expect(journalpostpanel(page)).not.toContainText(RESERVERT_SAK.fagsakId);
    await expectPanelField(page, 'Søkers ID:', NY_SØKER_ID);
    await expect(page.getByLabel('Fødselsnummer annen part:', { exact: true })).toHaveValue(
        MANUELL_ANNEN_PART_ID,
    );
    await expectPanelField(page, 'Annen part ID:', MANUELL_ANNEN_PART_ID);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();

    await expectAndCancelNoCaseModal(page, 'Fortsett', mutations, NY_SØKER_ID);
    await expect(applicantInput).toHaveValue(NY_SØKER_ID);
    await expectAndCancelNoCaseModal(page, 'Vent', mutations, NY_SØKER_ID);
    await expect(applicantInput).toHaveValue(NY_SØKER_ID);
    expect(mutations).toEqual([]);
});
