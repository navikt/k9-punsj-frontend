import { expect, test, type Page, type Request, type Response } from '@playwright/test';

import barn from '../../src/mocks/fixtures/barn.json' with { type: 'json' };
import journalpost from '../../src/mocks/fixtures/jpUkjent310.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const selectedChild = barn.barn[2];
const selectedChildLabel = `${selectedChild.fornavn} ${selectedChild.etternavn} - ${selectedChild.identitetsnummer}`;
const manualChildIdent = '24420167209';
const annenSøkerIdent = '02918496664';
const annenPartIdent = '24420167209';
const infoOmKopiTekst = 'Det opprettes en ny oppgave i LOS. Original journalpost endres ikke.';
const copyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpostId);
const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);

const isApiResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

const recordCopyRequests = (page: Page) => {
    const requests: string[] = [];
    page.on('request', (request: Request) => {
        if (request.method() === 'POST' && new URL(request.url()).pathname === copyPath) {
            requests.push(`${request.method()} ${copyPath}`);
        }
    });
    return requests;
};

const openJournalpost = async (page: Page) => {
    const responsePromise = page.waitForResponse((response) =>
        isApiResponse(response, 'GET', journalpostPath),
    );
    await page.goto(`/journalpost/${journalpostId}`);
    const response = await responsePromise;

    expect(response.status()).toBe(201);
    expect(response.fromServiceWorker()).toBe(true);
    expect(await response.json()).toEqual(journalpost);
};

const selectDocumentType = async (page: Page, choice: string, omsorgspenger = false) => {
    if (omsorgspenger) {
        await page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true }).check();
    }
    await page.getByRole('radio', { name: choice, exact: true }).check();
};

const expectCopyUnavailable = (page: Page) =>
    expect(page.locator('[data-test-id="kopierJournalpostBtn"]')).toBeDisabled();
const expectCopyAvailable = (page: Page) =>
    expect(page.locator('[data-test-id="kopierJournalpostBtn"]')).toBeEnabled();

