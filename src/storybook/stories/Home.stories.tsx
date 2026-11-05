/// <reference types="msw-storybook-addon/csf3" />

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw/http';
import { expect, fn, mocked, userEvent, waitFor, within } from 'storybook/test';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useParams } from 'react-router';

import { ApiPath } from 'app/apiConfig';
import messages from 'app/i18n/nb.json';
import { Home } from 'app/home/Home';
import { rootReducer } from 'app/state/RootState';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
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

const loadingId = JOURNALPOST_LOADER_TEST_SCENARIOS.loading;
const forbiddenId = JOURNALPOST_LOADER_TEST_SCENARIOS.forbidden;
const notFoundId = JOURNALPOST_LOADER_TEST_SCENARIOS.notFound;
const serverErrorId = JOURNALPOST_LOADER_TEST_SCENARIOS.serverError;
const closeSuccessId = JOURNALPOST_LOADER_TEST_SCENARIOS.closeSuccess;
const validId = JOURNALPOST_LOADER_TEST_SCENARIOS.valid;

const validSearchHandler = http.get(journalpostUrl(validId), () =>
    HttpResponse.json(journalpostResponse(validId), { status: 200 }),
);
const loadingHandler = http.get(journalpostUrl(loadingId), () => new Promise<Response>(() => undefined));
const forbiddenHandler = http.get(journalpostUrl(forbiddenId), () => new HttpResponse(null, { status: 403 }));
const notFoundHandler = http.get(journalpostUrl(notFoundId), () => new HttpResponse(null, { status: 404 }));
const serverErrorHandler = http.get(journalpostUrl(serverErrorId), () => new HttpResponse(null, { status: 500 }));
const closeSuccessConflictHandler = http.get(journalpostUrl(closeSuccessId), () =>
    HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
);
const closeSuccessHandler = http.get(closeUrl(closeSuccessId), () =>
    HttpResponse.json({ status: 'FERDIGSTILT' }, { status: 200 }),
);

const goToLosAction = fn().mockName('Gå til LOS');
const createHomeStoryStore = () => configureStore({ reducer: rootReducer });
type HomeStoryStore = ReturnType<typeof createHomeStoryStore>;
const homeStoryStores = new Map<string, HomeStoryStore>();

const resetHomeStoryStore = (storyId: string) => {
    homeStoryStores.get(storyId)?.dispatch(resetAllStateAction());
};

const searchFor = async (canvasElement: HTMLElement, journalpostId: string) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Journalpost-ID' });
    await userEvent.type(input, journalpostId);
    await expect(input).toHaveValue(journalpostId);
    const searchButton = canvas.getByRole('button', { name: 'Søk' });
    await waitFor(() => expect(searchButton).toBeEnabled());
    await userEvent.click(searchButton);
};

const LocalJournalpostDestination = () => {
    const { journalpostid } = useParams();
    return (
        <section aria-label="Lokal rutedestinasjon">
            <h2>Journalpost lastet lokalt</h2>
            <p>Journalpost-ID: {journalpostid}</p>
        </section>
    );
};

const HomeStoryProviders: React.FC<React.PropsWithChildren<{ storyId: string }>> = ({ children, storyId }) => {
    const [store] = React.useState(() => {
        const newStore = createHomeStoryStore();
        homeStoryStores.set(storyId, newStore);
        return newStore;
    });

    React.useEffect(
        () => () => {
            if (homeStoryStores.get(storyId) === store) {
                homeStoryStores.delete(storyId);
            }
        },
        [store, storyId],
    );

    return (
        <Provider store={store}>
            <IntlProvider messages={messages} locale="nb">
                <MemoryRouter initialEntries={['/']}>
                    <Routes>
                        <Route path="/" element={children} />
                        <Route path="/journalpost/:journalpostid/*" element={<LocalJournalpostDestination />} />
                    </Routes>
                </MemoryRouter>
            </IntlProvider>
        </Provider>
    );
};

