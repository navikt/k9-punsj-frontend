import { expect, test, type Page, type Response } from '@playwright/test';

import journalpost from '../../cypress/fixtures/journalpost.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const journalpostId = journalpost.journalpostId;
const søkerIdent = journalpost.norskIdent;
const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

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
    const sourceResponsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId)),
    );
    await page.goto(`/journalpost/${journalpostId}`);

    const sourceResponse = await sourceResponsePromise;
    expect(sourceResponse.status()).toBe(200);
    expect(sourceResponse.fromServiceWorker()).toBe(true);
    expect(await sourceResponse.json()).toEqual(journalpost);
};

const selectOmsorgspenger = async (page: Page) => {
    await page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true }).check();
};

const expectJournalpostRoute = (page: Page) =>
    expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);

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
