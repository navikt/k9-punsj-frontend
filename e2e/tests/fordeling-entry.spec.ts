import { expect, test, type Page, type Response } from '@playwright/test';

import journalpost from '../../cypress/fixtures/journalpost.json' with { type: 'json' };
import jpOMPUT305 from '../../cypress/fixtures/jpOMPUT305.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const journalpostId = journalpost.journalpostId;
const søkerIdent = journalpost.norskIdent;
const fosterbarnJournalpostId = jpOMPUT305.journalpostId;
const fosterbarnSøkerIdent = jpOMPUT305.norskIdent;
const annenSøkerFnr = '02918496664';
const fosterBarnFnr = '09418531220';
const nyttSaksnummer = '1DQAW94';
const kopiertJournalpostId = '9303051';
const kopiertSaksnummer = 'KOPI305';
const fosterbarnJournalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', fosterbarnJournalpostId);
const fosterbarnBehandlingsårPath = ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace(
    '{journalpostId}',
    fosterbarnJournalpostId,
);
const fosterbarnCopyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', fosterbarnJournalpostId);
const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

type NetworkEvent = {
    kind: 'request' | 'response';
    method: string;
    path: string;
    status?: number;
};

const waitForApplicantResponse = (page: Page, path: string, applicantId: string) =>
    page.waitForResponse(
        (response) =>
            isApiResponse(response, 'GET', path) &&
            response.request().headers()['x-nav-norskident'] === applicantId,
    );

const expectApplicantResponse = (response: Response, applicantId: string) => {
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    expect(response.request().headers()['x-nav-norskident']).toBe(applicantId);
};

const openJournalpost = async (page: Page) => {
    const path = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
    const sourceResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', path),
    );
    await page.goto(`/journalpost/${journalpostId}`);

    const sourceResponse = await sourceResponsePromise;
    expect(sourceResponse.status()).toBe(200);
    expect(sourceResponse.fromServiceWorker()).toBe(true);
    expect(await sourceResponse.json()).toEqual(journalpost);
};

const openOpmutJournalpost = async (page: Page) => {
    const sourceResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', fosterbarnJournalpostPath),
    );
    await page.goto(`/journalpost/${fosterbarnJournalpostId}`);

    const sourceResponse = await sourceResponsePromise;
    expect(sourceResponse.status()).toBe(201);
    expect(sourceResponse.fromServiceWorker()).toBe(true);
    expect(await sourceResponse.json()).toEqual(jpOMPUT305);
};

const selectOmsorgspenger = async (page: Page) => {
    await page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true }).check();
};

const expectJournalpostRoute = (page: Page) =>
    expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);

const recordFosterbarnEvents = (page: Page) => {
    const events: NetworkEvent[] = [];
    const observedPaths = new Set([
        fosterbarnJournalpostPath,
        fosterbarnBehandlingsårPath,
        ApiPath.JOURNALPOST_MOTTAK,
        fosterbarnCopyPath,
    ]);

    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (observedPaths.has(path)) events.push({ kind: 'request', method: request.method(), path });
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (observedPaths.has(path)) {
            events.push({
                kind: 'response',
                method: response.request().method(),
                path,
                status: response.status(),
            });
        }
    });

    return events;
};

const installSecondApplicantHandler = async (page: Page) => {
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
        { personPath: ApiPath.PERSON, applicantId: annenSøkerFnr },
    );
};

const installFosterbarnClassificationHandlers = async (
    page: Page,
    refreshStatus: 200 | 403,
    behandlingsår: string,
) => {
    await page.evaluate(
        ({
            journalpostPath: requestJournalpostPath,
            behandlingsårPath,
            mottakPath,
            copyPath,
            journalpost: sourceJournalpost,
            refreshStatus: requestedRefreshStatus,
            behandlingsår: selectedBehandlingsår,
        }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            let classificationSucceeded = false;
            const classifiedJournalpost = {
                ...sourceJournalpost,
                erFerdigstilt: true,
                journalpostStatus: 'JOURNALFOERT',
                sak: {
                    ...sourceJournalpost.sak,
                    fagsakId: '1DQAW94',
                    sakstype: 'OMP',
                    behandlingsÅr: Number(selectedBehandlingsår),
                    reservertSaksnummer: true,
                },
            };

            msw.worker.use(
                msw.http.post(behandlingsårPath, () => new msw.HttpResponse(null, { status: 200 })),
                msw.http.post(mottakPath, () => {
                    classificationSucceeded = true;
                    return msw.HttpResponse.json({ saksnummer: '1DQAW94' }, { status: 200 });
                }),
                msw.http.post(copyPath, () =>
                    msw.HttpResponse.json(
                        {
                            nyJournalpostId: '9303051',
                            saksnummer: 'KOPI305',
                            til: '02918496664',
                            pleietrengende: null,
                            annenPart: null,
                            ytelse: 'OMP',
                        },
                        { status: 201 },
                    ),
                ),
                msw.http.get(requestJournalpostPath, () => {
                    if (!classificationSucceeded) return;
                    if (requestedRefreshStatus === 403) {
                        return msw.HttpResponse.json({ message: 'Error' }, { status: 403 });
                    }
                    return msw.HttpResponse.json(classifiedJournalpost, { status: 200 });
                }),
            );
        },
        {
            journalpostPath: fosterbarnJournalpostPath,
            behandlingsårPath: fosterbarnBehandlingsårPath,
            mottakPath: ApiPath.JOURNALPOST_MOTTAK,
            copyPath: fosterbarnCopyPath,
            journalpost: jpOMPUT305,
            refreshStatus,
            behandlingsår,
        },
    );
};

