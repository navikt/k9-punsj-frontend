import { expect, test, type Page, type Response } from '@playwright/test';

import barnFixture from '../../cypress/fixtures/barn.json' with { type: 'json' };
import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import jpOMPKS302 from '../../cypress/fixtures/jpOMPKS302.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = jpOMPKS302.journalpostId;
const SØKER_ID = jpOMPKS302.norskIdent;
const DOKUMENTTYPE = 'Omsorgspenger kronisk sykt barn';
const UNDERTYPE = 'Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn';
const PERIODE = '31.12.2021 - 31.12.2039';
const ORDINÆR_SAK_UTEN_BARN = fagsaker[10];
const ORDINÆR_SAK_MED_BARN = fagsaker[11];
const RESERVERT_SAK_MED_BARN = fagsaker[12];
const RESERVERT_SAK_UTEN_BARN = fagsaker[13];
const FAGSAKER = [
    ORDINÆR_SAK_UTEN_BARN,
    ORDINÆR_SAK_MED_BARN,
    RESERVERT_SAK_MED_BARN,
    RESERVERT_SAK_UTEN_BARN,
];
const BARN_MED_FAGSAK = barnFixture.barn[2];
const BARN_UTEN_FAGSAK = barnFixture.barn[0];
const MANUELT_BARN_ID = '53488838241';
const NY_SØKER_ID = '12448325820';
const ANNEN_SØKER_ID = '02918496664';
const ANNEN_SØKER_PERSON = {
    etternavn: 'Test',
    fornavn: 'Annen søker',
    fødselsdato: '1984-01-02',
    identitetsnummer: ANNEN_SØKER_ID,
    mellomnavn: '',
    sammensattNavn: 'Annen søker Test',
};
const NY_SØKER_PERSON = {
    etternavn: 'Test',
    fornavn: 'Ny søker',
    fødselsdato: '1981-12-18',
    identitetsnummer: NY_SØKER_ID,
    mellomnavn: '',
    sammensattNavn: 'Ny søker Test',
};
const MANUELT_BARN_PERSON = {
    etternavn: 'Test',
    fornavn: 'Barn',
    fødselsdato: '2010-01-01',
    identitetsnummer: MANUELT_BARN_ID,
    mellomnavn: '',
    sammensattNavn: 'Barn Test',
};
const SAK_FOR_BARN = FAGSAKER.find(
    (sak) => sak.pleietrengende?.identitetsnummer === BARN_MED_FAGSAK.identitetsnummer,
);
if (!SAK_FOR_BARN) throw new Error('Fant ikke OMPKS-saken som tilhører barnet i barn.json.');
if (FAGSAKER.some((sak) => sak.pleietrengende?.identitetsnummer === BARN_UTEN_FAGSAK.identitetsnummer)) {
    throw new Error('Barnet uten fagsak finnes i en OMPKS-sak.');
}
const JOURNALPOST_PATH = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const MUTATION_PATHS = new Set([
    ApiPath.JOURNALPOST_MOTTAK,
    ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', JOURNALPOST_ID),
    ApiPath.OMP_KS_SOKNAD_CREATE,
    ApiPath.OMP_KS_SOKNAD_UPDATE,
    ApiPath.OMP_KS_SOKNAD_VALIDER,
    ApiPath.OMP_KS_SOKNAD_SUBMIT,
]);

type Fagsak = (typeof FAGSAKER)[number];
type Handling = 'Fortsett' | 'Vent';

type ModalScenario =
    | { kind: 'case'; fagsak: Fagsak; handling: Handling }
    | { kind: 'new-case'; childId: string; handling: Handling }
    | { kind: 'manual-child'; childId: string; handling: Handling }
    | { kind: 'missing-id'; handling: 'Vent' };

