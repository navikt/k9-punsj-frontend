import { expect, test, type Page } from '@playwright/test';

import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpostFixture from '../../cypress/fixtures/jpPILS301.json' with { type: 'json' };

const JOURNALPOST_ID = journalpostFixture.journalpostId;
const SØKER_ID = journalpostFixture.norskIdent;
const MANUELL_PLEIETRENGENDES_ID = '24420167209';
const SAKER = [fagsaker[5], fagsaker[6], fagsaker[7], fagsaker[8]];

const journalpostpanel = (page: Page) => page.locator('.journalpostpanel');
const fortsett = (page: Page) => page.locator('[data-test-id="journalførOgFortsett"]');
const vent = (page: Page) => page.locator('[data-test-id="journalførOgVent"]');

const openJournalpost = async (page: Page) => {
    await page.goto(`/journalpost/${JOURNALPOST_ID}`);
    await expect(page.getByRole('radio', { name: 'Ja' })).toBeVisible();
};

const expectPanelField = async (page: Page, label: string, value: string) => {
    const field = journalpostpanel(page).getByText(label, { exact: true });
    await expect(field).toBeVisible();
    await expect(field.locator('..').getByText(value, { exact: true })).toBeVisible();
};

test('velger PLS-saker med og uten pleietrengende', async ({ page }) => {
    await openJournalpost(page);
    await page.getByRole('radio', { name: 'Ja' }).check();

    const caseSelect = page.getByLabel('Velg fagsak');
    await expect(caseSelect).toBeEnabled();

    for (const sak of SAKER) {
        await test.step(`Velg ${sak.fagsakId}`, async () => {
            await caseSelect.selectOption(sak.fagsakId);
            await expect(caseSelect).toHaveValue(sak.fagsakId);

            const selectedInfo = page.locator('.fagsakSelectedInfo');
            await expect(selectedInfo.getByText('Pleietrengende:', { exact: true })).toBeVisible();

            const caseLink = selectedInfo.getByRole('link', { name: 'Se fagsak i K9' });
            if (sak.reservert) {
                await expect(caseLink).toHaveCount(0);
            } else {
                await expect(caseLink).toHaveAttribute('href', expect.stringContaining(sak.fagsakId));
            }

            await expectPanelField(page, 'Journalpostnummer:', JOURNALPOST_ID);
            await expectPanelField(page, 'Søkers ID:', SØKER_ID);
            await expectPanelField(page, 'Saksnummer:', sak.fagsakId);

            if (sak.pleietrengende) {
                await expect(
                    selectedInfo.getByText(`Navn: ${sak.pleietrengende.navn}`, { exact: true }),
                ).toBeVisible();
                await expect(
                    selectedInfo.getByText(`Id: ${sak.pleietrengende.identitetsnummer}`, { exact: true }),
                ).toBeVisible();
                await expectPanelField(page, 'Pleietrengendes ID:', sak.pleietrengende.identitetsnummer);
                await expect(fortsett(page)).toBeEnabled();
            } else {
                await expect(selectedInfo.getByText('ikke satt', { exact: true })).toBeVisible();
                await expect(selectedInfo.getByText(/^Navn:/)).toHaveCount(0);
                await expect(selectedInfo.getByText(/^Id:/)).toHaveCount(0);
                await expect(journalpostpanel(page).getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
                await expect(fortsett(page)).toBeDisabled();
            }

            await expect(vent(page)).toBeEnabled();
        });
    }
});

test('registrerer manuelt pleietrengende for ny PLS-sak', async ({ page }) => {
    const sakUtenPleietrengende = fagsaker[8];

    await openJournalpost(page);
    await page.getByRole('radio', { name: 'Ja' }).check();

    const caseSelect = page.getByLabel('Velg fagsak');
    await caseSelect.selectOption(sakUtenPleietrengende.fagsakId);
    await expect(caseSelect).toHaveValue(sakUtenPleietrengende.fagsakId);
    await expectPanelField(page, 'Saksnummer:', sakUtenPleietrengende.fagsakId);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeEnabled();

    await page.getByLabel('Reserver saksnummer til ny fagsak').check();
    await expect(caseSelect).toBeDisabled();
    await expect(caseSelect).toHaveValue('');
    await expect(journalpostpanel(page).getByText('Saksnummer:', { exact: true })).toHaveCount(0);
    await expect(journalpostpanel(page)).not.toContainText(sakUtenPleietrengende.fagsakId);
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeDisabled();

    const careRecipientId = page.getByLabel('Pleietrengendes fødselsnummer:', { exact: true });
    await careRecipientId.fill(MANUELL_PLEIETRENGENDES_ID);
    await expect(careRecipientId).toHaveValue(MANUELL_PLEIETRENGENDES_ID);
    await expectPanelField(page, 'Pleietrengendes ID:', MANUELL_PLEIETRENGENDES_ID);
    await expect(page.locator('[data-test-id="jornalførUtenFagsak"]')).toBeVisible();
    await expect(fortsett(page)).toBeEnabled();
    await expect(vent(page)).toBeEnabled();

    await page.getByLabel('Pleietrengende har ikke fødselsnummer', { exact: true }).check();
    await expect(careRecipientId).toBeDisabled();
    await expect(careRecipientId).toHaveValue('');
    await expect(journalpostpanel(page).getByText('Pleietrengendes ID:', { exact: true })).toHaveCount(0);
    await expect(page.locator('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]')).toBeVisible();
    await expect(fortsett(page)).toBeDisabled();
    await expect(vent(page)).toBeEnabled();
});