test.describe('Inngang til Fordeling', () => {
    test('viser underalternativer og velger korrigering av inntektsmelding', async ({ page }) => {
        await openJournalpost(page);

        const suboptions = [
            'Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn',
            'Korrigering av inntektsmelding omsorgspenger AG',
            'Ekstra omsorgsdager når du er midlertidig alene om omsorgen',
        ];
        for (const name of suboptions) {
            await expect(page.getByRole('radio', { name, exact: true })).toHaveCount(0);
        }

        await selectOmsorgspenger(page);
        for (const name of suboptions) {
            await expect(page.getByRole('radio', { name, exact: true })).toBeVisible();
        }

        const correction = page.getByRole('radio', {
            name: 'Korrigering av inntektsmelding omsorgspenger AG',
            exact: true,
        });
        await correction.check();
        await expect(correction).toBeChecked();

        const lookupPromise = waitForApplicantResponse(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, søkerIdent);
        const confirmation = page.getByRole('radio', { name: 'Ja', exact: true });
        await confirmation.check();
        await expect(confirmation).toBeChecked();
        expectApplicantResponse(await lookupPromise, søkerIdent);

        const reserveCase = page.getByLabel('Reserver saksnummer til ny fagsak');
        await reserveCase.check();
        await expect(reserveCase).toBeChecked();
        await expect(page.locator('[data-test-id="leggTillFosterbarnBtn"]')).toBeVisible();
        await expectJournalpostRoute(page);
    });

    test('forbereder midlertidig alene om omsorgen uten å navigere videre', async ({ page }) => {
        await openJournalpost(page);
        await selectOmsorgspenger(page);

        const subtype = page.getByRole('radio', {
            name: 'Ekstra omsorgsdager når du er midlertidig alene om omsorgen',
            exact: true,
        });
        await subtype.check();
        await expect(subtype).toBeChecked();

        const lookupPromise = waitForApplicantResponse(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, søkerIdent);
        const confirmation = page.getByRole('radio', { name: 'Ja', exact: true });
        await confirmation.check();
        await expect(confirmation).toBeChecked();
        expectApplicantResponse(await lookupPromise, søkerIdent);

        const reserveCase = page.getByLabel('Reserver saksnummer til ny fagsak');
        await reserveCase.check();
        await expect(reserveCase).toBeChecked();
        await expect(page.locator('[data-test-id="leggTillFosterbarnBtn"]')).toBeVisible();
        await expectJournalpostRoute(page);
    });

    test('forbereder alene om omsorgen uten å navigere videre', async ({ page }) => {
        await openJournalpost(page);
        await selectOmsorgspenger(page);

        const subtype = page.getByRole('radio', {
            name: 'Ekstra omsorgsdager når du er alene om omsorgen',
            exact: true,
        });
        await subtype.check();
        await expect(subtype).toBeChecked();

        const lookupPromise = waitForApplicantResponse(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, søkerIdent);
        const confirmation = page.getByRole('radio', { name: 'Ja', exact: true });
        await confirmation.check();
        await expect(confirmation).toBeChecked();
        expectApplicantResponse(await lookupPromise, søkerIdent);
        await expectJournalpostRoute(page);
    });

    test('velger direkte utbetaling uten å navigere videre', async ({ page }) => {
        await openJournalpost(page);
        await selectOmsorgspenger(page);

        const subtype = page.getByRole('radio', {
            name: 'Omsorgspenger: direkte utbetaling av omsorgspenger',
            exact: true,
        });
        await subtype.check();
        await expect(subtype).toBeChecked();
        await expectJournalpostRoute(page);
    });

    test('viser tomt fagsaksoppslag og behandlingsår for direkte utbetaling', async ({ page }) => {
        await openJournalpost(page);
        await page.evaluate(
            ({ applicantId, casesPath }) => {
                const msw = window.msw;
                if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
                msw.worker.use(
                    msw.http.get(casesPath, ({ request }) => {
                        if (request.headers.get('X-Nav-NorskIdent') !== applicantId) return;
                        return msw.HttpResponse.json([], { status: 200 });
                    }),
                );
            },
            { applicantId: søkerIdent, casesPath: ApiPath.HENT_FAGSAK_PÅ_IDENT },
        );

        await selectOmsorgspenger(page);
        const subtype = page.getByRole('radio', {
            name: 'Omsorgspenger: direkte utbetaling av omsorgspenger',
            exact: true,
        });
        await subtype.check();
        await expect(subtype).toBeChecked();

        const lookupPromise = waitForApplicantResponse(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, søkerIdent);
        const confirmation = page.getByRole('radio', { name: 'Ja', exact: true });
        await confirmation.check();
        await expect(confirmation).toBeChecked();
        const lookup = await lookupPromise;
        expectApplicantResponse(lookup, søkerIdent);
        expect(await lookup.json()).toEqual([]);

        await expect(page.getByLabel('Velg fagsak')).toHaveCount(0);
        await expect(page.getByLabel('Hvilket år gjelder dokumentet?')).toBeVisible();
        await expectJournalpostRoute(page);
    });

    test('beholder gyldig søkeridentitet uten valideringsfeil', async ({ page }) => {
        await openJournalpost(page);
        await page.getByRole('radio', { name: 'Pleiepenger sykt barn', exact: true }).check();
        await page.getByRole('radio', { name: 'Nei', exact: true }).check();

        const personResponsePromise = waitForApplicantResponse(page, ApiPath.PERSON, '28887298663');
        const casesResponsePromise = waitForApplicantResponse(page, ApiPath.HENT_FAGSAK_PÅ_IDENT, '28887298663');
        const applicant = page.getByLabel('Søkers fødselsnummer eller D-nummer:');
        await applicant.fill('28887298663');
        await applicant.press('Tab');

        expectApplicantResponse(await personResponsePromise, '28887298663');
        expectApplicantResponse(await casesResponsePromise, '28887298663');
        await expect(applicant).toHaveValue('28887298663');
        await expect(
            page.getByText('Dette er ikke et gyldig fødsels- eller D-nummer eller søker sin fødselsnummer.', {
                exact: true,
            }),
        ).toHaveCount(0);
        await expectJournalpostRoute(page);
    });
});

