import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useParams } from 'react-router';
import { legacy_createStore as createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiPath } from 'app/apiConfig';
import { Home } from 'app/home/Home';
import { rootReducer } from 'app/state/RootState';
import { renderWithIntl } from '../../testUtils';

type RecordedRequest = {
    url: string;
    init?: RequestInit;
};

let requests: RecordedRequest[];
let replies: Array<Response | Promise<Response>>;

const fetchStub = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    requests.push({ url, init });
    const reply = replies.shift();
    if (!reply) {
        throw new Error(`Uventet API-kall: ${url}`);
    }
    return reply;
});

const apiResponse = (body: unknown, status: number) =>
    new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    });

const journalpostPath = (journalpostId: string) =>
    ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
const closePath = (journalpostId: string) =>
    ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId);

const JournalpostDestination = () => {
    const { journalpostid } = useParams();
    return <p>Journalpost-ID: {journalpostid}</p>;
};

const renderHome = () => {
    const store = configureStore({ reducer: rootReducer });

    return renderWithIntl(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/journalpost/:journalpostid/*" element={<JournalpostDestination />} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );
};

beforeEach(() => {
    requests = [];
    replies = [];
    fetchStub.mockClear();
    vi.stubGlobal('fetch', fetchStub);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Home', () => {
    it('shows generic error alert when journalpost request error has no message', () => {
        const store = createStore(() => ({
            felles: {
                journalpostRequestError: {
                    statusText: 'Nettverksfeil',
                },
            },
            fordelingState: {
                lukkOppgaveDone: false,
            },
        }));

        renderWithIntl(
            <Provider store={store}>
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Noe gikk galt')).toBeInTheDocument();
    });

    it('viser søk og innganger for journalpost og brev med riktige lenker', () => {
        renderHome();

        expect(screen.getByRole('textbox', { name: 'Journalpost-ID' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Søk' })).toBeVisible();
        expect(screen.getByRole('heading', { name: 'Opprett journalpost', level: 1 })).toBeVisible();
        expect(screen.getByRole('heading', { name: 'Send brev i avsluttet sak', level: 1 })).toBeVisible();

        expect(screen.getByRole('button', { name: 'Opprett journalpost' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Send brev' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Opprett journalpost' })).toHaveAttribute(
            'href',
            '/opprett-journalpost',
        );
        expect(screen.getByRole('button', { name: 'Send brev' })).toHaveAttribute('href', '/brev-avsluttet-sak');
    });

    it('lar ikke et tomt søk sende en forespørsel, heller ikke med Enter', async () => {
        const user = userEvent.setup();
        renderHome();

        const input = screen.getByRole('textbox', { name: 'Journalpost-ID' });
        expect(screen.getByRole('button', { name: 'Søk' })).toBeDisabled();
        await user.click(input);
        await user.keyboard('{Enter}');

        expect(fetchStub).not.toHaveBeenCalled();
    });

    it.each(['klikk', 'Enter'])('søker med renset ID ved %s', async (trigger) => {
        const user = userEvent.setup();
        replies.push(apiResponse({ journalpostId: '930001', kanSendeInn: true }, 200));
        renderHome();

        const input = screen.getByRole('textbox', { name: 'Journalpost-ID' });
        await user.type(input, '93x0001');

        expect(input).toHaveValue('930001');
        expect(fetchStub).not.toHaveBeenCalled();

        if (trigger === 'klikk') {
            await user.click(screen.getByRole('button', { name: 'Søk' }));
        } else {
            await user.keyboard('{Enter}');
        }

        expect(await screen.findByText('Journalpost-ID: 930001')).toBeVisible();
        expect(requests).toHaveLength(1);
        expect(requests[0]?.url).toBe(journalpostPath('930001'));
    });

    it('viser lasting mens søket pågår og navigerer etter vellykket svar', async () => {
        const user = userEvent.setup();
        let resolveJournalpost: (response: Response) => void = () => {
            throw new Error('Journalpostresponsen er ikke klargjort.');
        };
        replies.push(
            new Promise<Response>((resolve) => {
                resolveJournalpost = resolve;
            }),
        );
        renderHome();

        const input = screen.getByRole('textbox', { name: 'Journalpost-ID' });
        await user.type(input, '930001');
        await user.click(screen.getByRole('button', { name: 'Søk' }));

        expect(input).toBeDisabled();
        const searchButton = screen.getByRole('button', { name: /Venter/ });
        expect(searchButton).toBeDisabled();
        expect(searchButton).toBeVisible();

        await act(async () => {
            resolveJournalpost(apiResponse({ journalpostId: '930001', kanSendeInn: true }, 200));
        });

        expect(await screen.findByText('Journalpost-ID: 930001')).toBeVisible();
    });

    it.each([
        {
            name: '403',
            journalpostId: '930003',
            response: apiResponse(undefined, 403),
            message: 'Du har ikke tilgang til å slå opp denne personen',
        },
        {
            name: '404 med søkt ID',
            journalpostId: '930004',
            response: apiResponse(undefined, 404),
            message: 'Det finnes ingen journalposter med ID 930004',
        },
        {
            name: '500',
            journalpostId: '930007',
            response: apiResponse(undefined, 500),
            message: 'Noe gikk galt',
        },
        {
            name: '409 med ukjent type',
            journalpostId: '930008',
            response: apiResponse({ type: 'punsj://ukjent-type' }, 409),
            message: 'Noe gikk galt',
        },
        {
            name: '409 uten type',
            journalpostId: '930009',
            response: apiResponse({}, 409),
            message: 'Noe gikk galt',
        },
    ])('viser riktig feil for $name', async ({ journalpostId, response, message }) => {
        const user = userEvent.setup();
        replies.push(response);
        renderHome();

        await user.type(screen.getByRole('textbox', { name: 'Journalpost-ID' }), journalpostId);
        await user.click(screen.getByRole('button', { name: 'Søk' }));

        expect(await screen.findByText(message, { exact: true })).toBeVisible();
        expect(requests[0]?.url).toBe(journalpostPath(journalpostId));
    });

    it('fjerner gammel feil ved ny ID og lar det nye søket lykkes', async () => {
        const user = userEvent.setup();
        replies.push(apiResponse(undefined, 403), apiResponse({ journalpostId: '930001', kanSendeInn: true }, 200));
        renderHome();

        const input = screen.getByRole('textbox', { name: 'Journalpost-ID' });
        await user.type(input, '930003');
        await user.click(screen.getByRole('button', { name: 'Søk' }));
        expect(await screen.findByText('Du har ikke tilgang til å slå opp denne personen')).toBeVisible();

        await user.clear(input);
        await user.type(input, '930001');
        expect(screen.queryByText('Du har ikke tilgang til å slå opp denne personen')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Søk' }));

        expect(await screen.findByText('Journalpost-ID: 930001')).toBeVisible();
        expect(requests.map(({ url }) => url)).toEqual([journalpostPath('930003'), journalpostPath('930001')]);
    });

    it('lukker en kjent 409 med GET uten body og viser LOS-handlingen', async () => {
        const user = userEvent.setup();
        replies.push(
            apiResponse({ type: 'punsj://ikke-støttet-journalpost' }, 409),
            apiResponse({ status: 'FERDIGSTILT' }, 200),
        );
        renderHome();

        await user.type(screen.getByRole('textbox', { name: 'Journalpost-ID' }), '930104');
        await user.click(screen.getByRole('button', { name: 'Søk' }));
        await user.click(await screen.findByRole('button', { name: 'Lukk oppgaven i punsj' }));

        expect(await screen.findByRole('button', { name: 'Gå til LOS' })).toBeEnabled();
        expect(requests).toHaveLength(2);
        expect(requests[0]?.url).toBe(journalpostPath('930104'));
        expect(requests[1]?.url).toBe(closePath('930104'));
        expect(requests[1]?.init?.method ?? 'GET').toBe('GET');
        expect(requests[1]?.init?.body).toBeUndefined();
    });
});
