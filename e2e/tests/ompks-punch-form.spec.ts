import { expect, test, type Page, type Request, type Response } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpost from '../../cypress/fixtures/jpOMPKS302.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const JOURNALPOST_ID = journalpost.journalpostId;
const SØKER_ID = journalpost.norskIdent;
const FAGSAK = fagsaker[11];
const BARN_ID = FAGSAK.pleietrengende!.identitetsnummer;
const SAK_ID = FAGSAK.fagsakId;
const ROOT_PATH = `/journalpost/${JOURNALPOST_ID}/omsorgspenger-kronisk-sykt-barn`;
const DATO = '2025-03-20';
const TID = '14:15';
const ENDELIG_TID = '14:16';
const MELLOMLAGRING_TID = '14:17';
const RELEASE_REJECTED_SAVE_PATH = '/__e2e/ompks/release-rejected-save';

type Application = {
    soeknadId: string;
    soekerId: string;
    mottattDato: string;
    klokkeslett: string;
    barn: { norskIdent: string; foedselsdato: string | null };
    journalposter: string[];
    harInfoSomIkkeKanPunsjes: boolean;
    harMedisinskeOpplysninger: boolean;
    metadata?: null;
    k9saksnummer?: string | null;
};

const initialApplication = (id: string): Application => ({
    soeknadId: id,
    soekerId: SØKER_ID,
    mottattDato: '2020-10-12',
    klokkeslett: '12:53',
    barn: { norskIdent: BARN_ID, foedselsdato: null },
    journalposter: [JOURNALPOST_ID],
    harInfoSomIkkeKanPunsjes: false,
    harMedisinskeOpplysninger: false,
    metadata: null,
    k9saksnummer: SAK_ID,
});

const classifiedJournalpost = {
    ...journalpost,
    erFerdigstilt: true,
    journalpostStatus: 'JOURNALFOERT',
    sak: {
        ...journalpost.sak,
        fagsakId: SAK_ID,
        sakstype: 'OMP_KS',
        pleietrengendeIdent: BARN_ID,
        reservertSaksnummer: false,
    },
};

const formPath = (id: string) => ApiPath.OMP_KS_SOKNAD_GET.replace('{id}', id);
const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const checkedResponse = async (promise: Promise<Response>, status: number) => {
    const response = await promise;
    expect(response.status()).toBe(status);
    expect(response.fromServiceWorker()).toBe(true);
    return response;
};