type FosterbarnClassificationScenario = {
    title: string;
    toSøkere: boolean;
    fosterbarn: boolean;
    refreshStatus: 200 | 403;
};

const fosterbarnClassificationScenarios: FosterbarnClassificationScenario[] = [
    {
        title: 'journalfører fosterbarn for én søker etter vellykket oppfrisking',
        toSøkere: false,
        fosterbarn: true,
        refreshStatus: 200,
    },
    {
        title: 'viser tilgangsavslag etter journalføring med fosterbarn for én søker',
        toSøkere: false,
        fosterbarn: true,
        refreshStatus: 403,
    },
    {
        title: 'journalfører fosterbarn og kopierer til søker nummer to',
        toSøkere: true,
        fosterbarn: true,
        refreshStatus: 200,
    },
    {
        title: 'beholder journalføring og kopieringsbekreftelse ved 403 for to søkere med fosterbarn',
        toSøkere: true,
        fosterbarn: true,
        refreshStatus: 403,
    },
    {
        title: 'journalfører uten fosterbarn og kopierer til søker nummer to',
        toSøkere: true,
        fosterbarn: false,
        refreshStatus: 200,
    },
    {
        title: 'journalfører uten fosterbarn for én søker',
        toSøkere: false,
        fosterbarn: false,
        refreshStatus: 200,
    },
];

