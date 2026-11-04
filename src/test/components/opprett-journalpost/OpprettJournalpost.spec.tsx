import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { legacy_createStore as createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiPath } from 'app/apiConfig';
import OpprettJournalpost from 'app/opprett-journalpost/OpprettJournalpost';
import { renderWithIntl } from '../../testUtils';
import { fagsaker } from '../../../storybook/mocks/hentFagsaker';

const TEST_FNR = '08438323288';
const SECOND_TEST_FNR = '17519112922';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_NOTAT = 'Eksempel på notat';
const TEST_JOURNALPOST_ID = 'JP-TEST-1';

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

let lookupReplies: Array<Response | Promise<Response>>;
let creationReplies: Array<Response | Promise<Response>>;
let requests: Array<{ url: string; init?: RequestInit }>;
let fetchMock: ReturnType<typeof vi.fn>;

const renderForm = (harHistoriskTilgang = false) => {
    const store = createStore(() => ({
        authState: {
            tilganger: { harHistoriskTilgang },
        },
    }));

    return renderWithIntl(
        <Provider store={store}>
            <MemoryRouter>
                <OpprettJournalpost />
            </MemoryRouter>
        </Provider>,
    );
};

const enterIdent = async (user: ReturnType<typeof userEvent.setup>, ident = TEST_FNR) => {
    await user.type(screen.getByRole('textbox', { name: 'Søkers fødselsnummer' }), ident);
};

const selectFagsak = async (user: ReturnType<typeof userEvent.setup>, fagsakId = 'ABC123') => {
    await screen.findByRole('option', { name: new RegExp(fagsakId) });
    await user.selectOptions(screen.getByLabelText('Velg fagsak'), fagsakId);
};

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await enterIdent(user);
    await selectFagsak(user);
    await user.type(screen.getByRole('textbox', { name: 'Tittel' }), TEST_TITTEL);
    await user.type(screen.getByRole('textbox', { name: 'Notat' }), TEST_NOTAT);
};

const requestsFor = (path: string) => requests.filter(({ url }) => url === path);

