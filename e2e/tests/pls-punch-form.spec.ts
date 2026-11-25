import { expect, test, type Page, type Request, type Response } from '@playwright/test';

import fagsaker from '../../src/mocks/fixtures/fagsaker.json' with { type: 'json' };
import journalpost from '../../src/mocks/fixtures/jpPILS301.json' with { type: 'json' };
import pilsSoknad from '../../src/mocks/fixtures/pilsSoknad.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = journalpost.journalpostId;
const SØKER_ID = journalpost.norskIdent;
const FAGSAK = fagsaker[5];
const PLEIETRENGENDE_ID = FAGSAK.pleietrengende!.identitetsnummer;
const SØKNAD_ID = 'e75bc609-b17e-48b0-9749-3c102dd47216';
const JOURNALPOST_PATH = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const APPLICATION_PATH = ApiPath.PLS_SOKNAD_GET.replace('{id}', SØKNAD_ID);
const FORM_PATH = `/journalpost/${JOURNALPOST_ID}/pleiepenger-i-livets-sluttfase/skjema/${SØKNAD_ID}/`;
const FOM = '2024-11-04';
const TOM = '2024-11-08';

type Application = {
    soeknadId: string;
    soekerId: string;
    journalposter: string[];
    mottattDato: string;
    klokkeslett: string;
    pleietrengende: { norskIdent: string; foedselsdato?: string | null };
    soeknadsperiode: { fom?: string; tom?: string }[] | null;
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;
    begrunnelseForInnsending: { tekst: string } | null;
    k9saksnummer?: string | null;
};

const initialApplication = {
    ...pilsSoknad,
    soeknadId: SØKNAD_ID,
    soekerId: SØKER_ID,
    journalposter: [JOURNALPOST_ID],
    mottattDato: '2024-11-08',
    klokkeslett: '12:53',
    pleietrengende: { norskIdent: PLEIETRENGENDE_ID, foedselsdato: null },
    k9saksnummer: FAGSAK.fagsakId,
} satisfies Application;

const expectedValues = {
    soeknadId: SØKNAD_ID,
    soekerId: SØKER_ID,
    journalposter: [JOURNALPOST_ID],
    mottattDato: '2024-11-11',
    klokkeslett: '14:15',
    pleietrengende: { norskIdent: PLEIETRENGENDE_ID },
    soeknadsperiode: [{ fom: FOM, tom: TOM }],
    harMedisinskeOpplysninger: true,
};

const backendError = {
    søknadIdDto: SØKNAD_ID,
    feil: [
        {
            felt: 'ytelse.søknadsperiode[0]',
            feilkode: 'UGYLDIG_VERDI',
            feilmelding: 'Søknadsperioden kan ikke behandles.',
        },
    ],
};

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const observeWrites = (page: Page) => {
    const requests: Request[] = [];
    const paths = new Set([
        ApiPath.PLS_SOKNAD_UPDATE,
        ApiPath.PLS_SOKNAD_VALIDER,
        ApiPath.PLS_SOKNAD_SUBMIT,
    ]);
    page.on('request', (request) => {
        if (paths.has(new URL(request.url()).pathname)) requests.push(request);
    });
    return {
        validations: () => requests.filter((request) => new URL(request.url()).pathname === ApiPath.PLS_SOKNAD_VALIDER),
        sends: () => requests.filter((request) => new URL(request.url()).pathname === ApiPath.PLS_SOKNAD_SUBMIT),
    };
};