test.describe('Klassifisering av direkte utbetaling med fosterbarn', () => {
    for (const scenario of fosterbarnClassificationScenarios) {
        test(scenario.title, async ({ page }) => {
            const events = recordFosterbarnEvents(page);
            await openOpmutJournalpost(page);
            await selectOmsorgspenger(page);
            await page
                .getByRole('radio', {
                    name: 'Omsorgspenger: direkte utbetaling av omsorgspenger',
                    exact: true,
                })
                .check();

            const lookupPromise = waitForApplicantResponse(
                page,
                ApiPath.HENT_FAGSAK_PÅ_IDENT,
                fosterbarnSøkerIdent,
            );
            const confirmation = page.getByRole('radio', { name: 'Ja', exact: true });
            await confirmation.check();
            await expect(confirmation).toBeChecked();
            expectApplicantResponse(await lookupPromise, fosterbarnSøkerIdent);

            if (scenario.toSøkere) {
                await installSecondApplicantHandler(page);
                await page
                    .getByLabel('Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)')
                    .check();
                const personLookup = waitForApplicantResponse(page, ApiPath.PERSON, annenSøkerFnr);
                const secondApplicant = page.getByLabel('Fødselsnummer annen søker:');
                await secondApplicant.fill(annenSøkerFnr);
                expectApplicantResponse(await personLookup, annenSøkerFnr);
                await expect(secondApplicant).toHaveValue(annenSøkerFnr);
                await expect(page.getByText('Navn: TUNGSINDIG KAKE')).toBeVisible();
            }

            const reserveCase = page.getByLabel('Reserver saksnummer til ny fagsak');
            await reserveCase.check();
            await expect(reserveCase).toBeChecked();

            const addFosterbarn = page.locator('[data-test-id="leggTillFosterbarnBtn"]');
            await expect(addFosterbarn).toBeVisible();
            if (scenario.fosterbarn) {
                await addFosterbarn.click();
                await page.getByLabel('Barnets fødselsnummer:').fill(fosterBarnFnr);
                await expect(page.getByLabel('Barnets fødselsnummer:')).toHaveValue(fosterBarnFnr);
            }

            const yearSelect = page.getByLabel('Hvilket år gjelder dokumentet?');
            await expect(yearSelect).toBeVisible();
            const yearOption = yearSelect.locator('option').nth(1);
            await expect(yearOption).toBeEnabled();
            const behandlingsår = await yearOption.getAttribute('value');
            if (!behandlingsår) throw new Error('Et aktivt behandlingsår mangler i valgene.');
            await yearSelect.selectOption(behandlingsår);
            await expect(yearSelect).toHaveValue(behandlingsår);

            const continueButton = page.locator('[data-test-id="journalførOgFortsett"]');
            const holdButton = page.locator('[data-test-id="journalførOgVent"]');
            await expect(continueButton).toBeEnabled();
            await expect(holdButton).toBeEnabled();
            await continueButton.click();

            const dialog = page.getByRole('dialog');
            const info = dialog.locator('[data-test-id="klassifiseringInfo"]');
            if (scenario.fosterbarn) {
                await expect(info.getByText('Fosterbarn ID:', { exact: true })).toBeVisible();
                await expect(info.getByText(fosterBarnFnr, { exact: true })).toBeVisible();
            } else {
                await expect(info.getByText('Fosterbarn ID:', { exact: true })).toHaveCount(0);
            }

            const yearResponsePromise = page.waitForResponse((response) =>
                isApiResponse(response, 'POST', fosterbarnBehandlingsårPath),
            );
            const classificationResponsePromise = page.waitForResponse((response) =>
                isApiResponse(response, 'POST', ApiPath.JOURNALPOST_MOTTAK),
            );
            const copyResponsePromise = scenario.toSøkere
                ? page.waitForResponse((response) => isApiResponse(response, 'POST', fosterbarnCopyPath))
                : undefined;
            const refreshResponsePromise = page.waitForResponse((response) =>
                isApiResponse(response, 'GET', fosterbarnJournalpostPath),
            );
            await installFosterbarnClassificationHandlers(page, scenario.refreshStatus, behandlingsår);
            await dialog.getByRole('button', { name: 'Journalfør journalposten' }).click();

            const yearResponse = await yearResponsePromise;
            expect(yearResponse.status()).toBe(200);
            expect(yearResponse.fromServiceWorker()).toBe(true);
            expect(yearResponse.request().headers()['x-nav-norskident']).toBe(fosterbarnSøkerIdent);
            expect(yearResponse.request().postDataJSON()).toEqual({ behandlingsAar: behandlingsår });

            const classificationResponse = await classificationResponsePromise;
            expect(classificationResponse.status()).toBe(200);
            expect(classificationResponse.fromServiceWorker()).toBe(true);
            expect(classificationResponse.request().headers()['x-nav-norskident']).toBe(fosterbarnSøkerIdent);
            const classificationBody = classificationResponse.request().postDataJSON();
            expect(classificationBody).toMatchObject({
                journalpostId: fosterbarnJournalpostId,
                brukerIdent: fosterbarnSøkerIdent,
                fagsakYtelseTypeKode: 'OMP',
            });
            if (scenario.fosterbarn) {
                expect(classificationBody.barnAktørIder).toEqual([fosterBarnFnr]);
            } else {
                expect(classificationBody).not.toHaveProperty('barnAktørIder');
            }
            expect(await classificationResponse.json()).toEqual({ saksnummer: nyttSaksnummer });

            if (scenario.toSøkere && copyResponsePromise) {
                const copyResponse = await copyResponsePromise;
                expect(copyResponse.status()).toBe(201);
                expect(copyResponse.fromServiceWorker()).toBe(true);
                expect(copyResponse.request().postDataJSON()).toEqual({
                    til: annenSøkerFnr,
                    ytelse: 'OMP_UT',
                    behandlingsÅr: Number(behandlingsår),
                });
                expect(await copyResponse.json()).toEqual({
                    nyJournalpostId: kopiertJournalpostId,
                    saksnummer: kopiertSaksnummer,
                    til: annenSøkerFnr,
                    pleietrengende: null,
                    annenPart: null,
                    ytelse: 'OMP',
                });
            }

            const refreshResponse = await refreshResponsePromise;
            expect(refreshResponse.status()).toBe(scenario.refreshStatus);
            expect(refreshResponse.fromServiceWorker()).toBe(true);
            if (scenario.refreshStatus === 200) {
                expect(await refreshResponse.json()).toEqual({
                    ...jpOMPUT305,
                    erFerdigstilt: true,
                    journalpostStatus: 'JOURNALFOERT',
                    sak: {
                        ...jpOMPUT305.sak,
                        fagsakId: nyttSaksnummer,
                        sakstype: 'OMP',
                        behandlingsÅr: Number(behandlingsår),
                        reservertSaksnummer: true,
                    },
                });
            }

            const expectedEvents: NetworkEvent[] = [
                { kind: 'request', method: 'POST', path: fosterbarnBehandlingsårPath },
                { kind: 'response', method: 'POST', path: fosterbarnBehandlingsårPath, status: 200 },
                { kind: 'request', method: 'POST', path: ApiPath.JOURNALPOST_MOTTAK },
                { kind: 'response', method: 'POST', path: ApiPath.JOURNALPOST_MOTTAK, status: 200 },
            ];
            if (scenario.toSøkere) {
                expectedEvents.push(
                    { kind: 'request', method: 'POST', path: fosterbarnCopyPath },
                    { kind: 'response', method: 'POST', path: fosterbarnCopyPath, status: 201 },
                );
            }
            expectedEvents.push(
                { kind: 'request', method: 'GET', path: fosterbarnJournalpostPath },
                { kind: 'response', method: 'GET', path: fosterbarnJournalpostPath, status: scenario.refreshStatus },
            );
            const yearRequestIndex = events.findIndex(
                (event) =>
                    event.kind === 'request' && event.method === 'POST' && event.path === fosterbarnBehandlingsårPath,
            );
            expect(yearRequestIndex).toBeGreaterThanOrEqual(0);
            expect(events.slice(yearRequestIndex)).toEqual(expectedEvents);

            if (scenario.refreshStatus === 403) {
                await expect(
                    dialog.getByText(
                        'Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.',
                        { exact: true },
                    ),
                ).toBeVisible();
                await expect(
                    dialog.getByText('Du har ikke tilgang til å jobbe videre med journalposten.', { exact: true }),
                ).toBeVisible();
                await expect(dialog.getByRole('button', { name: 'Gå til LOS', exact: true })).toBeEnabled();
                await expect(dialog.getByText(/Kopi av journalposten er opprettet/)).toHaveCount(
                    scenario.toSøkere ? 1 : 0,
                );
                await expect(page.getByText(/Registrer søknad - direkte utbetaling omsorgspenger/i)).toHaveCount(0);
            } else if (scenario.toSøkere) {
                await expect(
                    dialog.getByText('Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.'),
                ).toBeVisible();
                const copyConfirmation = dialog.getByText(/Kopi av journalposten er opprettet/);
                await expect(copyConfirmation).toContainText(annenSøkerFnr);
                const nextButton = dialog.getByRole('button', { name: 'Videre', exact: true });
                await expect(nextButton).toBeEnabled();
                await nextButton.click();
                await expect(page.getByText(/Registrer søknad - direkte utbetaling omsorgspenger/i)).toBeVisible();
            } else {
                await expect(page.getByText(/Registrer søknad - direkte utbetaling omsorgspenger/i)).toBeVisible();
            }
        });
    }
});
