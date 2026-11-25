import { expect, test, type Page, type Response } from '@playwright/test';

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

type ModalScenario = {
    navn: string;
    fagsak: Fagsak;
    handling: Handling;
};

const MODAL_SCENARIO = [
    {
        navn: 'avbryter Vent-modal for ordinær sak uten barn',
        fagsak: ORDINÆR_SAK_UTEN_BARN,
        handling: 'Vent',
    },
    {
        navn: 'avbryter Fortsett-modal for ordinær sak med barn',
        fagsak: ORDINÆR_SAK_MED_BARN,
        handling: 'Fortsett',
    },
    {
        navn: 'avbryter Vent-modal for ordinær sak med barn',
        fagsak: ORDINÆR_SAK_MED_BARN,
        handling: 'Vent',
    },
    {
        navn: 'avbryter Fortsett-modal for reservert sak med barn',
        fagsak: RESERVERT_SAK_MED_BARN,
        handling: 'Fortsett',
    },
    {
        navn: 'avbryter Vent-modal for reservert sak med barn',
        fagsak: RESERVERT_SAK_MED_BARN,
        handling: 'Vent',
    },
    {
        navn: 'avbryter Vent-modal for reservert sak uten barn',
        fagsak: RESERVERT_SAK_UTEN_BARN,
        handling: 'Vent',
    },
] satisfies ModalScenario[];

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

const installApplicantCasesHandler = async (page: Page) => {
    await page.evaluate(
        ({ casesPath, applicantId, cases }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            msw.worker.use(
                msw.http.get(casesPath, ({ request }) => {
                    if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                    return msw.HttpResponse.json(cases, { status: 200 });
                }),
            );
        },
        { casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT, applicantId: SØKER_ID, cases: FAGSAKER },
    );
};

const selectApplicantAndLoadCases = async (page: Page) => {
    await installApplicantCasesHandler(page);
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

const expectAndCancelModal = async (
    page: Page,
    scenario: ModalScenario,
    mutations: string[],
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
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    await expect(info.getByText('Saksnummer:', { exact: true })).toBeVisible();
    await expect(info.getByText(scenario.fagsak.fagsakId, { exact: true })).toBeVisible();
    await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    await expect(info.getByText(PERIODE, { exact: true })).toBeVisible();

    const childId = scenario.fagsak.pleietrengende?.identitetsnummer;
    if (childId) {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toBeVisible();
        await expect(info.getByText(childId, { exact: true })).toBeVisible();
    } else {
        await expect(info.getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
        for (const sak of [ORDINÆR_SAK_MED_BARN, RESERVERT_SAK_MED_BARN]) {
            await expect(info).not.toContainText(sak.pleietrengende!.identitetsnummer);
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
    await expectSelectedCase(page, scenario.fagsak);
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
