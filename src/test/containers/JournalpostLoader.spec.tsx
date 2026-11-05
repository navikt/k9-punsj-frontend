import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiPath } from 'app/apiConfig';
import JournalpostLoader from 'app/containers/JournalpostLoader';
import messages from 'app/i18n/nb.json';
import { rootReducer } from 'app/state/RootState';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import journalpostFixture from '../../../cypress/fixtures/jpPSB300.json';

const JOURNALPOST_ID = journalpostFixture.journalpostId;
const journalpostPath = ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID);
const closePath = ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', JOURNALPOST_ID);
const unsupportedMessage =
    'Journalposten har blitt feilregistrert, avbrutt, utgått eller har endret tema via Gosys/annet system. Lukk oppgaven i Punsj og søk opp journalposten i Gosys for å vurdere eventuell videre håndtering derfra.';

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

const renderJournalpostLoader = () => {
    const store = configureStore({ reducer: rootReducer });
    return render(
        <Provider store={store}>
            <IntlProvider locale="nb" messages={messages}>
                <MemoryRouter initialEntries={[`/journalpost/${JOURNALPOST_ID}`]}>
                    <Routes>
                        <Route
                            path="/journalpost/:journalpostid/*"
                            element={
                                <JournalpostLoader
                                    renderOnLoadComplete={() => (
                                        <div data-testid="journalpostinnhold">Journalpostinnhold lastet</div>
                                    )}
                                />
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </IntlProvider>
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

describe('JournalpostLoader', () => {
    it('viser lasting til journalposten er hentet', async () => {
        let resolveJournalpost: (response: Response) => void = () => {
            throw new Error('Journalpostresponsen er ikke klargjort.');
        };
        replies.push(
            new Promise<Response>((resolve) => {
                resolveJournalpost = resolve;
            }),
        );

        renderJournalpostLoader();

        expect(await screen.findByTestId('spinner')).toBeVisible();
        expect(screen.queryByTestId('journalpostinnhold')).not.toBeInTheDocument();
        await waitFor(() => expect(requests).toHaveLength(1));
        expect(requests[0]).toMatchObject({ url: journalpostPath });

        await act(async () => {
            resolveJournalpost(apiResponse(journalpostFixture, 200));
        });

        expect(await screen.findByTestId('journalpostinnhold')).toBeVisible();
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('viser innhold etter en vellykket GET med journalposten', async () => {
        replies.push(apiResponse(journalpostFixture, 200));

        renderJournalpostLoader();

        expect(await screen.findByTestId('journalpostinnhold')).toBeVisible();
        expect(requests[0]).toMatchObject({ url: journalpostPath });
        expect(requests[0]?.init?.method).toBeUndefined();
    });

    it.each([
        {
            name: '403 uten tilgang',
            response: apiResponse(undefined, 403),
            message: 'Du har ikke tilgang til journalposten',
        },
        {
            name: '404 uten journalpost',
            response: apiResponse(undefined, 404),
            message: 'Kunne ikke finne journalpost.',
        },
        {
            name: '200 med tom dokumentliste',
            response: apiResponse({ ...journalpostFixture, dokumenter: [] }, 200),
            message: 'Journalposten har ingen tilhørende dokumenter',
        },
        {
            name: '500 ved lasting',
            response: apiResponse(undefined, 500),
            message: 'Noe gikk galt',
        },
    ])('viser riktig feil ved $name', async ({ response, message }) => {
        replies.push(response);

        renderJournalpostLoader();

        expect(await screen.findByText(message, { exact: true })).toBeVisible();
        expect(screen.queryByTestId('journalpostinnhold')).not.toBeInTheDocument();
        expect(requests[0]).toMatchObject({ url: journalpostPath });
    });

    it('viser kjent 409-type med lukkhandling', async () => {
        replies.push(apiResponse({ type: 'punsj://ikke-støttet-journalpost' }, 409));

        renderJournalpostLoader();

        expect(await screen.findByTestId('conflict-error-alert')).toHaveTextContent(unsupportedMessage);
        expect(screen.getByRole('button', { name: 'Lukk oppgaven i punsj' })).toBeEnabled();
        expect(screen.queryByTestId('journalpostinnhold')).not.toBeInTheDocument();
    });

    it.each([
        { name: 'ukjent type', body: { type: 'punsj://ukjent-type' } },
        { name: 'manglende type', body: {} },
    ])('viser generell feil ved 409 med $name', async ({ body }) => {
        replies.push(apiResponse(body, 409));

        renderJournalpostLoader();

        expect(await screen.findByText('Noe gikk galt', { exact: true })).toBeVisible();
        expect(screen.queryByTestId('journalpostinnhold')).not.toBeInTheDocument();
        expect(screen.queryByTestId('conflict-error-alert')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Lukk oppgaven i punsj' })).not.toBeInTheDocument();
    });

    it.each([
        {
            name: '404 fordi journalposten ikke finnes',
            status: 404,
            body: undefined,
            message: `Journalposten ${JOURNALPOST_ID} eksisterer ikke i punsj.`,
        },
        {
            name: '400 fordi journalposten er ferdigbehandlet',
            status: 400,
            body: { status: 'ALLEREDE_FERDIGSTILT' },
            message: `Journalposten ${JOURNALPOST_ID} har allerede blitt lukket.`,
        },
        {
            name: '500 ved generell feil',
            status: 500,
            body: undefined,
            message: 'Noe gikk galt. Status code: 500.',
        },
        {
            name: '200 ved vellykket lukking',
            status: 200,
            body: { status: 'FERDIGSTILT' },
            message: `Journalposten ${JOURNALPOST_ID} har blitt lukket.`,
        },
    ])('lukker journalposten: $name', async ({ status, body, message }) => {
        const user = userEvent.setup();
        replies.push(
            apiResponse({ type: 'punsj://ikke-støttet-journalpost' }, 409),
            apiResponse(body, status),
        );

        renderJournalpostLoader();

        await user.click(await screen.findByRole('button', { name: 'Lukk oppgaven i punsj' }));

        expect(await screen.findByTestId('conflict-error-alert')).toHaveTextContent(message);
        expect(screen.getByRole('button', { name: 'Gå til LOS' })).toBeEnabled();
        expect(requests).toHaveLength(2);
        expect(requests[0]).toMatchObject({ url: journalpostPath });
        expect(requests[1]).toMatchObject({ url: closePath });
        expect(requests[1]?.init?.method).toBeUndefined();
        expect(requests[1]?.init?.body).toBeUndefined();
    });
});