const installScenario = async (page: Page, initialDraft: Application, shouldReject: boolean) => {
    await page.evaluate(
        ({ paths, source, classified, fagsak, initial, reject, applicantId, childId, caseId, journalpostId, heldTime, releaseRejectedSavePath }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');

            let classifiedOk = false;
            let saved: Application | undefined;
            let storedJournalposts: string[] = [];
            let entityCaseId: string | undefined;
            let releaseSave: (() => void) | undefined;
            let releaseRejectedSave!: () => void;
            let notifyRejectedSaveStarted!: () => void;
            const rejectedSaveGate = new Promise<void>((resolve) => { releaseRejectedSave = resolve; });
            const rejectedSaveStarted = new Promise<void>((resolve) => { notifyRejectedSaveStarted = resolve; });

            const toDto = (body: Application): Application => ({
                ...body,
                barn: { ...body.barn, foedselsdato: body.barn.foedselsdato || null },
                metadata: body.metadata ?? null,
                k9saksnummer: body.k9saksnummer ?? null,
            });
            const receipt = (draft: Application, journalposts: string[]) => ({
                søknadId: draft.soeknadId,
                versjon: '1.0.0',
                mottattDato: `${draft.mottattDato}T${draft.klokkeslett}:00+01:00`,
                søker: { norskIdentitetsnummer: draft.soekerId },
                språk: 'nb',
                ytelse: {
                    type: 'OMP_UTV_KS',
                    barn: { norskIdentitetsnummer: draft.barn.norskIdent, fødselsdato: null },
                    kroniskEllerFunksjonshemming: true,
                    høyereRisikoForFravær: null,
                    høyereRisikoForFraværBeskrivelse: null,
                    dataBruktTilUtledning: null,
                },
                journalposter: journalposts.map((id) => ({
                    journalpostId: id,
                    inneholderInfomasjonSomIkkeKanPunsjes: null,
                    inneholderInformasjonSomIkkeKanPunsjes: draft.harInfoSomIkkeKanPunsjes,
                    inneholderMedisinskeOpplysninger: draft.harMedisinskeOpplysninger,
                })),
                begrunnelseForInnsending: { tekst: null },
                kildesystem: 'punsj',
            });
            const persist = (draft: Application) => {
                saved = toDto(draft);
                storedJournalposts = [...new Set([...storedJournalposts, ...draft.journalposter])];
            };

            msw.worker.use(
                msw.http.get(paths.journalpost, () =>
                    msw.HttpResponse.json(classifiedOk ? classified : source, { status: classifiedOk ? 200 : 201 }),
                ),
                msw.http.get(paths.cases, () => msw.HttpResponse.json([fagsak])),
                msw.http.post(paths.classify, () => {
                    classifiedOk = true;
                    return msw.HttpResponse.json({ saksnummer: caseId });
                }),
                msw.http.get(paths.list, () =>
                    msw.HttpResponse.json({ søker: applicantId, fagsakTypeKode: 'OMP_KS', søknader: [] }),
                ),
                msw.http.post(paths.create, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !body || typeof body !== 'object' ||
                        !('journalpostId' in body) || body.journalpostId !== journalpostId ||
                        !('norskIdent' in body) || body.norskIdent !== applicantId ||
                        !('pleietrengendeIdent' in body) || body.pleietrengendeIdent !== childId ||
                        !('k9saksnummer' in body) || body.k9saksnummer !== caseId
                    ) {
                        return msw.HttpResponse.json({ feil: 'Ugyldig oppretting' }, { status: 400 });
                    }
                    entityCaseId = caseId;
                    persist(initial);
                    return msw.HttpResponse.json(initial, { status: 201 });
                }),
                msw.http.get(`${paths.form}:id`, ({ params }) => {
                    if (!saved || String(params.id) !== saved.soeknadId || !entityCaseId) {
                        return msw.HttpResponse.json({ feil: 'Søknaden finnes ikke' }, { status: 404 });
                    }
                    return msw.HttpResponse.json({ ...saved, k9saksnummer: entityCaseId });
                }),
                msw.http.put(paths.update, async ({ request }) => {
                    const body = toDto((await request.json()) as Application);
                    if (!saved || body.soeknadId !== saved.soeknadId) {
                        return msw.HttpResponse.json({ feil: 'Søknaden finnes ikke' }, { status: 400 });
                    }
                    if (body.klokkeslett === heldTime) {
                        if (reject) {
                            notifyRejectedSaveStarted();
                            await rejectedSaveGate;
                        } else {
                            await new Promise<void>((resolve) => { releaseSave = resolve; });
                        }
                    }
                    persist(body);
                    return msw.HttpResponse.json(body);
                }),
                msw.http.post(releaseRejectedSavePath, () => {
                    if (!reject) return msw.HttpResponse.json({ feil: 'Feil scenario' }, { status: 400 });
                    releaseRejectedSave();
                    return msw.HttpResponse.json({ released: true });
                }),
                msw.http.post(paths.validate, async ({ request }) => {
                    const body = toDto((await request.json()) as Application);
                    if (!saved || body.soeknadId !== saved.soeknadId) {
                        return msw.HttpResponse.json({ feil: 'Søknaden finnes ikke' }, { status: 400 });
                    }
                    if (reject) {
                        if (body.klokkeslett === heldTime) await rejectedSaveStarted;
                        return msw.HttpResponse.json({
                            søknadIdDto: body.soeknadId,
                            feil: [{
                                felt: 'syntetisk',
                                feilkode: 'SYNTHETIC_OMPKS_REJECTION',
                                feilmelding: 'Syntetisk backendavslag for OMPKS-validering.',
                            }],
                        }, { status: 400 });
                    }
                    const result = receipt(body, storedJournalposts);
                    persist(body);
                    return msw.HttpResponse.json(result, { status: 202 });
                }),
                msw.http.post(paths.send, async ({ request }) => {
                    const body = await request.json();
                    if (
                        !saved || !entityCaseId || !body || typeof body !== 'object' ||
                        !('soeknadId' in body) || body.soeknadId !== saved.soeknadId ||
                        !('norskIdent' in body) || body.norskIdent !== saved.soekerId ||
                        request.headers.get('X-Nav-NorskIdent') !== saved.soekerId
                    ) {
                        return msw.HttpResponse.json({ feil: 'Lagret søknad finnes ikke' }, { status: 400 });
                    }
                    if (!reject && !releaseSave) {
                        return msw.HttpResponse.json({ feil: 'Den utsatte lagringen mangler' }, { status: 409 });
                    }
                    const result = receipt(saved, storedJournalposts);
                    releaseSave?.();
                    return msw.HttpResponse.json(result, { status: 202 });
                }),
            );
        },
        {
            paths: {
                journalpost: ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
                cases: ApiPath.HENT_FAGSAK_PÅ_IDENT,
                classify: ApiPath.JOURNALPOST_MOTTAK,
                list: ApiPath.OMP_KS_EKSISTERENDE_SOKNADER_FIND,
                create: ApiPath.OMP_KS_SOKNAD_CREATE,
                form: ApiPath.OMP_KS_SOKNAD_GET.split('{id}')[0],
                update: ApiPath.OMP_KS_SOKNAD_UPDATE,
                validate: ApiPath.OMP_KS_SOKNAD_VALIDER,
                send: ApiPath.OMP_KS_SOKNAD_SUBMIT,
            },
            source: journalpost,
            classified: classifiedJournalpost,
            fagsak: FAGSAK,
            initial: initialDraft,
            reject: shouldReject,
            applicantId: SØKER_ID,
            childId: BARN_ID,
            caseId: SAK_ID,
            journalpostId: JOURNALPOST_ID,
            heldTime: ENDELIG_TID,
            releaseRejectedSavePath: RELEASE_REJECTED_SAVE_PATH,
        },
    );
};