const expectNoCopyAndOriginalRoute = async (page: Page, requests: string[]) => {
    expect(requests).toEqual([]);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpostId}`);
};

const benefitVariants = [
    { name: 'Pleiepenger', choice: 'Pleiepenger sykt barn', flow: 'child-list' },
    {
        name: 'Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn',
        choice: 'Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn',
        flow: 'child-list',
        omsorgspenger: true,
    },
    {
        name: 'Ekstra omsorgsdager når du er alene om omsorgen',
        choice: 'Ekstra omsorgsdager når du er alene om omsorgen',
        flow: 'child-list',
        omsorgspenger: true,
    },
    {
        name: 'Ekstra omsorgsdager når du er midlertidig alene om omsorgen',
        choice: 'Ekstra omsorgsdager når du er midlertidig alene om omsorgen',
        flow: 'other-party',
        omsorgspenger: true,
    },
    {
        name: 'Omsorgspenger: direkte utbetaling av omsorgspenger',
        choice: 'Omsorgspenger: direkte utbetaling av omsorgspenger',
        flow: 'processing-year',
        omsorgspenger: true,
    },
    {
        name: 'Korrigering av inntektsmelding omsorgspenger AG',
        choice: 'Korrigering av inntektsmelding omsorgspenger AG',
        flow: 'processing-year',
        omsorgspenger: true,
    },
    {
        name: 'Pleiepenger i livets sluttfase',
        choice: 'Pleiepenger i livets sluttfase',
        flow: 'manual-child',
    },
] as const;

test('viser grunnopplysninger og dokumentvalg for en allerede behandlet journalpost', async ({ page }) => {
    const copyRequests = recordCopyRequests(page);
    await openJournalpost(page);

    const pdf = page.getByTitle('pdf');
    await expect(pdf).toBeVisible();
    await page.getByRole('button', { name: 'Skjul', exact: true }).click();
    await expect(pdf).toBeHidden();

    const panel = page.locator('.journalpostpanel');
    await expect(panel.getByText('Journalpostnummer:', { exact: true })).toBeVisible();
    await expect(panel.getByText(journalpostId, { exact: true })).toBeVisible();
    await expect(panel.getByText('Søkers ID:', { exact: true })).toBeVisible();
    await expect(panel.getByText(norskIdent, { exact: true })).toBeVisible();
    await expect(panel.getByText('Sakstype:', { exact: true })).toHaveCount(0);

    await expect(page.locator('[data-test-id="infoJournalpostAlleredeBehandlet"]')).toBeVisible();
    await expect(page.getByText('Dette gjelder:', { exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Pleiepenger sykt barn', exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Pleiepenger i livets sluttfase', exact: true })).toBeVisible();
    await page.getByRole('radio', { name: 'Omsorgspenger/omsorgsdager', exact: true }).check();

    for (const choice of [
        'Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn',
        'Ekstra omsorgsdager når du er alene om omsorgen',
        'Ekstra omsorgsdager når du er midlertidig alene om omsorgen',
        'Omsorgspenger: direkte utbetaling av omsorgspenger',
        'Korrigering av inntektsmelding omsorgspenger AG',
    ]) {
        await expect(page.getByRole('radio', { name: choice, exact: true })).toBeVisible();
    }

    await expect(page.getByRole('radio', { name: 'Annet', exact: true })).toHaveCount(0);
    await expectCopyUnavailable(page);
    await expectNoCopyAndOriginalRoute(page, copyRequests);
});

for (const variant of benefitVariants) {
    test(`aktiverer Kopier når vilkårene er oppfylt for ${variant.name}`, async ({ page }) => {
        const copyRequests = recordCopyRequests(page);
        await openJournalpost(page);
        await selectDocumentType(page, variant.choice, 'omsorgspenger' in variant);
        await expectCopyUnavailable(page);
        await expect(page.getByText('Kopier journalpost til annen søker', { exact: true })).toBeVisible();

        if (variant.flow === 'child-list') {
            const childSelect = page.getByLabel('Velg hvilket barn det gjelder');
            await childSelect.selectOption({ label: selectedChildLabel });
            await expect(childSelect).toHaveValue(selectedChild.identitetsnummer);
            await expectCopyAvailable(page);

            const otherChild = page.getByLabel('Det gjelder et annet barn');
            await otherChild.check();
            await expectCopyUnavailable(page);
            const manualCareRecipient = page.getByLabel('Pleietrengendes fødselsnummer:');
            await manualCareRecipient.fill(manualChildIdent);
            await expect(manualCareRecipient).toHaveValue(manualChildIdent);
            await expectCopyAvailable(page);

            await otherChild.uncheck();
            await expect(childSelect).toBeVisible();
            await page.locator('[data-test-id="toSokereCheckbox"]').check();
            await expect(page.getByText(infoOmKopiTekst, { exact: true })).toBeVisible();
            const annenSøker = page.getByLabel('Fødselsnummer annen søker:');
            await annenSøker.fill(annenSøkerIdent);
            await expect(annenSøker).toHaveValue(annenSøkerIdent);
            await childSelect.selectOption({ label: selectedChildLabel });
            await expect(childSelect).toHaveValue(selectedChild.identitetsnummer);
            await expectCopyAvailable(page);
        } else if (variant.flow === 'other-party') {
            const annenPart = page.getByLabel('Fødselsnummer annen part:');
            await annenPart.fill(annenPartIdent);
            await expect(annenPart).toHaveValue(annenPartIdent);
            await expectCopyAvailable(page);

            await page.locator('[data-test-id="toSokereCheckbox"]').check();
            await expect(page.getByText(infoOmKopiTekst, { exact: true })).toBeVisible();
            const annenSøker = page.getByLabel('Fødselsnummer annen søker:');
            await annenSøker.fill(annenSøkerIdent);
            await expect(annenSøker).toHaveValue(annenSøkerIdent);
            await expect(annenPart).toHaveValue(annenPartIdent);
            await expectCopyAvailable(page);
        } else if (variant.flow === 'processing-year') {
            const yearSelect = page.locator('[data-test-id="valgAvbehandlingsÅr"]');
            await yearSelect.selectOption({ index: 1 });
            const selectedYear = await yearSelect.inputValue();
            expect(selectedYear).not.toBe('');
            await expect(yearSelect).toHaveValue(selectedYear);
            await expectCopyAvailable(page);

            await page.locator('[data-test-id="toSokereCheckbox"]').check();
            await expect(page.getByText(infoOmKopiTekst, { exact: true })).toBeVisible();
            const annenSøker = page.getByLabel('Fødselsnummer annen søker:');
            await annenSøker.fill(annenSøkerIdent);
            await expect(annenSøker).toHaveValue(annenSøkerIdent);
            await expect(yearSelect).toHaveValue(selectedYear);
            await expectCopyAvailable(page);
        } else {
            const careRecipient = page.getByLabel('Pleietrengendes fødselsnummer:');
            await careRecipient.fill(manualChildIdent);
            await expectCopyAvailable(page);

            await page.locator('[data-test-id="toSokereCheckbox"]').check();
            await expect(page.getByText(infoOmKopiTekst, { exact: true })).toBeVisible();
            const annenSøker = page.getByLabel('Fødselsnummer annen søker:');
            await annenSøker.fill(annenSøkerIdent);
            await expect(annenSøker).toHaveValue(annenSøkerIdent);
            await expectCopyAvailable(page);

            await careRecipient.fill(norskIdent);
            await expect(page.getByText('Dette er ikke et gyldig fødsels- eller D-nummer eller søker sin fødselsnummer.')).toHaveCount(
                0,
            );
            await expect(
                page.getByText(
                    'Du korrigerer partsforholdet på en journalført journalpost. Kopien opprettes med annen søker som søker og nåværende søker som pleietrengende. Original journalpost endres ikke.',
                    { exact: true },
                ),
            ).toBeVisible();
            await expectCopyAvailable(page);
        }

        await expectNoCopyAndOriginalRoute(page, copyRequests);
    });
}