beforeEach(() => {
    lookupReplies = [jsonResponse(fagsaker)];
    creationReplies = [jsonResponse({ journalpostId: TEST_JOURNALPOST_ID }, 201)];
    requests = [];
    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        requests.push({ url, init });

        if (url === ApiPath.HENT_FAGSAK_PÅ_IDENT) {
            return (await lookupReplies.shift()) ?? jsonResponse(fagsaker);
        }
        if (url === ApiPath.OPPRETT_NOTAT) {
            return (await creationReplies.shift()) ?? jsonResponse({ journalpostId: TEST_JOURNALPOST_ID }, 201);
        }

        throw new Error(`Uventet API-kall: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('OpprettJournalpost', () => {
    it('viser feil for alle tomme påkrevde felt', async () => {
        const user = userEvent.setup();
        renderForm();

        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));

        expect(await screen.findByText('Du må skrive inn søkers fødselsnummer.')).toBeVisible();
        expect(screen.getByText('Du må velge fagsak.')).toBeVisible();
        expect(screen.getByText('Du må skrive inn tittel.')).toBeVisible();
        expect(screen.getByText('Du må skrive inn notat.')).toBeVisible();
    });

    it('validerer lengde og gyldighet på fødselsnummer før oppslag', async () => {
        const user = userEvent.setup();
        renderForm();

        await enterIdent(user, '1');
        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));
        expect(await screen.findByText('Søkers fødselsnummer må være 11 siffer.')).toBeVisible();

        const identInput = screen.getByRole('textbox', { name: 'Søkers fødselsnummer' });
        await user.clear(identInput);
        await enterIdent(user, '11111111111');
        expect(await screen.findByText('Søkers fødselsnummer er ugyldig.')).toBeVisible();
        expect(requestsFor(ApiPath.HENT_FAGSAK_PÅ_IDENT)).toHaveLength(0);
    });

    it('viser innlasting mens fagsakoppslaget venter', async () => {
        let resolveLookup: (response: Response) => void = () => {
            throw new Error('Oppslaget er ikke startet');
        };
        lookupReplies = [
            new Promise<Response>((resolve) => {
                resolveLookup = resolve;
            }),
        ];
        const user = userEvent.setup();
        renderForm();

        await enterIdent(user);
        expect(screen.getByRole('textbox', { name: 'Søkers fødselsnummer' })).toBeDisabled();
        expect(screen.getByRole('status')).toContainElement(screen.getByTitle('Henter fagsaker'));

        resolveLookup(jsonResponse(fagsaker));
        expect(await screen.findByRole('option', { name: /ABC123/ })).toBeVisible();
        expect(screen.queryByTitle('Henter fagsaker')).not.toBeInTheDocument();
    });

    it('slår opp fagsaker med gyldig ident og sender identitetsnummeret i headeren', async () => {
        const user = userEvent.setup();
        renderForm();

        await enterIdent(user);
        await screen.findByRole('option', { name: /ABC123/ });

        const lookup = requestsFor(ApiPath.HENT_FAGSAK_PÅ_IDENT)[0];
        expect(new Headers(lookup?.init?.headers).get('X-Nav-NorskIdent')).toBe(TEST_FNR);
    });

    it('deaktiverer historisk fagsak uten historisk tilgang', async () => {
        const user = userEvent.setup();
        renderForm(false);

        await enterIdent(user);
        expect(await screen.findByRole('option', { name: /HIST001/ })).toBeDisabled();
    });

    it('aktiverer historisk fagsak med historisk tilgang', async () => {
        const user = userEvent.setup();
        renderForm(true);

        await enterIdent(user);
        expect(await screen.findByRole('option', { name: /HIST001/ })).toBeEnabled();
    });

    it('tømmer valgt fagsak når søkerens ident endres', async () => {
        const user = userEvent.setup();
        renderForm();

        await enterIdent(user);
        await selectFagsak(user);
        expect(screen.getByLabelText('Velg fagsak')).toHaveValue('ABC123');

        const identInput = screen.getByRole('textbox', { name: 'Søkers fødselsnummer' });
        await user.clear(identInput);
        await enterIdent(user, SECOND_TEST_FNR);

        expect(await screen.findByRole('option', { name: /ABC123/ })).toBeVisible();
        expect(screen.getByLabelText('Velg fagsak')).toHaveValue('');
        expect(new Headers(requestsFor(ApiPath.HENT_FAGSAK_PÅ_IDENT)[1]?.init?.headers).get('X-Nav-NorskIdent')).toBe(
            SECOND_TEST_FNR,
        );
    });

    it('viser varsel når søkeren ikke har fagsaker', async () => {
        lookupReplies = [jsonResponse([], 200)];
        const user = userEvent.setup();
        renderForm();

        await enterIdent(user, SECOND_TEST_FNR);
        expect(
            await screen.findByText(
                'Det finnes ingen fagsaker for denne søkeren. Du kan ikke opprette journalpost uten fagsak.',
            ),
        ).toBeVisible();
    });

    it('lar saksbehandler hente fagsaker på nytt etter en oppslagsfeil', async () => {
        lookupReplies = [jsonResponse({}, 400), jsonResponse(fagsaker)];
        const user = userEvent.setup();
        renderForm();

        await enterIdent(user, SECOND_TEST_FNR);
        expect(
            await screen.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.'),
        ).toBeVisible();

        await user.click(screen.getByRole('button', { name: 'Hent fagsaker på nytt' }));

        expect(await screen.findByRole('option', { name: /ABC123/ })).toBeVisible();
        expect(screen.queryByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.')).toBeNull();
        expect(requestsFor(ApiPath.HENT_FAGSAK_PÅ_IDENT)).toHaveLength(2);
    });

    it('validerer tittel og notat og fjerner feil etter korrigering', async () => {
        const user = userEvent.setup();
        renderForm();
        await enterIdent(user);
        await selectFagsak(user);

        const titleInput = screen.getByRole('textbox', { name: 'Tittel' });
        const noteInput = screen.getByRole('textbox', { name: 'Notat' });
        await user.type(titleInput, 'E');
        await user.type(noteInput, 'E');
        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));
        expect(await screen.findByText('Tittel må være minst 3 tegn.')).toBeVisible();
        expect(screen.getByText('Notat må være minst 3 tegn.')).toBeVisible();

        await user.clear(titleInput);
        await user.type(titleInput, 'Tittel^');
        await user.clear(noteInput);
        await user.type(noteInput, 'Notat^');
        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));
        expect(screen.getAllByText('Feltet inneholder ugyldige tegn: ^')).toHaveLength(2);

        await user.clear(titleInput);
        await user.type(titleInput, TEST_TITTEL);
        await user.clear(noteInput);
        await user.type(noteInput, TEST_NOTAT);
        await waitFor(() => {
            expect(screen.queryByText('Tittel må være minst 3 tegn.')).toBeNull();
            expect(screen.queryByText('Notat må være minst 3 tegn.')).toBeNull();
            expect(screen.queryByText('Feltet inneholder ugyldige tegn: ^')).toBeNull();
        });
    });

    it('viser feil når tittelen overskrider 100 tegn', async () => {
        const user = userEvent.setup();
        renderForm();
        await enterIdent(user);
        await selectFagsak(user);
        await user.type(screen.getByRole('textbox', { name: 'Tittel' }), 'T'.repeat(101));
        await user.type(screen.getByRole('textbox', { name: 'Notat' }), TEST_NOTAT);
        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));

        expect(await screen.findByText('Tittel kan ikke være lengre enn 100 tegn.')).toBeVisible();
    });

    it('viser feil når notatet overskrider 10 000 tegn', async () => {
        const user = userEvent.setup();
        renderForm();
        await enterIdent(user);
        await selectFagsak(user);

        const noteInput = screen.getByRole('textbox', { name: 'Notat' });
        await user.click(noteInput);
        await user.paste('N'.repeat(10_001));
        await user.type(screen.getByRole('textbox', { name: 'Tittel' }), TEST_TITTEL);
        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));

        expect(await screen.findByText('Notat kan ikke være lengre enn 10000 tegn.')).toBeVisible();
    });

    it('beholder verdier etter opprettingsfeil og lar saksbehandler prøve på nytt', async () => {
        creationReplies = [jsonResponse({}, 500), jsonResponse({ journalpostId: TEST_JOURNALPOST_ID }, 201)];
        const user = userEvent.setup();
        renderForm();
        await fillForm(user);

        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));
        expect(await screen.findByText('Kunne ikke opprette journalpost')).toBeVisible();
        expect(screen.queryByText(/Opprettet\. Journalpost-ID:/)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Gå til journalpost' })).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Søkers fødselsnummer' })).toHaveValue(TEST_FNR);
        expect(screen.getByLabelText('Velg fagsak')).toHaveValue('ABC123');
        expect(screen.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);
        expect(screen.getByRole('textbox', { name: 'Notat' })).toHaveValue(TEST_NOTAT);

        const submitButton = screen.getByRole('button', { name: 'Opprett journalpost' });
        expect(submitButton).toBeEnabled();
        await user.click(submitButton);

        expect(await screen.findByText(`Opprettet. Journalpost-ID: ${TEST_JOURNALPOST_ID}`)).toBeVisible();
        expect(screen.getByRole('button', { name: 'Gå til journalpost' })).toBeVisible();
        expect(screen.queryByRole('button', { name: 'Opprett journalpost' })).not.toBeInTheDocument();
        expect(screen.queryByText('Kunne ikke opprette journalpost')).not.toBeInTheDocument();

        const creationRequests = requestsFor(ApiPath.OPPRETT_NOTAT);
        expect(creationRequests).toHaveLength(2);
        expect(creationRequests.map(({ init }) => JSON.parse(String(init?.body)))).toEqual([
            {
                søkerIdentitetsnummer: TEST_FNR,
                fagsakId: 'ABC123',
                tittel: TEST_TITTEL,
                notat: TEST_NOTAT,
            },
            {
                søkerIdentitetsnummer: TEST_FNR,
                fagsakId: 'ABC123',
                tittel: TEST_TITTEL,
                notat: TEST_NOTAT,
            },
        ]);
    });

    it('viser vellykket oppretting med journalpost-ID', async () => {
        const user = userEvent.setup();
        renderForm();
        await fillForm(user);

        await user.click(screen.getByRole('button', { name: 'Opprett journalpost' }));

        expect(await screen.findByText(`Opprettet. Journalpost-ID: ${TEST_JOURNALPOST_ID}`)).toBeVisible();
        expect(screen.getByRole('button', { name: 'Gå til journalpost' })).toBeVisible();
        expect(screen.queryByRole('button', { name: 'Opprett journalpost' })).not.toBeInTheDocument();
    });
});