const MODAL_SCENARIO = [
    {
        navn: 'avbryter Vent-modal for ordinær sak uten barn',
        kind: 'case',
        fagsak: ORDINÆR_SAK_UTEN_BARN,
        handling: 'Vent',
    },
    {
        navn: 'avbryter Fortsett-modal for ordinær sak med barn',
        kind: 'case',
        fagsak: ORDINÆR_SAK_MED_BARN,
        handling: 'Fortsett',
    },
    {
        navn: 'avbryter Vent-modal for ordinær sak med barn',
        kind: 'case',
        fagsak: ORDINÆR_SAK_MED_BARN,
        handling: 'Vent',
    },
    {
        navn: 'avbryter Fortsett-modal for reservert sak med barn',
        kind: 'case',
        fagsak: RESERVERT_SAK_MED_BARN,
        handling: 'Fortsett',
    },
    {
        navn: 'avbryter Vent-modal for reservert sak med barn',
        kind: 'case',
        fagsak: RESERVERT_SAK_MED_BARN,
        handling: 'Vent',
    },
    {
        navn: 'avbryter Vent-modal for reservert sak uten barn',
        kind: 'case',
        fagsak: RESERVERT_SAK_UTEN_BARN,
        handling: 'Vent',
    },
] satisfies (ModalScenario & { navn: string })[];

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
    expect(await response.json()).toEqual(jpOMPKS302);
    await expect(
        page.getByRole('radio', { name: UNDERTYPE, exact: true }),
    ).toBeChecked();
    await expect(page.locator('input[type="radio"][value="OMSORGSPENGER_KS"]')).toBeChecked();
};

const installApplicantHandlers = async (page: Page, applicantId = SØKER_ID) => {
    await page.evaluate(
        ({ casesPath, childPath, applicantId: requestedApplicantId, cases, children }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(casesPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== requestedApplicantId) return;
                    return msw.HttpResponse.json(cases, { status: 200 });
                }),
                msw.http.get(childPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== requestedApplicantId) return;
                    return msw.HttpResponse.json(children, { status: 200 });
                }),
            );
        },
        {
            casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT,
            childPath: ApiPath.BARN_GET,
            applicantId,
            cases: FAGSAKER,
            children: barnFixture,
        },
    );
};

const installPersonHandler = async (page: Page, person: typeof MANUELT_BARN_PERSON) => {
    await page.evaluate(
        ({ personPath, person: responsePerson }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            msw.worker.use(
                msw.http.get(personPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== responsePerson.identitetsnummer) return;
                    return msw.HttpResponse.json(responsePerson, { status: 200 });
                }),
            );
        },
        { personPath: ApiPath.PERSON, person },
    );
};

const waitForLookup = (page: Page, path: string, applicantId: string) =>
    page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', path) &&
            response.request().headers()['x-nav-norskident'] === applicantId,
    );

const expectLookup = async (response: Response, ident: string, body: unknown) => {
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(ident);
    expect(await response.json()).toEqual(body);
};

const selectApplicantAndLoadCases = async (page: Page) => {
    await installApplicantHandlers(page);
    const responsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.HENT_FAGSAK_PÅ_IDENT) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await response.json()).toEqual(FAGSAKER);
    await expect(page.getByLabel('Velg fagsak')).toBeEnabled();
};

const expectPanelField = async (page: Page, label: string, value: string) => {
    const field = journalpostpanel(page).getByText(label, { exact: true });
    await expect(field).toBeVisible();
    await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
};