const installScenarioHandlers = async (page: Page, rejectValidation: boolean) => {
    await page.evaluate(
        ({ paths, source, fagsak, application, validationError, shouldReject }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classified = false;
            let savedApplication: Application = application;
            const classifiedJournalpost = {
                ...source,
                erFerdigstilt: true,
                journalpostStatus: 'JOURNALFOERT',
                sak: {
                    ...source.sak,
                    fagsakId: fagsak.fagsakId,
                    sakstype: 'PPN',
                    gyldigPeriode: fagsak.gyldigPeriode,
                    pleietrengendeIdent: application.pleietrengende.norskIdent,
                    reservertSaksnummer: false,
                },
            };
            const k9Response = (draft: Application, storedJournalposts: string[]) => ({
                søknadId: draft.soeknadId,
                versjon: '1.0.0',
                mottattDato: `${draft.mottattDato}T${draft.klokkeslett}:00+01:00`,
                søker: { norskIdentitetsnummer: draft.soekerId },
                språk: 'nb',
                ytelse: {
                    type: 'PLEIEPENGER_LIVETS_SLUTTFASE',
                    pleietrengende: {
                        norskIdentitetsnummer: draft.pleietrengende.norskIdent,
                        fødselsdato: null,
                    },
                    søknadsperiode: (draft.soeknadsperiode || []).map(({ fom, tom }) => `${fom}/${tom}`),
                    trekkKravPerioder: [],
                    opptjeningAktivitet: {},
                    arbeidstid: {
                        arbeidstakerList: [],
                        frilanserArbeidstidInfo: null,
                        selvstendigNæringsdrivendeArbeidstidInfo: null,
                    },
                    bosteder: { perioder: {}, perioderSomSkalSlettes: {} },
                    utenlandsopphold: { perioder: {}, perioderSomSkalSlettes: {} },
                    lovbestemtFerie: { perioder: {} },
                    uttak: {
                        perioder: Object.fromEntries(
                            (draft.soeknadsperiode || []).map(({ fom, tom }) => [
                                `${fom}/${tom}`,
                                { timerPleieAvBarnetPerDag: 'PT7H30M' },
                            ]),
                        ),
                    },
                    dataBruktTilUtledning: null,
                },
                journalposter: storedJournalposts.map((journalpostId) => ({
                    journalpostId,
                    inneholderInfomasjonSomIkkeKanPunsjes: null,
                    inneholderInformasjonSomIkkeKanPunsjes: draft.harInfoSomIkkeKanPunsjes,
                    inneholderMedisinskeOpplysninger: draft.harMedisinskeOpplysninger,
                })),
                begrunnelseForInnsending: draft.begrunnelseForInnsending,
                kildesystem: 'punsj',
            });

            msw.worker.use(
                msw.http.get(paths.journalpost, () =>
                    msw.HttpResponse.json(classified ? classifiedJournalpost : source, {
                        status: classified ? 200 : 201,
                    }),
                ),
                msw.http.get(paths.cases, () => msw.HttpResponse.json([fagsak])),
                msw.http.post(paths.classify, () => {
                    classified = true;
                    return msw.HttpResponse.json({ saksnummer: fagsak.fagsakId });
                }),
                msw.http.get(paths.lookup, () =>
                    msw.HttpResponse.json({ søker: application.soekerId, fagsakTypeKode: 'PPN', søknader: [] }),
                ),
                msw.http.post(paths.create, () =>
                    msw.HttpResponse.json(savedApplication, { status: 201 }),
                ),
                msw.http.get(paths.form, () => msw.HttpResponse.json(savedApplication)),
                msw.http.post(paths.periods, () => msw.HttpResponse.json([])),
                msw.http.put(paths.update, async ({ request }) => {
                    savedApplication = (await request.json()) as Application;
                    return msw.HttpResponse.json(savedApplication, { status: 200 });
                }),
                msw.http.post(paths.validate, async ({ request }) => {
                    const incoming = (await request.json()) as Application;
                    if (shouldReject) {
                        return msw.HttpResponse.json(validationError, { status: 400 });
                    }
                    const receipt = k9Response(incoming, savedApplication.journalposter);
                    savedApplication = incoming;
                    return msw.HttpResponse.json(receipt, { status: 202 });
                }),
                msw.http.post(paths.send, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !body ||
                        typeof body !== 'object' ||
                        !('soeknadId' in body) ||
                        body.soeknadId !== savedApplication.soeknadId ||
                        !('norskIdent' in body) ||
                        body.norskIdent !== savedApplication.soekerId ||
                        request.headers.get('X-Nav-NorskIdent') !== savedApplication.soekerId
                    ) {
                        return msw.HttpResponse.json({ error: 'Lagret søknad finnes ikke' }, { status: 404 });
                    }
                    return msw.HttpResponse.json(k9Response(savedApplication, savedApplication.journalposter), { status: 202 });
                }),
            );
        },
        {
            paths: {
                journalpost: JOURNALPOST_PATH,
                cases: ApiPath.HENT_FAGSAK_PÅ_IDENT,
                classify: ApiPath.JOURNALPOST_MOTTAK,
                lookup: ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND,
                create: ApiPath.PLS_SOKNAD_CREATE,
                form: APPLICATION_PATH,
                periods: ApiPath.SAKER_PERIODER,
                update: ApiPath.PLS_SOKNAD_UPDATE,
                validate: ApiPath.PLS_SOKNAD_VALIDER,
                send: ApiPath.PLS_SOKNAD_SUBMIT,
            },
            source: journalpost,
            fagsak: FAGSAK,
            application: initialApplication,
            validationError: backendError,
            shouldReject: rejectValidation,
        },
    );
};

