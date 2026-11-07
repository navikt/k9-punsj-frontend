/// <reference types="msw-storybook-addon/csf3" />

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw/http';
import { expect, fn, mocked, userEvent, within } from 'storybook/test';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import messages from 'app/i18n/nb.json';
import { ApiPath } from 'app/apiConfig';
import JournalpostLoader from 'app/containers/JournalpostLoader';
import { rootReducer } from 'app/state/RootState';
import { redirectToLos } from 'app/utils/envUtils';
import journalpostFixture from '../../../cypress/fixtures/jpPSB300.json';
import { JOURNALPOST_LOADER_TEST_SCENARIOS } from '../../mocks/journalpostLoaderTestScenarios';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const journalpostUrl = (journalpostId: string) =>
    ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
const closeUrl = (journalpostId: string) =>
    ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId);
const journalpostResponse = (journalpostId: string) => ({ ...journalpostFixture, journalpostId });

type StoryArgs = {
    journalpostId: string;
};

const JournalpostLoaderStory = ({ journalpostId }: StoryArgs) => (
    <JournalpostLoader
        renderOnLoadComplete={() => (
            <section aria-label="Storybook-demonstrasjon">
                <h2>Journalpostinnhold lastet</h2>
                <p>
                    Syntetisk test-ID: {journalpostId}. Ingen ekte journalpost blir vist eller behandlet.
                </p>
            </section>
        )}
    />
);

const validId = JOURNALPOST_LOADER_TEST_SCENARIOS.valid;
const loadingId = JOURNALPOST_LOADER_TEST_SCENARIOS.loading;
const forbiddenId = JOURNALPOST_LOADER_TEST_SCENARIOS.forbidden;
const notFoundId = JOURNALPOST_LOADER_TEST_SCENARIOS.notFound;
const noDocumentsId = JOURNALPOST_LOADER_TEST_SCENARIOS.noDocuments;
const serverErrorId = JOURNALPOST_LOADER_TEST_SCENARIOS.serverError;
const closeNotFoundId = JOURNALPOST_LOADER_TEST_SCENARIOS.closeNotFound;
const closeAlreadyClosedId = JOURNALPOST_LOADER_TEST_SCENARIOS.closeAlreadyClosed;
const closeServerErrorId = JOURNALPOST_LOADER_TEST_SCENARIOS.closeServerError;
const closeSuccessId = JOURNALPOST_LOADER_TEST_SCENARIOS.closeSuccess;

const loadingHandler = http.get(journalpostUrl(loadingId), () => new Promise<Response>(() => undefined));
const validHandler = http.get(journalpostUrl(validId), () =>
    HttpResponse.json(journalpostResponse(validId), { status: 200 }),
);
const forbiddenHandler = http.get(journalpostUrl(forbiddenId), () => new HttpResponse(null, { status: 403 }));
const notFoundHandler = http.get(journalpostUrl(notFoundId), () => new HttpResponse(null, { status: 404 }));
const noDocumentsHandler = http.get(journalpostUrl(noDocumentsId), () =>
    HttpResponse.json({ ...journalpostResponse(noDocumentsId), dokumenter: [] }, { status: 200 }),
);
const serverErrorHandler = http.get(journalpostUrl(serverErrorId), () => new HttpResponse(null, { status: 500 }));

const closeScenario = (journalpostId: string, closeStatus: number, closeBody?: object) => ({
    journalpost: [
        http.get(journalpostUrl(journalpostId), () =>
            HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
        ),
    ],
    close: [
        http.get(closeUrl(journalpostId), () =>
            closeBody === undefined
                ? new HttpResponse(null, { status: closeStatus })
                : HttpResponse.json(closeBody, { status: closeStatus }),
        ),
    ],
});

const closeNotFoundScenario = closeScenario(closeNotFoundId, 404);
const closeAlreadyClosedScenario = closeScenario(closeAlreadyClosedId, 400, { status: 'ALLEREDE_FERDIGSTILT' });
const closeServerErrorScenario = closeScenario(closeServerErrorId, 500);
const closeSuccessScenario = closeScenario(closeSuccessId, 200, { status: 'FERDIGSTILT' });
const goToLosAction = fn().mockName('Gå til LOS');

