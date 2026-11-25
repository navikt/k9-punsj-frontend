import { expect, test, type Response } from '@playwright/test';

import journalpost from '../../src/mocks/fixtures/jpOMPUT305.json' with { type: 'json' };
import { ApiPath } from '../../src/app/apiConfig';

const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpost.journalpostId);
const gosysPath = ApiPath.OPPRETT_GOSYS_OPPGAVE;
const isResponse = (response: Response, method: string, path: string) =>
    response.request().method() === method && new URL(response.url()).pathname === path;

test('oppretter Gosys-oppgave for Annet etter feil og går tilbake til lokal LOS', async ({ page }) => {
    const mutations: string[] = [];
    const events: string[] = [];
    const requests: string[] = [];
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        const event = `${request.method()} ${path}`;
        requests.push(event);
        if (path === gosysPath) events.push(`request ${event}`);
        if (
            (path.startsWith('/api/k9-punsj/') || path.startsWith('/api/k9-formidling/')) &&
            !['GET', 'HEAD'].includes(request.method())
        ) {
            mutations.push(event);
        }
    });
    page.on('response', (response) => {
        if (isResponse(response, 'POST', gosysPath)) {
            events.push(`response POST ${gosysPath} ${response.status()}`);
        }
    });

    const journalpostResponse = page.waitForResponse((response) => isResponse(response, 'GET', journalpostPath));
    await page.goto(`/journalpost/${journalpost.journalpostId}`);
    const source = await journalpostResponse;
    expect(source.status()).toBe(201);
    expect(source.fromServiceWorker()).toBe(true);
    expect(await source.json()).toEqual(journalpost);

    const pdf = page.getByTitle('pdf');
    await expect(pdf).toBeVisible();
    await page.getByRole('button', { name: 'Skjul', exact: true }).click();
    await expect(pdf).toBeHidden();

    await page.evaluate(
        ({ path, journalpostId }) => {
            const msw = window.msw;
            if (!msw) throw new Error('MSW-testarbeideren er ikke tilgjengelig.');
            let attempts = 0;
            msw.worker.use(
                msw.http.post(path, async ({ request }) => {
                    const body = await request.json();
                    if (!body || typeof body !== 'object' || !('journalpostId' in body)) return;
                    if (body.journalpostId !== journalpostId) return;
                    attempts += 1;
                    return new msw.HttpResponse(null, { status: attempts === 1 ? 500 : 200 });
                }),
            );
        },
        { path: gosysPath, journalpostId: journalpost.journalpostId },
    );

    const heading = page.getByRole('heading', { name: 'Dette gjelder:', exact: true });
    await expect(heading).toBeVisible();
    const choices = heading.locator('../..').getByRole('radiogroup');
    for (const name of ['Pleiepenger sykt barn', 'Omsorgspenger/omsorgsdager', 'Pleiepenger i livets sluttfase', 'Annet']) {
        await expect(choices.getByRole('radio', { name, exact: true })).toBeVisible();
    }

    const categoriesResponse = page.waitForResponse((response) => isResponse(response, 'GET', ApiPath.GOSYS_GJELDER));
    const annet = choices.getByRole('radio', { name: 'Annet', exact: true });
    await annet.check();
    await expect(annet).toBeChecked();
    const categories = await categoriesResponse;
    expect(categories.status()).toBe(200);
    expect(categories.fromServiceWorker()).toBe(true);
    expect(await categories.json()).toMatchObject({ Omsorgspenger: 'Omsorgspenger' });

    const panel = page.locator('.journalpostpanel');
    for (const [label, value] of [
        ['Journalpostnummer:', journalpost.journalpostId],
        ['Søkers ID:', journalpost.norskIdent],
        ['Sakstype:', 'Omsorgspenger'],
    ]) {
        const field = panel.getByText(label, { exact: true }).locator('..');
        await expect(field.getByText(label, { exact: true })).toBeVisible();
        await expect(field.getByText(value, { exact: true })).toBeVisible();
    }
    await expect(page.locator('[data-test-id="toSokereCheckbox"]')).toHaveCount(0);

    const applicant = page.getByLabel('Søkers fødselsnummer eller D-nummer:');
    const category = page.getByLabel('Velg hva journalposten gjelder');
    const create = page.getByRole('button', { name: 'Opprett journalføringsoppgave i Gosys' });
    await expect(applicant).toHaveValue(journalpost.norskIdent);
    await expect(category.getByRole('option', { name: 'Omsorgspenger', exact: true })).toHaveCount(1);
    await expect(create).toBeDisabled();
    await category.selectOption('Omsorgspenger');
    await expect(create).toBeEnabled();

    const expectedBody = {
        journalpostId: journalpost.journalpostId,
        norskIdent: journalpost.norskIdent,
        gjelder: 'Omsorgspenger',
    };
    const failureResponse = page.waitForResponse((response) => isResponse(response, 'POST', gosysPath));
    await create.click();
    const failure = await failureResponse;
    expect(failure.status()).toBe(500);
    expect(failure.fromServiceWorker()).toBe(true);
    expect(failure.request().postDataJSON()).toEqual(expectedBody);
    await expect(
        page.locator('[data-test-id="opprettIGosysFeil"]').getByText('Det oppsto en feil. Prøv igjen senere.', {
            exact: true,
        }),
    ).toBeVisible();
    await expect(page.locator('[data-test-id="okGåTilLosModal"]')).toHaveCount(0);
    await expect(applicant).toHaveValue(journalpost.norskIdent);
    await expect(category).toHaveValue('Omsorgspenger');
    await expect(create).toBeEnabled();
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpost.journalpostId}`);

    const successResponse = page.waitForResponse((response) => isResponse(response, 'POST', gosysPath));
    await create.click();
    const success = await successResponse;
    expect(success.status()).toBe(200);
    expect(success.fromServiceWorker()).toBe(true);
    expect(success.request().postDataJSON()).toEqual(expectedBody);
    expect(await success.text()).toBe('');
    const dialog = page.locator('[data-test-id="okGåTilLosModal"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Journalføringsoppgave i Gosys opprettet');
    await expect(dialog).toContainText('Du blir nå tatt tilbake til oppgavekøen i LOS');
    await expect(page.locator('[data-test-id="opprettIGosysFeil"]')).toHaveCount(0);
    await expect(page).toHaveURL((url) => url.pathname === `/journalpost/${journalpost.journalpostId}`);
    expect(events).toEqual([
        `request POST ${gosysPath}`,
        `response POST ${gosysPath} 500`,
        `request POST ${gosysPath}`,
        `response POST ${gosysPath} 200`,
    ]);
    expect(mutations).toEqual([`POST ${gosysPath}`, `POST ${gosysPath}`]);
    expect(requests.some((request) => request.startsWith(`GET ${ApiPath.JOURNALPOST_LUKK_DEBUGG.split('{')[0]}`))).toBe(
        false,
    );

    await dialog.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(page).toHaveURL('http://localhost:8080/');
    await expect(page.getByRole('textbox', { name: 'Journalpost-ID' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Søk' })).toBeVisible();
    expect(mutations).toEqual([`POST ${gosysPath}`, `POST ${gosysPath}`]);
    expect(requests.some((request) => request.startsWith(`GET ${ApiPath.JOURNALPOST_LUKK_DEBUGG.split('{')[0]}`))).toBe(
        false,
    );
});