const expectResponse = async (promise: Promise<Response>, status: number) => {
    const response = await promise;
    expect(response.status()).toBe(status);
    expect(response.fromServiceWorker()).toBe(true);
    return response;
};

const openDraftThroughUI = async (page: Page, rejectValidation = false) => {
    const initialResponse = page.waitForResponse((response) => isApiResponse(response, 'GET', JOURNALPOST_PATH));
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    expect(await (await expectResponse(initialResponse, 201)).json()).toEqual(journalpost);
    await installScenarioHandlers(page, rejectValidation);

    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    await page.getByLabel('Velg fagsak').selectOption(FAGSAK.fagsakId);
    await page.locator('[data-test-id="journalførOgFortsett"]').click();
    const classification = page.locator('[data-test-id="klassifiserModal"]');
    await expect(classification).toContainText(FAGSAK.fagsakId);
    await expect(classification).toContainText(PLEIETRENGENDE_ID);

    let classificationResponded = false;
    const classificationResponse = page.waitForResponse((response) => {
        if (!isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK)) return false;
        classificationResponded = true;
        return true;
    });
    const refreshRequest = page.waitForRequest(
        (request) =>
            classificationResponded &&
            request.method() === 'GET' &&
            new URL(request.url()).pathname === JOURNALPOST_PATH,
    );
    await classification.getByRole('button', { name: 'Journalfør journalposten', exact: true }).click();
    const classified = await expectResponse(classificationResponse, 200);
    expect(classified.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classified.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID,
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: PLEIETRENGENDE_ID,
        fagsakYtelseTypeKode: 'PPN',
        saksnummer: FAGSAK.fagsakId,
    });
    const refreshed = await (await refreshRequest).response();
    if (!refreshed) throw new Error('Oppfrisking av journalposten mangler svar.');
    await expectResponse(Promise.resolve(refreshed), 200);
    expect(await refreshed.json()).toMatchObject({
        erFerdigstilt: true,
        sak: { fagsakId: FAGSAK.fagsakId, pleietrengendeIdent: PLEIETRENGENDE_ID },
    });

    await page.getByRole('radio', { name: 'Registrere opplysninger til k9-sak', exact: true }).check();
    const lookupPromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND),
    );
    const createPromise = page.waitForResponse((response) => isApiResponse(response, 'POST', ApiPath.PLS_SOKNAD_CREATE));
    const formPromise = page.waitForResponse((response) => isApiResponse(response, 'GET', APPLICATION_PATH));
    const periodsPromise = page.waitForResponse((response) => isApiResponse(response, 'POST', ApiPath.SAKER_PERIODER));
    await page.getByRole('button', { name: 'Bekreft', exact: true }).click();

    const lookup = await expectResponse(lookupPromise, 200);
    expect(lookup.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await lookup.json()).toEqual({ søker: SØKER_ID, fagsakTypeKode: 'PPN', søknader: [] });
    const created = await expectResponse(createPromise, 201);
    expect(created.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID,
        norskIdent: SØKER_ID,
        pleietrengendeIdent: PLEIETRENGENDE_ID,
        k9saksnummer: FAGSAK.fagsakId,
    });
    expect(await created.json()).toEqual(initialApplication);
    expect(await (await expectResponse(formPromise, 200)).json()).toEqual(initialApplication);
    const periods = await expectResponse(periodsPromise, 200);
    expect(new URL(periods.url()).searchParams.get('saksnummer')).toBe(FAGSAK.fagsakId);
    expect(periods.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await periods.json()).toEqual([]);
    await expect(page).toHaveURL((url) => url.pathname === FORM_PATH);
    await expect(page.getByLabel('Mottatt dato:', { exact: true })).toHaveValue('08.11.2024');
};