const expectVisibleText = (text: string) => async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(within(canvasElement).findByText(text, { exact: true })).resolves.toBeVisible();
};

const closeStory = (message: string) => async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Lukk oppgaven i punsj' }));
    await expect(canvas.findByText(message, { exact: true })).resolves.toBeVisible();
    const goToLosButton = await canvas.findByRole('button', { name: 'Gå til LOS' });
    await expect(goToLosButton).toBeEnabled();
    await userEvent.click(goToLosButton);
    await expect(mocked(redirectToLos)).toHaveBeenCalledOnce();
    await expect(goToLosAction).toHaveBeenCalledOnce();
};

const meta: Meta<typeof JournalpostLoaderStory> = {
    title: 'Components/JournalpostLoader',
    component: JournalpostLoaderStory,
    args: { journalpostId: validId },
    beforeEach: () => {
        mocked(redirectToLos).mockClear();
        goToLosAction.mockClear();
        mocked(redirectToLos).mockImplementation(goToLosAction);
    },
    parameters: {
        msw: {
            handlers: {
                journalpost: [
                    validHandler,
                    loadingHandler,
                    forbiddenHandler,
                    notFoundHandler,
                    noDocumentsHandler,
                    serverErrorHandler,
                    ...closeNotFoundScenario.journalpost,
                    ...closeAlreadyClosedScenario.journalpost,
                    ...closeServerErrorScenario.journalpost,
                    ...closeSuccessScenario.journalpost,
                ],
                close: [
                    ...closeNotFoundScenario.close,
                    ...closeAlreadyClosedScenario.close,
                    ...closeServerErrorScenario.close,
                    ...closeSuccessScenario.close,
                ],
            },
        },
    },
    decorators: [
        (Story, context) => {
            const store = configureStore({ reducer: rootReducer });

            return (
                <Provider store={store}>
                    <IntlProvider messages={messages} locale="nb">
                        <MemoryRouter initialEntries={[`/journalpost/${context.args.journalpostId}`]}>
                            <Routes>
                                <Route
                                    path="/journalpost/:journalpostid/*"
                                    element={
                                        <>
                                            <div style={{ margin: '24px' }}>
                                                <Story />
                                            </div>
                                        </>
                                    }
                                />
                            </Routes>
                        </MemoryRouter>
                    </IntlProvider>
                </Provider>
            );
        },
    ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Laster: Story = {
    name: 'Laster',
    args: { journalpostId: loadingId },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).findByTestId('spinner')).resolves.toBeVisible();
    },
};

export const IkkeTilgang: Story = {
    name: '403 – ingen tilgang',
    args: { journalpostId: forbiddenId },
    play: expectVisibleText('Du har ikke tilgang til journalposten'),
};

export const IkkeFunnet: Story = {
    name: '404 – ikke funnet',
    args: { journalpostId: notFoundId },
    play: expectVisibleText('Kunne ikke finne journalpost.'),
};

export const IngenDokumenter: Story = {
    name: 'Ingen dokumenter',
    args: { journalpostId: noDocumentsId },
    play: expectVisibleText('Journalposten har ingen tilhørende dokumenter'),
};

export const Serverfeil: Story = {
    name: 'Generell feil',
    args: { journalpostId: serverErrorId },
    play: expectVisibleText('Noe gikk galt'),
};

export const Kjent409: Story = {
    name: 'Kjent 409 – lukket',
    args: { journalpostId: closeSuccessId },
    play: closeStory(`Journalposten ${closeSuccessId} har blitt lukket.`),
};

export const Lukking404: Story = {
    name: 'Lukking – 404',
    args: { journalpostId: closeNotFoundId },
    play: closeStory(`Journalposten ${closeNotFoundId} eksisterer ikke i punsj.`),
};

export const Lukking400: Story = {
    name: 'Lukking – 400',
    args: { journalpostId: closeAlreadyClosedId },
    play: closeStory(`Journalposten ${closeAlreadyClosedId} har allerede blitt lukket.`),
};

export const Lukking500: Story = {
    name: 'Lukking – 500',
    args: { journalpostId: closeServerErrorId },
    play: closeStory('Noe gikk galt. Status code: 500.'),
};