const expectSelectedCase = async (
    page: Page,
    fagsak: Fagsak,
    staleCase?: Fagsak,
    staleChildId?: string,
) => {
    const info = selectedInfo(page);
    const panel = journalpostpanel(page);
    await expect(page.getByLabel('Velg fagsak')).toHaveValue(fagsak.fagsakId);
    await expect(info.getByText('Barn:', { exact: true })).toBeVisible();

    if (fagsak.pleietrengende) {
        await expect(
            info.getByText(`Navn: ${fagsak.pleietrengende.navn}`, { exact: true }),
        ).toBeVisible();
        await expect(
            info.getByText(`Id: ${fagsak.pleietrengende.identitetsnummer}`, { exact: true }),
        ).toBeVisible();
    } else {
        await expect(info.getByText('ikke satt', { exact: true })).toBeVisible();
        for (const sak of [ORDINÆR_SAK_MED_BARN, RESERVERT_SAK_MED_BARN]) {
            await expect(info).not.toContainText(sak.pleietrengende!.navn);
            await expect(info).not.toContainText(sak.pleietrengende!.identitetsnummer);
        }
    }

    const k9Link = info.getByRole('link', { name: /Se fagsak i K9/ });
    if (fagsak.reservert) {
        await expect(k9Link).toHaveCount(0);
    } else {
        await expect(k9Link).toHaveAttribute('href', expect.stringContaining(fagsak.fagsakId));
    }

    await expectPanelField(page, 'Journalpostnummer:', JOURNALPOST_ID);
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expectPanelField(page, 'Saksnummer:', fagsak.fagsakId);
    if (fagsak.pleietrengende) {
        await expectPanelField(page, 'Barnets ID:', fagsak.pleietrengende.identitetsnummer);
    } else {
        await expect(panel.getByText('Barnets ID:', { exact: true })).toHaveCount(0);
        for (const sak of [ORDINÆR_SAK_MED_BARN, RESERVERT_SAK_MED_BARN]) {
            await expect(panel).not.toContainText(sak.pleietrengende!.identitetsnummer);
        }
    }

    if (staleCase) {
        await expect(info).not.toContainText(staleCase.fagsakId);
        await expect(panel).not.toContainText(staleCase.fagsakId);
        if (!fagsak.reservert) {
            expect(await k9Link.getAttribute('href')).not.toContain(staleCase.fagsakId);
        }
    }
    if (staleChildId) {
        await expect(info).not.toContainText(staleChildId);
        await expect(panel).not.toContainText(staleChildId);
    }

    if (fagsak.pleietrengende) {
        await expect(fortsett(page)).toBeEnabled();
    } else {
        await expect(fortsett(page)).toBeDisabled();
    }
    await expect(vent(page)).toBeEnabled();
};

const selectCase = async (
    page: Page,
    fagsak: Fagsak,
    staleCase?: Fagsak,
    staleChildId?: string,
) => {
    await page.getByLabel('Velg fagsak').selectOption(fagsak.fagsakId);
    await expectSelectedCase(page, fagsak, staleCase, staleChildId);
};

const expectNewCaseWithListedChild = async (page: Page, childId: string, applicantId = SØKER_ID) => {
    const panel = journalpostpanel(page);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(page.getByLabel('Velg hvilket barn det gjelder')).toHaveValue(childId);
    await expectPanelField(page, 'Journalpostnummer:', JOURNALPOST_ID);
    await expectPanelField(page, 'Søkers ID:', applicantId);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expectPanelField(page, 'Barnets ID:', childId);
    await expect(panel.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(panel).not.toContainText(RESERVERT_SAK_UTEN_BARN.fagsakId);
    await expect(panel).not.toContainText(SAK_FOR_BARN!.fagsakId);
    await expect(panel).not.toContainText(BARN_MED_FAGSAK.identitetsnummer);
    await expect(selectedInfo(page)).toHaveCount(0);
    await expect(page.locator('[data-test-id="pleietrengendeHarFagsak"]')).toHaveCount(0);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
};

const expectManualChild = async (page: Page) => {
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(page.getByLabel('Velg hvilket barn det gjelder')).toBeDisabled();
    await expect(page.getByLabel('Det gjelder et annet barn')).toBeChecked();
    await expect(page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true })).toHaveValue(MANUELT_BARN_ID);
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expectPanelField(page, 'Barnets ID:', MANUELT_BARN_ID);
    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(BARN_UTEN_FAGSAK.identitetsnummer);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();
};

