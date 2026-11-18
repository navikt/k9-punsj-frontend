import { expect, test, type Response } from '@playwright/test';

import barn from '../../cypress/fixtures/barn.json' with { type: 'json' };
import fagsaker from '../../cypress/fixtures/fagsaker.json' with { type: 'json' };
import journalpost from '../../cypress/fixtures/jpPSB312.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';
import { FORDELING_PSB_SCENARIOS } from '../../src/mocks/fordelingPsbTestScenarioIds';

const sourceId = FORDELING_PSB_SCENARIOS.copyAndClose;
const copiedId = '9303181';
const target = fagsaker[2];
const selectedChild = barn.barn[2];
const copyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', sourceId);
const closePath = ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', sourceId);
const sourcePath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', sourceId);
const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

test('kopierer ferdigstilt PSB til barnets sak, lukker originalen og går til LOS', async ({ page }) => {
    const events: string[] = [];
    const mutations: string[] = [];
    const requests: string[] = [];
    let copyResponded = false;
    let sourceRefreshedAfterCopy = false;
    await page.addInitScript((path) => {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            if (typeof args[0] === 'string' && args[0] === path) {
                (window as Window & { closeResponseBody?: string }).closeResponseBody = await response.clone().text();
            }
            return response;
        };
    }, closePath);
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        const event = `${request.method()} ${path}`;
        requests.push(event);
        if (copyResponded && event === `GET ${sourcePath}`) sourceRefreshedAfterCopy = true;
        if (path === copyPath || path === closePath) events.push(`request ${event}`);
        if (
            (path.startsWith('/api/k9-punsj/') || path.startsWith('/api/k9-formidling/')) &&
            !['GET', 'HEAD'].includes(request.method())
        ) {
            mutations.push(event);
        }
    });
    page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (isResponse(response, 'POST', copyPath) && response.status() === 201) copyResponded = true;
        if (path === copyPath || path === closePath) {
            events.push(`response ${response.request().method()} ${path} ${response.status()}`);
        }
    });

    const sourceResponse = page.waitForResponse((response) => isResponse(response, 'GET', sourcePath));
    await page.goto(`/journalpost/${sourceId}`);
    const source = await sourceResponse;
    expect(source.status()).toBe(200);
    expect(source.fromServiceWorker()).toBe(true);
    expect(await source.json()).toEqual({ ...journalpost, journalpostId: sourceId });

    const hidePdf = page.getByText('Skjul', { exact: true });
    if (await hidePdf.isVisible()) await hidePdf.click();
    await expect(
        page.getByText('Journalposten er journalført, men mangler opplysninger om pleietrengende.'),
    ).toBeVisible();
    await expect(page.locator('[data-test-id="dokumenttypeRadioPanelPleiepenger"]')).toBeChecked();
    await expect(page.locator('[data-test-id="dokumenttypeRadioPanelPleiepenger"]')).toBeEnabled();
    for (const id of [
        'dokumenttypeRadioPanelOmsorgspenger',
        'dokumenttypeRadioPanelPleiepengerILivetsSluttfase',
        'dokumenttypeRadioPanelOpplæringspenger',
        'dokumenttypeRadioPanelAnnet',
    ]) {
        await expect(page.locator(`[data-test-id="${id}"]`)).toBeDisabled();
    }
    await expect(page.locator('[data-test-id="bekreftSøker-ja"]')).toBeChecked();
    await expect(page.locator('[data-test-id="bekreftSøker-nei"]')).toBeDisabled();
    await expect(page.locator('[data-test-id="journalførOgFortsett"]')).toHaveCount(0);
    await expect(page.locator('[data-test-id="journalførOgVent"]')).toHaveCount(0);
    const videre = page.locator('[data-test-id="ferdistiltJpReservertSaksnummerVidereBtn"]');
    const actions = page.locator('[data-test-id="ferdistiltJpReservertSaksnummeråpneVentLukkBrevModalBtn"]');
    await expect(videre).toBeDisabled();
    await expect(actions).toBeEnabled();
    const children = page.getByLabel('Velg hvilket barn det gjelder');
    await children.selectOption(barn.barn[0].identitetsnummer);
    await expect(videre).toBeEnabled();
    await expect(actions).toBeEnabled();
    await children.selectOption(selectedChild.identitetsnummer);
    await expect(videre).toHaveCount(0);
    await expect(actions).toHaveCount(0);
    const warning = page.locator('[data-test-id="pleietrengendeHarFagsakFerdistiltJpWarning"]');
    await expect(warning).toContainText(selectedChild.identitetsnummer);
    await expect(warning).toContainText(target.fagsakId);
    const open = page.locator('[data-test-id="kopierOgLukkJournalpostBtn"]');
    await expect(open).toBeEnabled();
    await open.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Vil du kopiere og lukke journalposten?' })).toBeVisible();
    await expect(dialog).toContainText(target.fagsakId);
    await expect(dialog).toContainText(selectedChild.identitetsnummer);
    await expect(dialog).toContainText('Den nye Journalposten vil bli kopiert og journalført mot eksisterende fagsak');
    await expect(dialog).toContainText('Denne journalposten vil bli lukket.');
    await dialog.getByRole('button', { name: 'Avbryt' }).click();
    await expect(dialog).toBeHidden();
    await expect(children).toHaveValue(selectedChild.identitetsnummer);
    expect(mutations).toEqual([]);
    await open.click();

    const copyResponse = page.waitForResponse((response) => isResponse(response, 'POST', copyPath));
    const closeResponse = page.waitForResponse((response) => isResponse(response, 'POST', closePath));
    await dialog.getByRole('button', { name: 'Kopier', exact: true }).click();
    const copy = await copyResponse;
    expect(copy.status()).toBe(201);
    expect(copy.fromServiceWorker()).toBe(true);
    expect(copy.request().headers()['content-type']).toBe('application/json');
    expect(copy.request().headers()['x-nav-norskident']).toBeUndefined();
    expect(copy.request().postDataJSON()).toEqual({
        til: journalpost.norskIdent,
        barn: selectedChild.identitetsnummer,
        ytelse: 'PSB',
    });
    expect(await copy.json()).toEqual({
        nyJournalpostId: copiedId,
        saksnummer: target.fagsakId,
        til: journalpost.norskIdent,
        pleietrengende: selectedChild.identitetsnummer,
        annenPart: null,
        ytelse: 'PSB',
    });
    const close = await closeResponse;
    expect(close.status()).toBe(200);
    expect(close.fromServiceWorker()).toBe(true);
    expect(close.request().headers()['content-type']).toBe('application/json');
    expect(close.request().headers()['x-nav-norskident']).toBeUndefined();
    expect(close.request().postDataJSON()).toEqual({
        norskIdent: journalpost.norskIdent,
        sak: { fagsakId: journalpost.sak.fagsakId, sakstype: 'FAGSAK' },
    });
    expect(await page.evaluate(() => (window as Window & { closeResponseBody?: string }).closeResponseBody)).toBe('');
    expect(events).toEqual([
        `request POST ${copyPath}`,
        `response POST ${copyPath} 201`,
        `request POST ${closePath}`,
        `response POST ${closePath} 200`,
    ]);
    await expect(dialog.getByText('Kopi av journalpost opprettet.')).toBeVisible();
    await expect(dialog.getByText('Journalposten ble lukket')).toBeVisible();
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${sourceId}`);
    expect(mutations).toEqual([`POST ${copyPath}`, `POST ${closePath}`]);
    expect(requests.some((request) => request.startsWith(`GET ${ApiPath.JOURNALPOST_LUKK_DEBUGG.split('{')[0]}`))).toBe(
        false,
    );
    expect(requests).not.toContain(`GET ${ApiPath.JOURNALPOST_GET.replace('{journalpostId}', copiedId)}`);
    expect(sourceRefreshedAfterCopy).toBe(false);
    await dialog.getByRole('button', { name: 'Tilbake til LOS' }).click();
    await expect(page).toHaveURL('http://localhost:8080/');
    await expect(page.getByRole('textbox', { name: 'Journalpost-ID' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Søk' })).toBeVisible();
    expect(mutations).toEqual([`POST ${copyPath}`, `POST ${closePath}`]);
});