const fillForm = async (page: Page) => {
    await page.getByRole('radio', { name: 'Ikke relevant', exact: true }).check();
    await page.getByLabel('Mottatt dato:', { exact: true }).fill('11.11.2024');
    await page.getByLabel('Mottatt klokkeslett', { exact: false }).fill('14:15');
    const period = page.getByTestId('søknadsperioder');
    await period.getByLabel('Fra og med', { exact: true }).fill('04.11.2024');
    await period.getByLabel('Til og med', { exact: true }).fill('08.11.2024');
    await period.getByLabel('Til og med', { exact: true }).press('Tab');

    const savePromise = page.waitForResponse(
        (response) =>
            isApiResponse(response, 'PUT', ApiPath.PLS_SOKNAD_UPDATE) &&
            response.request().postDataJSON().harMedisinskeOpplysninger === true,
    );
    await page.getByLabel('Dokumentet inneholder medisinske opplysninger').check();
    const saved = await expectResponse(savePromise, 200);
    expect(saved.request().postDataJSON()).toMatchObject(expectedValues);
    expect(await saved.json()).toEqual(saved.request().postDataJSON());
    return saved;
};

const validateThroughUI = async (page: Page, status: number) => {
    const validationPromise = page.waitForResponse((response) =>
        isApiResponse(response, 'POST', ApiPath.PLS_SOKNAD_VALIDER),
    );
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const validated = await expectResponse(validationPromise, status);
    expect(validated.request().postDataJSON()).toMatchObject(expectedValues);
    return validated;
};