const openDraft = async (page: Page, initial: Application, reject: boolean) => {
    const sends: string[] = [];
    const validations: string[] = [];
    page.on('request', (request) => {
        if (request.method() === 'POST') {
            const path = new URL(request.url()).pathname;
            if (path === ApiPath.OMP_KS_SOKNAD_SUBMIT) sends.push(path);
            if (path === ApiPath.OMP_KS_SOKNAD_VALIDER) validations.push(path);
        }
    });
    const source = page.waitForResponse((response) =>
        isResponse(response, 'GET', ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID)),
    );
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    expect(await (await checkedResponse(source, 201)).json()).toEqual(journalpost);
    await installScenario(page, initial, reject);

    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    await page.getByLabel('Velg fagsak').selectOption(SAK_ID);
    await page.locator('[data-test-id="journalførOgFortsett"]').click();
    let classificationResponded = false;
    const classification = page.waitForResponse((response) => {
        if (!isResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK)) return false;
        classificationResponded = true;
        return true;
    });
    const refresh = page.waitForRequest((request) =>
        classificationResponded && request.method() === 'GET' &&
        new URL(request.url()).pathname === ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
    );
    await page.locator('[data-test-id="klassifiserModal"]').getByRole('button', { name: 'Journalfør journalposten' }).click();
    const classified = await checkedResponse(classification, 200);
    expect(classified.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(classified.request().postDataJSON()).toMatchObject({
        journalpostId: JOURNALPOST_ID, brukerIdent: SØKER_ID, pleietrengendeIdent: BARN_ID,
        fagsakYtelseTypeKode: 'OMP_KS', saksnummer: SAK_ID,
    });
    const refreshed = await (await refresh).response();
    if (!refreshed) throw new Error('Oppfrisking av journalposten mangler svar.');
    expect(await (await checkedResponse(Promise.resolve(refreshed), 200)).json()).toEqual(classifiedJournalpost);
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/`);
    await page.getByRole('radio', { name: 'Registrer søknad - ekstra omsorgsdager' }).check();

    const list = page.waitForResponse((response) => isResponse(response, 'GET', ApiPath.OMP_KS_EKSISTERENDE_SOKNADER_FIND));
    const create = page.waitForResponse((response) => isResponse(response, 'POST', ApiPath.OMP_KS_SOKNAD_CREATE));
    const form = page.waitForResponse((response) => isResponse(response, 'GET', formPath(initial.soeknadId)));
    await page.getByRole('button', { name: 'Bekreft', exact: true }).click();
    const listResponse = await checkedResponse(list, 200);
    expect(listResponse.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(await listResponse.json()).toEqual({ søker: SØKER_ID, fagsakTypeKode: 'OMP_KS', søknader: [] });
    const created = await checkedResponse(create, 201);
    expect(created.request().postDataJSON()).toEqual({
        journalpostId: JOURNALPOST_ID, norskIdent: SØKER_ID, pleietrengendeIdent: BARN_ID, k9saksnummer: SAK_ID,
    });
    expect(await created.json()).toEqual(initial);
    const fetched = await checkedResponse(form, 200);
    expect(await fetched.json()).toEqual(initial);
    await expect(page).toHaveURL((url) => url.pathname === `${ROOT_PATH}/skjema/${initial.soeknadId}/`);
    await expect(page.getByLabel('Mottatt dato:')).toHaveValue('12.10.2020');
    return { sends, validations };
};

const expectedValues = (id: string) => ({
    soeknadId: id, soekerId: SØKER_ID, mottattDato: DATO, klokkeslett: TID,
    barn: { norskIdent: BARN_ID }, journalposter: [JOURNALPOST_ID],
    harInfoSomIkkeKanPunsjes: true, harMedisinskeOpplysninger: true,
});

const fillForm = async (page: Page, id: string) => {
    const save = async (action: () => Promise<void>, predicate: (body: Application) => boolean) => {
        const response = page.waitForResponse((item) =>
            isResponse(item, 'PUT', ApiPath.OMP_KS_SOKNAD_UPDATE) && predicate(item.request().postDataJSON()),
        );
        await action();
        return checkedResponse(response, 200);
    };
    await page.getByRole('radio', { name: 'Ikke relevant', exact: true }).check();
    await page.getByLabel('Mottatt dato:').fill('20.03.2025');
    await save(() => page.getByLabel('Mottatt dato:').press('Tab'), (body) => body.mottattDato === DATO);
    await page.getByLabel('Mottatt klokkeslett').fill(TID);
    await save(() => page.getByRole('heading', { name: 'Opplysninger om søknaden' }).click(), (body) => body.klokkeslett === TID);
    await save(() => page.getByLabel('Dokumentet inneholder medisinske opplysninger').check(), (body) => body.harMedisinskeOpplysninger);
    const saved = await save(
        () => page.getByLabel('Dokumentet inneholder andre opplysninger som ikke er registrert i skjemaet').check(),
        (body) => body.harInfoSomIkkeKanPunsjes && body.harMedisinskeOpplysninger,
    );
    expect(saved.request().postDataJSON()).toMatchObject(expectedValues(id));
    const dto = await saved.json();
    expect(dto).toMatchObject({ ...expectedValues(id), barn: { norskIdent: BARN_ID, foedselsdato: null }, metadata: null, k9saksnummer: null });
    return dto;
};

const readStored = async (page: Page, id: string) => {
    const response = page.waitForResponse((item) => isResponse(item, 'GET', formPath(id)));
    await page.evaluate(async (path) => {
        const result = await fetch(path);
        if (!result.ok) throw new Error(`Lesing av lagret utkast feilet: ${result.status}`);
        await result.json();
    }, formPath(id));
    return (await checkedResponse(response, 200)).json();
};

const validate = async (page: Page, id: string, status: number, time = TID) => {
    const response = page.waitForResponse((item) => isResponse(item, 'POST', ApiPath.OMP_KS_SOKNAD_VALIDER));
    await page.getByRole('button', { name: 'Send inn', exact: true }).click();
    const result = await checkedResponse(response, status);
    expect(result.request().postDataJSON()).toMatchObject({ ...expectedValues(id), klokkeslett: time });
    return result;
};

test('lagrer, validerer og sender OMPKS etter bekreftelse', async ({ page }) => {
    const id = '7b8f4e3a-8bc0-4ed3-b180-000000000001';
    const { sends, validations } = await openDraft(page, initialApplication(id), false);
    const saved = await fillForm(page, id);
    expect(await readStored(page, id)).toEqual({ ...saved, k9saksnummer: SAK_ID });
    expect(sends).toEqual([]);
    expect(validations).toEqual([]);
    await page.getByLabel('Mottatt klokkeslett').fill(ENDELIG_TID);
    const pendingSave = page.waitForResponse((response) =>
        isResponse(response, 'PUT', ApiPath.OMP_KS_SOKNAD_UPDATE) &&
        response.request().postDataJSON().klokkeslett === ENDELIG_TID,
    );
    const validation = await validate(page, id, 202, ENDELIG_TID);
    const validationBody = validation.request().postDataJSON() as Application;
    expect(await readStored(page, id)).toEqual({
        ...validationBody, barn: { norskIdent: BARN_ID, foedselsdato: null }, metadata: null, k9saksnummer: SAK_ID,
    });
    const validationReceipt = await validation.json();
    expect(validationReceipt).toMatchObject({
        søknadId: id, mottattDato: `${DATO}T${ENDELIG_TID}:00+01:00`, søker: { norskIdentitetsnummer: SØKER_ID },
        ytelse: { type: 'OMP_UTV_KS', barn: { norskIdentitetsnummer: BARN_ID }, kroniskEllerFunksjonshemming: true },
        journalposter: [{ journalpostId: JOURNALPOST_ID, inneholderInformasjonSomIkkeKanPunsjes: true, inneholderMedisinskeOpplysninger: true }],
    });
    const review = page.getByRole('dialog', { name: 'validertOMPKSSoknadModal' });
    await expect(review).toBeVisible();
    await expect(review).toContainText('20.03.2025');
    await expect(review).toContainText(ENDELIG_TID);
    await expect(review).toContainText('Dokumentet inneholder medisinske opplysninger: Ja');
    await expect(review).toContainText('Dokumentet inneholder andre opplysninger som ikke er registrert i skjemaet: Ja');
    expect(sends).toEqual([]);
    await review.getByRole('button', { name: 'Videre', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'erdusikkermodal' });
    await expect(confirmation).toBeVisible();
    expect(sends).toEqual([]);
    const send = page.waitForResponse((item) => isResponse(item, 'POST', ApiPath.OMP_KS_SOKNAD_SUBMIT));
    await confirmation.getByRole('button', { name: 'Send inn', exact: true }).click();
    const sent = await checkedResponse(send, 202);
    expect(sent.request().headers()['x-nav-norskident']).toBe(SØKER_ID);
    expect(sent.request().postDataJSON()).toEqual({ norskIdent: SØKER_ID, soeknadId: id });
    expect(await sent.json()).toEqual(validationReceipt);
    const lateSave = await checkedResponse(pendingSave, 200);
    expect(lateSave.request().postDataJSON()).toMatchObject({ ...expectedValues(id), klokkeslett: ENDELIG_TID });
    await expect(page.getByText(/^Opplysningene er sendt til behandling\./)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oppsummering', exact: true })).toBeVisible();
    await expect(page.getByText(/20\.03\.2025 - 14:16/)).toBeVisible();
    await expect(page.getByText('Dokumentet inneholder medisinske opplysninger: Ja')).toBeVisible();
    await expect(page.getByText('Dokumentet inneholder andre opplysninger som ikke er registrert i skjemaet: Ja')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tilbake til LOS', exact: true })).toBeVisible();
    expect(sends).toHaveLength(1);
});

test('viser OMPKS-valideringsavslag og beholder utkastet uten innsending', async ({ page }) => {
    const id = '7b8f4e3a-8bc0-4ed3-b180-000000000002';
    const { sends, validations } = await openDraft(page, initialApplication(id), true);
    const saved = await fillForm(page, id);
    expect(await readStored(page, id)).toEqual({ ...saved, k9saksnummer: SAK_ID });
    expect(validations).toEqual([]);
    const saveRequests: Request[] = [];
    page.on('request', (request) => {
        if (
            request.method() === 'PUT' &&
            new URL(request.url()).pathname === ApiPath.OMP_KS_SOKNAD_UPDATE &&
            request.postDataJSON().klokkeslett === ENDELIG_TID
        ) saveRequests.push(request);
    });
    let heldSave: Request | undefined;
    try {
        await page.getByLabel('Mottatt klokkeslett').fill(ENDELIG_TID);
        const validation = await validate(page, id, 400, ENDELIG_TID);
        heldSave = saveRequests[0];
        expect(heldSave).toBeDefined();
        expect(await validation.json()).toEqual({
            søknadIdDto: id,
            feil: [{ felt: 'syntetisk', feilkode: 'SYNTHETIC_OMPKS_REJECTION', feilmelding: 'Syntetisk backendavslag for OMPKS-validering.' }],
        });
        expect(saved.klokkeslett).toBe(TID);
        expect(await readStored(page, id)).toEqual({ ...saved, k9saksnummer: SAK_ID });
        await expect(page.getByText('Syntetisk backendavslag for OMPKS-validering.', { exact: false })).toBeVisible();
        await expect(page.getByLabel('Mottatt dato:')).toHaveValue('20.03.2025');
        await expect(page.getByLabel('Mottatt klokkeslett')).toHaveValue(ENDELIG_TID);
        await expect(page.getByLabel('Dokumentet inneholder medisinske opplysninger')).toBeChecked();
        await expect(page.getByLabel('Dokumentet inneholder andre opplysninger som ikke er registrert i skjemaet')).toBeChecked();
        await expect(page.getByRole('dialog', { name: 'validertOMPKSSoknadModal' })).toHaveCount(0);
        await expect(page.getByRole('dialog', { name: 'erdusikkermodal' })).toHaveCount(0);
        expect(sends).toEqual([]);
    } finally {
        await page.evaluate(async (path) => {
            const response = await fetch(path, { method: 'POST' });
            if (!response.ok) throw new Error(`Frigjøring av lagring feilet: ${response.status}`);
        }, RELEASE_REJECTED_SAVE_PATH);
    }
    if (!heldSave) throw new Error('Utsatt lagring ble ikke sendt.');
    const saveResponse = await heldSave.response();
    if (!saveResponse) throw new Error('Utsatt lagring mangler svar.');
    await checkedResponse(Promise.resolve(saveResponse), 200);
    expect(await readStored(page, id)).toMatchObject({ ...expectedValues(id), klokkeslett: ENDELIG_TID, k9saksnummer: SAK_ID });

    const interim = page.waitForResponse((response) =>
        isResponse(response, 'POST', ApiPath.OMP_KS_SOKNAD_VALIDER) &&
        response.request().postDataJSON().klokkeslett === MELLOMLAGRING_TID,
    );
    await page.getByLabel('Mottatt klokkeslett').fill(MELLOMLAGRING_TID);
    await page.getByRole('heading', { name: 'Opplysninger om søknaden' }).click();
    const interimResponse = await checkedResponse(interim, 400);
    expect(interimResponse.request().postDataJSON()).toMatchObject({ ...expectedValues(id), klokkeslett: MELLOMLAGRING_TID });
    await expect(page.getByRole('dialog', { name: 'validertOMPKSSoknadModal' })).toHaveCount(0);
    expect(sends).toEqual([]);
});