const expectMissingChildId = async (page: Page) => {
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(page.getByLabel('Velg hvilket barn det gjelder')).toBeDisabled();
    await expect(page.getByLabel('Det gjelder et annet barn')).toBeChecked();
    await expect(page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true })).toBeDisabled();
    await expect(page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('Pleietrengende har ikke fødselsnummer')).toBeChecked();
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expectPanelField(page, 'Sakstype:', DOKUMENTTYPE);
    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page).getByText('Barnets ID:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(MANUELT_BARN_ID);
    await expect(journalpostpanel(page)).not.toContainText(BARN_UTEN_FAGSAK.identitetsnummer);
    await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toBeVisible();
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeEnabled();
};

const expectAndCancelModal = async (
    page: Page,
    scenario: ModalScenario,
    mutations: string[],
    applicantId = SØKER_ID,
) => {
    const isFortsett = scenario.handling === 'Fortsett';
    await (isFortsett ? fortsett(page) : vent(page)).click();

    const dialog = page.locator('[data-test-id="klassifiserModal"]');
    const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
    const heading = isFortsett
        ? 'Vil du lagre følgende informasjon til journalposten?'
        : 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
    const confirmLabel = isFortsett ? 'Journalfør journalposten' : 'Journalfør og sett på vent';

    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-test-id="klassifiserModalHeader"]')).toContainText(heading);
    await expect(info.getByText('Sakstype:', { exact: true })).toBeVisible();
    await expect(info.getByText(DOKUMENTTYPE, { exact: true })).toBeVisible();
    await expect(info.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(info.getByText(applicantId, { exact: true })).toBeVisible();
    if (scenario.kind === 'case') {
        await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
        await expect(info.getByText(scenario.fagsak.fagsakId, { exact: true })).toBeVisible();
        await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
        await expect(info.getByText(PERIODE, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Saksnummer:', { exact: true })).toHaveCount(0);
        await expect(info.getByText('Periode:', { exact: true })).toHaveCount(0);
        await expect(info).not.toContainText(RESERVERT_SAK_UTEN_BARN.fagsakId);
        await expect(info).not.toContainText(PERIODE);
        await expect(info).not.toContainText(BARN_MED_FAGSAK.identitetsnummer);
    }

    const childId = scenario.kind === 'case'
        ? scenario.fagsak.pleietrengende?.identitetsnummer
        : scenario.kind === 'missing-id' ? undefined : scenario.childId;
    if (childId) {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
        await expect(info.getByText(childId, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
        for (const sak of [ORDINÆR_SAK_MED_BARN, RESERVERT_SAK_MED_BARN]) {
            await expect(info).not.toContainText(sak.pleietrengende!.identitetsnummer);
        }
        if (scenario.kind === 'missing-id') {
            await expect(info).not.toContainText(MANUELT_BARN_ID);
            await expect(info).not.toContainText(BARN_UTEN_FAGSAK.identitetsnummer);
        }
    }

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
    if (scenario.kind === 'case') {
        await expectSelectedCase(page, scenario.fagsak);
    } else if (scenario.kind === 'new-case') {
        await expectNewCaseWithListedChild(page, scenario.childId, applicantId);
    } else if (scenario.kind === 'manual-child') {
        await expectManualChild(page);
    } else {
        await expectMissingChildId(page);
    }
    expect(mutations).toEqual([]);
};

const startCaseSelection = async (page: Page) => {
    const mutations = recordMutations(page);
    await openJournalpost(page);
    await selectApplicantAndLoadCases(page);
    return mutations;
};

test('velger ordinær OMPKS-sak uten barn og fjerner foreldede barnedetaljer', async ({ page }) => {
    const mutations = await startCaseSelection(page);
    const barnId = ORDINÆR_SAK_MED_BARN.pleietrengende!.identitetsnummer;

    await selectCase(page, ORDINÆR_SAK_MED_BARN);
    await selectCase(page, ORDINÆR_SAK_UTEN_BARN, ORDINÆR_SAK_MED_BARN, barnId);

    expect(mutations).toEqual([]);
});

test('velger ordinær OMPKS-sak med barn', async ({ page }) => {
    const mutations = await startCaseSelection(page);

    await selectCase(page, ORDINÆR_SAK_MED_BARN);

    expect(mutations).toEqual([]);
});

test('velger reservert OMPKS-sak med barn', async ({ page }) => {
    const mutations = await startCaseSelection(page);

    await selectCase(page, RESERVERT_SAK_MED_BARN);

    expect(mutations).toEqual([]);
});

test('velger reservert OMPKS-sak uten barn og fjerner foreldede barnedetaljer', async ({ page }) => {
    const mutations = await startCaseSelection(page);
    const barnId = RESERVERT_SAK_MED_BARN.pleietrengende!.identitetsnummer;

    await selectCase(page, RESERVERT_SAK_MED_BARN);
    await selectCase(page, RESERVERT_SAK_UTEN_BARN, RESERVERT_SAK_MED_BARN, barnId);

    expect(mutations).toEqual([]);
});

for (const scenario of MODAL_SCENARIO) {
    test(scenario.navn, async ({ page }) => {
        const mutations = await startCaseSelection(page);
        await selectCase(page, scenario.fagsak);

        await expectAndCancelModal(page, scenario, mutations);
    });
}

test('reserverer ny OMPKS-sak, velger barn og avbryter modalene for listebarn og manuelt barn', async ({
    page,
}) => {
    const mutations = await startCaseSelection(page);
    await selectCase(page, RESERVERT_SAK_UTEN_BARN);

    const childrenResponsePromise = page.waitForResponse(
        (response) =>
            isResponse(response, 'GET', ApiPath.BARN_GET) &&
            response.request().headers()['x-nav-norskident'] === SØKER_ID,
    );
    await page.getByLabel('Reserver saksnummer til ny fagsak').check();
    const childrenResponse = await childrenResponsePromise;
    expect(childrenResponse.status()).toBe(200);
    expect(childrenResponse.fromServiceWorker()).toBe(true);
    expect(childrenResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await childrenResponse.json()).toEqual(barnFixture);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toBeChecked();
    await expect(page.getByLabel('Velg fagsak')).toBeDisabled();
    await expect(page.getByLabel('Velg fagsak')).toHaveValue('');
    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(RESERVERT_SAK_UTEN_BARN.fagsakId);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
    await childSelect.selectOption(BARN_MED_FAGSAK.identitetsnummer);
    await expect(childSelect).toHaveValue(BARN_MED_FAGSAK.identitetsnummer);
    await expectPanelField(page, 'Barnets ID:', BARN_MED_FAGSAK.identitetsnummer);
    const warning = page.locator('[data-test-id="pleietrengendeHarFagsak"]');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(SAK_FOR_BARN.fagsakId);
    await expect(warning).toContainText(BARN_MED_FAGSAK.identitetsnummer);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await childSelect.selectOption(BARN_UTEN_FAGSAK.identitetsnummer);
    await expectNewCaseWithListedChild(page, BARN_UTEN_FAGSAK.identitetsnummer);
    for (const handling of ['Fortsett', 'Vent'] as const) {
        await expectAndCancelModal(
            page,
            { kind: 'new-case', handling, childId: BARN_UTEN_FAGSAK.identitetsnummer },
            mutations,
        );
    }

    await page.getByLabel('Det gjelder et annet barn').check();
    await expect(page.getByLabel('Det gjelder et annet barn')).toBeChecked();
    await expect(childSelect).toBeDisabled();
    await expect(journalpostpanel(page).getByText('Barnets ID:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(BARN_UTEN_FAGSAK.identitetsnummer);
    const manualChild = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
    await expect(manualChild).toBeVisible();
    await expect(manualChild).toBeEnabled();
    await expect(manualChild).toHaveValue('');
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await installPersonHandler(page, MANUELT_BARN_PERSON);
    const personResponses: Promise<Response | null>[] = [];
    page.on('request', (request) => {
        if (request.method() === 'GET' && new URL(request.url()).pathname === ApiPath.PERSON) {
            personResponses.push(request.response());
        }
    });
    await manualChild.fill(MANUELT_BARN_ID);
    await expectManualChild(page);
    for (const handling of ['Fortsett', 'Vent'] as const) {
        await expectAndCancelModal(
            page,
            { kind: 'manual-child', handling, childId: MANUELT_BARN_ID },
            mutations,
        );
    }

    await page.getByLabel('Pleietrengende har ikke fødselsnummer').check();
    await expectMissingChildId(page);
    await expectAndCancelModal(page, { kind: 'missing-id', handling: 'Vent' }, mutations);

    for (const responsePromise of personResponses) {
        const response = await responsePromise;
        if (!response) throw new Error('Personoppslaget ble ikke besvart.');
        expect(response.request().headers()['x-nav-norskident']).toBe(MANUELT_BARN_ID);
        expect(response.status()).toBe(200);
        expect(response.fromServiceWorker()).toBe(true);
        expect(await response.json()).toEqual(MANUELT_BARN_PERSON);
    }
    expect(mutations).toEqual([]);
});

test('nullstiller OMPKS, bytter søker og bekrefter opprinnelig søker på nytt', async ({ page }) => {
    const mutations = await startCaseSelection(page);
    await selectCase(page, RESERVERT_SAK_UTEN_BARN);

    const originalChildren = waitForLookup(page, ApiPath.BARN_GET, SØKER_ID);
    await page.getByLabel('Reserver saksnummer til ny fagsak').check();
    await expectLookup(await originalChildren, SØKER_ID, barnFixture);
    await page.getByLabel('Det gjelder et annet barn').check();
    await installPersonHandler(page, MANUELT_BARN_PERSON);
    const manualPerson = waitForLookup(page, ApiPath.PERSON, MANUELT_BARN_ID);
    await page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true }).fill(MANUELT_BARN_ID);
    await expectLookup(await manualPerson, MANUELT_BARN_ID, MANUELT_BARN_PERSON);
    await expectManualChild(page);
    await page.getByLabel('Pleietrengende har ikke fødselsnummer').check();
    await expectMissingChildId(page);

    await page.getByRole('radio', { name: 'Nei', exact: true }).check();
    await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
    await expect(page.getByLabel('Reserver saksnummer til ny fagsak')).toHaveCount(0);
    await expect(page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Pleietrengende har ikke fødselsnummer')).toHaveCount(0);
    await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(MANUELT_BARN_ID);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await installApplicantHandlers(page, NY_SØKER_ID);
    await installPersonHandler(page, NY_SØKER_PERSON);
    const replacementCases = waitForLookup(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, NY_SØKER_ID);
    const replacementChildren = waitForLookup(page, ApiPath.BARN_GET, NY_SØKER_ID);
    const replacementPerson = waitForLookup(page, ApiPath.PERSON, NY_SØKER_ID);
    const replacementInput = page.getByLabel('Søkers fødselsnummer eller D-nummer:');
    await replacementInput.fill(NY_SØKER_ID);
    const [casesResponse, childrenResponse, personResponse] = await Promise.all([
        replacementCases, replacementChildren, replacementPerson,
    ]);
    await expectLookup(casesResponse, NY_SØKER_ID, FAGSAKER);
    await expectLookup(childrenResponse, NY_SØKER_ID, barnFixture);
    await expectLookup(personResponse, NY_SØKER_ID, NY_SØKER_PERSON);
    await expect(replacementInput).toHaveValue(NY_SØKER_ID);
    await expectPanelField(page, 'Søkers ID:', NY_SØKER_ID);
    await expect(journalpostpanel(page)).not.toContainText(SØKER_ID);
    await expect(journalpostpanel(page)).not.toContainText(MANUELT_BARN_ID);
    await expect(journalpostpanel(page)).not.toContainText(RESERVERT_SAK_UTEN_BARN.fagsakId);
    await page.getByLabel('Velg hvilket barn det gjelder').selectOption(BARN_UTEN_FAGSAK.identitetsnummer);
    await expectNewCaseWithListedChild(page, BARN_UTEN_FAGSAK.identitetsnummer, NY_SØKER_ID);

    for (const handling of ['Fortsett', 'Vent'] as const) {
        await expectAndCancelModal(
            page,
            { kind: 'new-case', handling, childId: BARN_UTEN_FAGSAK.identitetsnummer },
            mutations,
            NY_SØKER_ID,
        );
    }

    const originalCases = waitForLookup(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, SØKER_ID);
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    await expectLookup(await originalCases, SØKER_ID, FAGSAKER);
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expect(journalpostpanel(page)).not.toContainText(NY_SØKER_ID);
    await expect(journalpostpanel(page).getByText('Barnets ID:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(BARN_UTEN_FAGSAK.identitetsnummer);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();
    expect(mutations).toEqual([]);
});

test('kontrollerer OMPKS-gating med to søkere og avbryter begge modalene', async ({ page }) => {
    const mutations = await startCaseSelection(page);
    const reservation = page.getByLabel('Reserver saksnummer til ny fagsak');
    const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
    const twoApplicants = page.getByLabel(
        'Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)',
    );
    const secondApplicant = page.getByLabel('Fødselsnummer annen søker:', { exact: true });

    await expect(page.getByRole('radio', { name: 'Ja', exact: true })).toBeChecked();
    const childrenResponse = waitForLookup(page, ApiPath.BARN_GET, SØKER_ID);
    await reservation.check();
    await expectLookup(await childrenResponse, SØKER_ID, barnFixture);
    await expect(reservation).toBeChecked();
    await expect(childSelect).toHaveValue('');
    await expectPanelField(page, 'Søkers ID:', SØKER_ID);
    await expect(journalpostpanel(page).getByText('Barnets ID:', { exact: true })).toHaveCount(0);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await twoApplicants.check();
    await expect(twoApplicants).toBeChecked();
    await expect(page.locator('[data-test-id="infoOmRegisteringAvToSokere"]')).toBeVisible();
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenSøker"]')).toBeVisible();

    await installPersonHandler(page, ANNEN_SØKER_PERSON);
    const personResponse = waitForLookup(page, ApiPath.PERSON, ANNEN_SØKER_ID);
    await secondApplicant.fill(ANNEN_SØKER_ID);
    await expectLookup(await personResponse, ANNEN_SØKER_ID, ANNEN_SØKER_PERSON);
    await expect(secondApplicant).toHaveValue(ANNEN_SØKER_ID);
    await expect(page.getByText('Navn: Annen søker Test', { exact: true })).toBeVisible();
    await expect(page.locator('[data-test-id="toSøkereIngenAnnenSøker"]')).toHaveCount(0);
    await expect(page.locator('[data-test-id="toSøkereIngenPleietrengende"]')).toBeVisible();
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    await childSelect.selectOption(BARN_UTEN_FAGSAK.identitetsnummer);
    await expectNewCaseWithListedChild(page, BARN_UTEN_FAGSAK.identitetsnummer);
    await expect(page.locator('[data-test-id="toSøkereIngenPleietrengende"]')).toHaveCount(0);

    for (const handling of ['Fortsett', 'Vent'] as const) {
        await expectAndCancelModal(
            page,
            { kind: 'new-case', handling, childId: BARN_UTEN_FAGSAK.identitetsnummer },
            mutations,
        );
        await expect(twoApplicants).toBeChecked();
        await expect(secondApplicant).toHaveValue(ANNEN_SØKER_ID);
        await expect(reservation).toBeChecked();
    }
    expect(mutations).toEqual([]);
});