const meta: Meta<typeof Home> = {
    title: 'Components/Home',
    component: Home,
    beforeEach: () => {
        mocked(redirectToLos).mockReset();
        goToLosAction.mockClear();
        mocked(redirectToLos).mockImplementation(goToLosAction);
    },
    decorators: [
        (Story, context) => {
            return (
                <HomeStoryProviders key={context.id} storyId={context.id}>
                    <Story />
                </HomeStoryProviders>
            );
        },
    ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TomtSok: Story = {
    name: 'Tomt søk',
    parameters: {
        msw: { handlers: { journalpost: [validSearchHandler], close: [] } },
    },
    play: async ({ canvasElement, id }) => {
        resetHomeStoryStore(id);
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox', { name: 'Journalpost-ID' })).toHaveValue('');
        await expect(canvas.getByRole('button', { name: 'Søk' })).toBeDisabled();
    },
};

export const Laster: Story = {
    name: 'Laster',
    parameters: {
        msw: { handlers: { journalpost: [loadingHandler], close: [] } },
    },
    play: async ({ canvasElement, id }) => {
        resetHomeStoryStore(id);
        await searchFor(canvasElement, loadingId);
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox', { name: 'Journalpost-ID' })).toBeDisabled();
        await expect(canvas.getByRole('button', { name: /Venter/ })).toBeVisible();
    },
};

export const IkkeFunnet: Story = {
    name: 'Ikke funnet',
    parameters: {
        msw: { handlers: { journalpost: [notFoundHandler, validSearchHandler], close: [] } },
    },
    play: async ({ canvasElement, id }) => {
        resetHomeStoryStore(id);
        await searchFor(canvasElement, notFoundId);
        const canvas = within(canvasElement);
        await expect(
            canvas.findByText(`Det finnes ingen journalposter med ID ${notFoundId}`, { exact: true }),
        ).resolves.toBeVisible();
        await expect(canvas.getByRole('textbox', { name: 'Journalpost-ID' })).toBeEnabled();
    },
};

export const IngenTilgang: Story = {
    name: 'Ingen tilgang',
    parameters: {
        msw: { handlers: { journalpost: [forbiddenHandler, validSearchHandler], close: [] } },
    },
    play: async ({ canvasElement, id }) => {
        resetHomeStoryStore(id);
        await searchFor(canvasElement, forbiddenId);
        const canvas = within(canvasElement);
        await expect(
            canvas.findByText('Du har ikke tilgang til å slå opp denne personen', { exact: true }),
        ).resolves.toBeVisible();
        await expect(canvas.getByRole('textbox', { name: 'Journalpost-ID' })).toBeEnabled();
    },
};

export const GenerellFeil: Story = {
    name: 'Generell feil',
    parameters: {
        msw: { handlers: { journalpost: [serverErrorHandler, validSearchHandler], close: [] } },
    },
    play: async ({ canvasElement, id }) => {
        resetHomeStoryStore(id);
        await searchFor(canvasElement, serverErrorId);
        const canvas = within(canvasElement);
        await expect(canvas.findByText('Noe gikk galt', { exact: true })).resolves.toBeVisible();
        await expect(canvas.getByRole('textbox', { name: 'Journalpost-ID' })).toBeEnabled();
    },
};

export const Kjent409: Story = {
    name: 'Kjent 409 – lukking og LOS',
    parameters: {
        msw: {
            handlers: {
                journalpost: [closeSuccessConflictHandler, validSearchHandler],
                close: [closeSuccessHandler],
            },
        },
    },
    play: async ({ canvasElement, id }) => {
        resetHomeStoryStore(id);
        mocked(redirectToLos).mockClear();
        goToLosAction.mockClear();
        const canvas = within(canvasElement);
        await searchFor(canvasElement, closeSuccessId);
        await expect(canvas.findByText(/Journalposten har blitt feilregistrert/)).resolves.toBeVisible();

        await userEvent.click(await canvas.findByRole('button', { name: 'Lukk oppgaven i punsj' }));
        await expect(
            canvas.findByText(`Journalposten ${closeSuccessId} har blitt lukket.`, { exact: true }),
        ).resolves.toBeVisible();
        await userEvent.click(await canvas.findByRole('button', { name: 'Gå til LOS' }));

        await expect(mocked(redirectToLos)).toHaveBeenCalledOnce();
        await expect(goToLosAction).toHaveBeenCalledOnce();
    },
};
