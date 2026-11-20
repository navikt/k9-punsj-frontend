/// <reference types="msw-storybook-addon/csf3" />

import React from 'react';

import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import type { Meta, StoryObj } from '@storybook/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, useLocation } from 'react-router';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw/http';
import messages from 'app/i18n/nb.json';
import { ApiPath } from 'app/apiConfig';
import OpprettJournalpost from '../../app/opprett-journalpost/OpprettJournalpost';
import { fagsaker, hentFagsaker, hentFagsakerTomtArray } from '../mocks/hentFagsaker';
import { opprettNottat } from '../mocks/opprettNottat';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const TEST_FNR = '08438323288';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_NOTAT = 'Eksempel på notat';

let lookupAttempts = 0;
let creationAttempts = 0;

const pendingFagsaker = http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => new Promise<Response>(() => undefined));
const lookupRetry = http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => {
    lookupAttempts += 1;
    return lookupAttempts === 1 ? HttpResponse.json({}, { status: 400 }) : HttpResponse.json(fagsaker);
});
const creationRetry = http.post(ApiPath.OPPRETT_NOTAT, () => {
    creationAttempts += 1;
    return creationAttempts === 1
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json({ journalpostId: '200' }, { status: 201 });
});

const LocationDisplay = () => {
    const location = useLocation();

    return <p aria-live="polite">Gjeldende adresse: {location.pathname}</p>;
};

const fillIdent = async (canvasElement: HTMLElement) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Søkers fødselsnummer' }), TEST_FNR);
    return canvas;
};

const fillForm = async (canvasElement: HTMLElement) => {
    const canvas = await fillIdent(canvasElement);
    await canvas.findByRole('option', { name: /ABC123/ });
    await userEvent.selectOptions(canvas.getByLabelText('Velg fagsak'), 'ABC123');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Tittel' }), TEST_TITTEL);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Notat' }), TEST_NOTAT);
    return canvas;
};

const meta: Meta<typeof OpprettJournalpost> = {
    title: 'Components/OpprettJournalpost',
    component: OpprettJournalpost,
    parameters: {
        msw: {
            handlers: {
                lookup: [hentFagsaker],
                creation: [opprettNottat],
            },
        },
    },
    decorators: [
        (Story, context) => {
            const store = createStore(() => ({
                authState: {
                    tilganger: {
                        harHistoriskTilgang: context.parameters.harHistoriskTilgang === true,
                    },
                },
            }));

            return (
                <Provider store={store}>
                    <IntlProvider messages={messages} locale="nb">
                        <MemoryRouter initialEntries={['/opprett-journalpost']}>
                            <div style={{ margin: '24px' }}>
                                <LocationDisplay />
                                <Story />
                            </div>
                        </MemoryRouter>
                    </IntlProvider>
                </Provider>
            );
        },
    ],
};

export default meta;

type Story = StoryObj<typeof OpprettJournalpost>;

export const TomtSkjema: Story = {
    name: 'Tomt skjema',
};

export const HenterFagsaker: Story = {
    name: 'Henter fagsaker',
    parameters: { msw: { handlers: { lookup: [pendingFagsaker] } } },
    play: async ({ canvasElement }) => {
        const canvas = await fillIdent(canvasElement);
        await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Søkers fødselsnummer' })).toBeDisabled());
    },
};

export const FagsakerFunnet: Story = {
    name: 'Fagsaker funnet uten historisk tilgang',
    play: async ({ canvasElement }) => {
        const canvas = await fillIdent(canvasElement);
        await expect(canvas.findByRole('option', { name: /ABC123/ })).resolves.toBeEnabled();
        const historiskFagsak = await canvas.findByRole('option', { name: /HIST001/ });
        await expect(historiskFagsak).toBeDisabled();
    },
};

export const HistoriskMedTilgang: Story = {
    name: 'Historisk fagsak med tilgang',
    parameters: { harHistoriskTilgang: true },
    play: async ({ canvasElement }) => {
        const canvas = await fillIdent(canvasElement);
        const historiskFagsak = await canvas.findByRole('option', { name: /HIST001/ });
        await expect(historiskFagsak).toBeEnabled();
    },
};

export const IngenFagsaker: Story = {
    name: 'Ingen fagsaker',
    parameters: { msw: { handlers: { lookup: [hentFagsakerTomtArray] } } },
    play: async ({ canvasElement }) => {
        const canvas = await fillIdent(canvasElement);
        await expect(
            canvas.findByText(
                'Det finnes ingen fagsaker for denne søkeren. Du kan ikke opprette journalpost uten fagsak.',
            ),
        ).resolves.toBeVisible();
    },
};

export const HentingFeilerMedNyForsøk: Story = {
    name: 'Feil ved henting med nytt forsøk',
    parameters: { msw: { handlers: { lookup: [lookupRetry] } } },
    play: async ({ canvasElement }) => {
        lookupAttempts = 0;
        const canvas = await fillIdent(canvasElement);
        await expect(
            canvas.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.'),
        ).resolves.toBeVisible();
    },
};

export const OpprettelseFeilerMedNyttForsøk: Story = {
    name: 'Feil ved oppretting med nytt forsøk',
    parameters: { msw: { handlers: { creation: [creationRetry] } } },
    play: async ({ canvasElement }) => {
        creationAttempts = 0;
        const canvas = await fillForm(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Opprett journalpost' }));
        await expect(canvas.findByText('Kunne ikke opprette journalpost')).resolves.toBeVisible();
    },
};

export const OpprettelseVellykket: Story = {
    name: 'Opprettelse vellykket',
    play: async ({ canvasElement }) => {
        const canvas = await fillForm(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Opprett journalpost' }));
        await expect(canvas.findByText('Opprettet. Journalpost-ID: 200')).resolves.toBeVisible();
    },
};