const readStoredDraft = async (page: Page) => {
    const responsePromise = page.waitForResponse((response) => isApiResponse(response, 'GET', APPLICATION_PATH));
    await page.evaluate(async (path) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Lesing av lagret utkast feilet: ${response.status}`);
        await response.json();
    }, APPLICATION_PATH);
    return (await expectResponse(responsePromise, 200)).json();
};

test('lagrer, validerer, bekrefter og sender PLS-søknaden fra det lagrede utkastet', async ({ page }) => {
    const writes = observeWrites(page);
    await openDraftThroughUI(page);
    const saved = await fillForm(page);
    expect(writes.validations()).toHaveLength(0);
    expect(writes.sends()).toHaveLength(0);
    expect(await readStoredDraft(page)).toEqual(saved.request().postDataJSON());

    const validated = await validateThroughUI(page, 202);
    const validatedDraft = validated.request().postDataJSON();
    expect(validatedDraft).toMatchObject({ k9saksnummer: FAGSAK.fagsakId });
    expect(validatedDraft).not.toEqual(saved.request().postDataJSON());
    expect(await readStoredDraft(page)).toEqual(validatedDraft);
    const receipt = await validated.json();
    expect(receipt).toMatchObject({
        søknadId: SØKNAD_ID,
        mottattDato: '2024-11-11T14:15:00+01:00',
        søker: { norskIdentitetsnummer: SØKER_ID },
        ytelse: {
            type: 'PLEIEPENGER_LIVETS_SLUTTFASE',
            pleietrengende: { norskIdentitetsnummer: PLEIETRENGENDE_ID },
            søknadsperiode: [`${FOM}/${TOM}`],
            uttak: { perioder: { [`${FOM}/${TOM}`]: { timerPleieAvBarnetPerDag: 'PT7H30M' } } },
        },
        journalposter: [{ journalpostId: JOURNALPOST_ID, inneholderMedisinskeOpplysninger: true }],
    });
    const preview = page.getByRole('dialog', { name: 'Oppsummering', exact: true });
    await expect(preview).toBeVisible();
    await expect(preview.getByTestId('soknadsperiode')).toContainText('04.11.2024 - 08.11.2024');
    await expect(preview.getByTestId('mottakelsesdato')).toContainText('11.11.2024 - 14:15');
    await expect(preview.getByTestId('tilleggsopplysninger')).toContainText('Ja');
    expect(writes.sends()).toHaveLength(0);

    await preview.getByRole('button', { name: 'Videre', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'erdusikkermodal' });
    await expect(confirmation).toBeVisible();
    expect(writes.sends()).toHaveLength(0);
    const submitPromise = page.waitForResponse((response) => isApiResponse(response, 'POST', ApiPath.PLS_SOKNAD_SUBMIT));
    await confirmation.getByRole('button', { name: 'Send inn', exact: true }).click();
    const sent = await expectResponse(submitPromise, 202);
    expect(sent.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(sent.request().postDataJSON()).toEqual({ norskIdent: SØKER_ID, soeknadId: SØKNAD_ID });
    const sentReceipt = await sent.json();
    expect(sentReceipt.ytelse.uttak.perioder).toEqual({
        [`${FOM}/${TOM}`]: { timerPleieAvBarnetPerDag: 'PT7H30M' },
    });
    expect(sentReceipt).toEqual(receipt);

    await expect(page.getByText(/^Opplysningene er sendt til behandling\./)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oppsummering', exact: true })).toBeVisible();
    await expect(page.getByTestId('soknadsperiode')).toContainText('04.11.2024 - 08.11.2024');
    await expect(page.getByTestId('mottakelsesdato')).toContainText('11.11.2024 - 14:15');
    await expect(page.getByRole('button', { name: 'Tilbake til LOS', exact: true })).toBeVisible();
    expect(writes.sends()).toHaveLength(1);
    expect(writes.sends()[0].method()).toBe('POST');
});

test('viser backendfeil ved gyldige PLS-verdier og beholder utkastet uten å sende', async ({ page }) => {
    const writes = observeWrites(page);
    await openDraftThroughUI(page, true);
    const saved = await fillForm(page);
    expect(writes.validations()).toHaveLength(0);
    const validated = await validateThroughUI(page, 400);
    expect(await validated.json()).toEqual(backendError);
    expect(await readStoredDraft(page)).toEqual(saved.request().postDataJSON());

    await expect(page.getByText('1. Kontroller opplysningene og prøv igjen.', { exact: true })).toBeVisible();
    await expect(
        page.getByText('Skjemaet inneholder valideringsfeil. Vennligst rett opp i feilene før du sender inn.'),
    ).toBeVisible();
    await expect(page.getByText(backendError.feil[0].feilmelding, { exact: true })).toHaveCount(0);
    await expect(page.getByText(backendError.feil[0].feilkode, { exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Mottatt dato:', { exact: true })).toHaveValue('11.11.2024');
    await expect(page.getByLabel('Mottatt klokkeslett', { exact: false })).toHaveValue('14:15');
    const period = page.getByTestId('søknadsperioder');
    await expect(period.getByLabel('Fra og med', { exact: true })).toHaveValue('04.11.2024');
    await expect(period.getByLabel('Til og med', { exact: true })).toHaveValue('08.11.2024');
    await expect(page.getByRole('radio', { name: 'Ikke relevant', exact: true })).toBeChecked();
    await expect(page.getByLabel('Dokumentet inneholder medisinske opplysninger')).toBeChecked();
    await expect(page.getByRole('dialog', { name: 'Oppsummering', exact: true })).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'erdusikkermodal' })).toHaveCount(0);
    await expect(page).toHaveURL((url) => url.pathname === FORM_PATH);
    expect(writes.sends()).toHaveLength(0);
});
