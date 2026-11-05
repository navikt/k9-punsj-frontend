import React from 'react';

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router';
import { legacy_createStore as createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiPath } from 'app/apiConfig';
import { PunsjDialogProvider } from 'app/components/PunsjDialog';
import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import type { IJournalpost } from 'app/models/types';
import KlassifiserModal from 'app/fordeling/Komponenter/KlassifiserModal';
import HåndterInntektsmeldingUtenKrav from 'app/fordeling/Komponenter/HåndterInntektsmeldingUtenKrav';
import VentLukkBrevModal from 'app/fordeling/Komponenter/VentLukkBrevModal';
import SendBrevBehandletJp from 'app/brev-behandlet-journalpost/SendBrevBehandletJp';
import SendBrevPåFagsak from 'app/brev-fagsak/SendBrevPåFagsak';
import SendBrevIAvsluttetSak from 'app/send-brev-i-avsluttetSak/SendBrevIAvsluttetSak';
import { renderWithIntl } from '../../testUtils';

const TEST_IDENT = '08438323288';
const AKTØR_ID = '81549300';
const FAGSAK_ID = '1DMU93A';
const JOURNALPOST_ID = '920001';
const MAL = 'GENERELT_FRITEKSTBREV';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_INNHOLD = 'Eksempel på brevtekst';

const brevmaler = {
    [MAL]: {
        kode: MAL,
        navn: 'Generelt brev',
        mottakere: [],
        linker: [],
        støtterFritekst: false,
        støtterTittelOgFritekst: true,
        støtterTredjepartsmottaker: true,
    },
};

const journalpost = (overrides: Partial<IJournalpost> = {}): IJournalpost =>
    ({
        journalpostId: JOURNALPOST_ID,
        norskIdent: TEST_IDENT,
        dokumenter: [],
        sak: { fagsakId: FAGSAK_ID, sakstype: 'PSB' },
        ...overrides,
    }) as IJournalpost;

const response = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type RecordedRequest = { url: string; init?: RequestInit; body?: Record<string, unknown> };
let requests: RecordedRequest[];
let sendReplies: Response[];
let fagsakReplies: Array<Response | Promise<Response>>;
const dialogRoots: HTMLDivElement[] = [];

const commonFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : undefined;
    requests.push({ url, init, body });

    if (url.startsWith(ApiPath.BREV_MALER)) return response(brevmaler);
    if (url === ApiPath.FINN_ARBEIDSGIVERE) return response({ organisasjoner: [] });
    if (url === ApiPath.BREV_AKTØRID) return response(AKTØR_ID);
    if (url === ApiPath.PERSON) {
        return response({ identitetsnummer: TEST_IDENT, sammensattNavn: 'Ola Test' });
    }
    if (url === ApiPath.HENT_FAGSAK_PÅ_IDENT) {
        return (await fagsakReplies.shift()) ?? response([{ fagsakId: FAGSAK_ID, sakstype: 'PSB' }]);
    }
    if (url === ApiPath.BREV_BESTILL) return sendReplies.shift() ?? new Response(null, { status: 200 });
    if (url === ApiPath.JOURNALPOST_MOTTAK) return response({ saksnummer: 'RES-12345' });
    if (url === ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID)) {
        return response({ sattPåVent: true });
    }

    throw new Error(`Uventet API-kall: ${url}`);
};

const Location = () => {
    const location = useLocation();
    return <output aria-label="Gjeldende adresse">{location.pathname}</output>;
};

const renderAtRoute = (element: React.ReactNode, initialPath = '/') =>
    renderWithIntl(
        <MemoryRouter initialEntries={[initialPath]}>
            <Location />
            {element}
        </MemoryRouter>,
    );

const renderWithStore = (
    element: React.ReactNode,
    state: Record<string, unknown>,
    initialPath = '/',
    withQueryClient = false,
) => {
    const store = createStore(() => state);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const dialogRoot = document.createElement('div');
    document.body.append(dialogRoot);
    dialogRoots.push(dialogRoot);
    return renderWithIntl(
        <Provider store={store}>
            <PunsjDialogProvider rootElement={dialogRoot}>
                {withQueryClient ? (
                    <QueryClientProvider client={queryClient}>
                        <MemoryRouter initialEntries={[initialPath]}>
                            <Location />
                            {element}
                        </MemoryRouter>
                    </QueryClientProvider>
                ) : (
                    <MemoryRouter initialEntries={[initialPath]}>
                        <Location />
                        {element}
                    </MemoryRouter>
                )}
            </PunsjDialogProvider>
        </Provider>,
    );
};

const sendLetter = async (user: ReturnType<typeof userEvent.setup>) => {
    await screen.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Velg mal' }), MAL);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Velg mottaker' }), AKTØR_ID);
    await user.click(screen.getByRole('textbox', { name: 'Tittel' }));
    await user.paste(TEST_TITTEL);
    await user.click(screen.getByRole('textbox', { name: 'Innhold i brev' }));
    await user.paste(TEST_INNHOLD);
};

beforeEach(() => {
    requests = [];
    sendReplies = [new Response(null, { status: 200 })];
    fagsakReplies = [];
    vi.stubGlobal('fetch', commonFetch);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    dialogRoots.splice(0).forEach((root) => root.remove());
    vi.useRealTimers();
});

describe('brevtilkoblinger', () => {
    it('validerer ident før oppslag og sender valgt søker og sak fra avsluttet sak', async () => {
        const user = userEvent.setup();
        renderAtRoute(<SendBrevIAvsluttetSak />, '/brev-avsluttet-sak');

        const ident = screen.getByRole('textbox', { name: 'Søkers fødselsnummer' });
        await user.type(ident, '1');
        expect(await screen.findByText('Søkers fødselsnummer må være 11 siffer.')).toBeVisible();
        expect(requests.filter(({ url }) => url === ApiPath.HENT_FAGSAK_PÅ_IDENT)).toHaveLength(0);

        await user.clear(ident);
        expect(await screen.findByText('Du må skrive inn søkers fødselsnummer.')).toBeVisible();
        expect(requests.filter(({ url }) => url === ApiPath.HENT_FAGSAK_PÅ_IDENT)).toHaveLength(0);

        const identWithNonDigit = `${TEST_IDENT.slice(0, 5)}x${TEST_IDENT.slice(5)}`;
        await user.type(ident, identWithNonDigit);
        expect(ident).toHaveValue(TEST_IDENT);
        await screen.findByRole('option', { name: new RegExp(FAGSAK_ID) });
        const lookupRequests = requests.filter(({ url }) => url === ApiPath.HENT_FAGSAK_PÅ_IDENT);
        expect(lookupRequests).toHaveLength(1);
        expect(
            new Headers(lookupRequests[0]?.init?.headers).get('X-Nav-NorskIdent'),
        ).toBe(TEST_IDENT);
        await user.selectOptions(screen.getByRole('combobox', { name: 'Velg fagsak' }), FAGSAK_ID);
        await sendLetter(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Fortsett' }));

        expect(await screen.findByText('Brevet er sendt. Du blir nå tatt til LOS.')).toBeVisible();
        expect(requests.find(({ url }) => url === ApiPath.BREV_BESTILL)?.body).toMatchObject({
            soekerId: TEST_IDENT,
            fagsakYtelseType: 'PSB',
            saksnummer: FAGSAK_ID,
            dokumentMal: MAL,
        });
    });

    it('viser lasting, henter på nytt etter feil og tømmer valgt sak når identen endres', async () => {
        let resolveLookup: (reply: Response) => void = () => {
            throw new Error('Fagsakoppslaget er ikke startet');
        };
        const pendingLookup = new Promise<Response>((resolve) => {
            resolveLookup = resolve;
        });
        fagsakReplies = [
            pendingLookup,
            response([], 200),
        ];
        const user = userEvent.setup();
        renderAtRoute(<SendBrevIAvsluttetSak />, '/brev-avsluttet-sak');

        const ident = screen.getByRole('textbox', { name: 'Søkers fødselsnummer' });
        await user.type(ident, TEST_IDENT);
        expect(await screen.findByTitle('venter...')).toBeInTheDocument();
        resolveLookup(response([{ fagsakId: FAGSAK_ID, sakstype: 'PSB' }]));
        await screen.findByRole('option', { name: new RegExp(FAGSAK_ID) });
        await user.selectOptions(screen.getByRole('combobox', { name: 'Velg fagsak' }), FAGSAK_ID);
        expect(screen.getByRole('combobox', { name: 'Velg fagsak' })).toHaveValue(FAGSAK_ID);

        await user.clear(ident);
        await user.type(ident, '17519112922');
        expect(
            await screen.findByText('Det finnes ingen fagsaker for denne søkeren. Du kan ikke sende brev uten fagsak.'),
        ).toBeVisible();
        expect(screen.getByRole('combobox', { name: 'Velg fagsak' })).toHaveValue('');
    });

    it('viser feil ved fagsakoppslag og henter på nytt etter handling', async () => {
        fagsakReplies = [
            response({}, 400),
            response([{ fagsakId: FAGSAK_ID, sakstype: 'PSB' }]),
        ];
        const user = userEvent.setup();
        renderAtRoute(<SendBrevIAvsluttetSak />, '/brev-avsluttet-sak');

        await user.type(screen.getByRole('textbox', { name: 'Søkers fødselsnummer' }), '05508239132');
        expect(
            await screen.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.'),
        ).toBeVisible();
        await user.click(screen.getByRole('button', { name: 'Hent fagsaker på nytt' }));
        expect(await screen.findByRole('option', { name: new RegExp(FAGSAK_ID) })).toBeVisible();
        expect(requests.filter(({ url }) => url === ApiPath.HENT_FAGSAK_PÅ_IDENT)).toHaveLength(2);
    });

    it('avviser ident med ugyldige siffer før oppslag', async () => {
        const user = userEvent.setup();
        renderAtRoute(<SendBrevIAvsluttetSak />, '/brev-avsluttet-sak');

        await user.type(screen.getByRole('textbox', { name: 'Søkers fødselsnummer' }), '11111111111');
        expect(await screen.findByText('Søkers fødselsnummer er ugyldig.')).toBeVisible();
        expect(requests.filter(({ url }) => url === ApiPath.HENT_FAGSAK_PÅ_IDENT)).toHaveLength(0);
    });

    it('lar LOS-redirectens forsinkelse utløpe uten å navigere når LOS-URL mangler', async () => {
        const storyWindow = window as Window & { appSettings?: Record<string, string | undefined> };
        const previousSettings = storyWindow.appSettings;
        storyWindow.appSettings = { ...previousSettings, K9_LOS_URL: undefined };
        try {
            const user = userEvent.setup();
            renderAtRoute(<SendBrevIAvsluttetSak />, '/brev-avsluttet-sak');

            await user.type(screen.getByRole('textbox', { name: 'Søkers fødselsnummer' }), TEST_IDENT);
            await user.selectOptions(await screen.findByRole('combobox', { name: 'Velg fagsak' }), FAGSAK_ID);
            await sendLetter(user);
            await user.click(screen.getByRole('button', { name: 'Send brev' }));

            vi.useFakeTimers();
            const currentUrl = window.location.href;
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Fortsett' }));
                await vi.runAllTimersAsync();
            });
            expect(screen.getByRole('dialog', { name: 'Gå til LOS-modal' })).toBeVisible();
            expect(window.location.href).toBe(currentUrl);
        } finally {
            if (previousSettings === undefined) delete storyWindow.appSettings;
            else storyWindow.appSettings = previousSettings;
        }
    });

    it('sender til LOS først etter tre sekunder når brevet er sendt fra avsluttet sak', async () => {
        const storyWindow = window as Window & { appSettings?: Record<string, string | undefined> };
        const previousSettings = storyWindow.appSettings;
        const startUrl = window.location.href;
        // Fragmentnavigasjon støttes av jsdom og viser at den ekte redirecten ble utført.
        const losUrl = `${startUrl.split('#')[0]}#los-test`;
        storyWindow.appSettings = { ...previousSettings, K9_LOS_URL: losUrl };
        try {
            const user = userEvent.setup();
            renderAtRoute(<SendBrevIAvsluttetSak />, '/brev-avsluttet-sak');

            await user.type(screen.getByRole('textbox', { name: 'Søkers fødselsnummer' }), TEST_IDENT);
            await user.selectOptions(await screen.findByRole('combobox', { name: 'Velg fagsak' }), FAGSAK_ID);
            await sendLetter(user);
            await user.click(screen.getByRole('button', { name: 'Send brev' }));

            vi.useFakeTimers();
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Fortsett' }));
                await vi.advanceTimersByTimeAsync(0);
            });
            expect(screen.getByRole('dialog', { name: 'Gå til LOS-modal' })).toBeVisible();
            expect(screen.getByText('Brevet er sendt. Du blir nå tatt til LOS.')).toBeVisible();

            await act(async () => {
                await vi.advanceTimersByTimeAsync(2999);
            });
            expect(window.location.href).toBe(startUrl);

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1);
            });
            expect(window.location.href).toBe(losUrl);
        } finally {
            window.history.replaceState(null, '', startUrl);
            if (previousSettings === undefined) delete storyWindow.appSettings;
            else storyWindow.appSettings = previousSettings;
        }
    });

    it('kobler fagsak, journalpost og sakstype-fallback fra Redux uten å lukke oppgaven', async () => {
        const user = userEvent.setup();
        const state = {
            felles: { journalpost: journalpost() },
            fordelingState: { fagsak: { fagsakId: FAGSAK_ID }, dokumenttype: FordelingDokumenttype.PLEIEPENGER },
            identState: { søkerId: TEST_IDENT },
        };
        renderWithStore(<SendBrevPåFagsak />, state, `/journalpost/${JOURNALPOST_ID}/send-brev-fagsak/`);

        await sendLetter(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Fortsett' }));

        expect(await screen.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.')).toBeVisible();
        expect(requests.find(({ url }) => url === ApiPath.BREV_BESTILL)?.body).toEqual({
            soekerId: TEST_IDENT,
            mottaker: { type: 'AKTØRID', id: AKTØR_ID },
            fagsakYtelseType: 'PSB',
            dokumentMal: MAL,
            dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
            journalpostId: JOURNALPOST_ID,
            saksnummer: FAGSAK_ID,
        });
        expect(requests.some(({ url }) => url.startsWith(ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', ''))))
            .toBe(false);
    });

    it('går tilbake ved manglende state på fagsak-inngangen', async () => {
        renderWithStore(
            <SendBrevPåFagsak />,
            { felles: {}, fordelingState: {}, identState: {} },
            `/journalpost/${JOURNALPOST_ID}/send-brev-fagsak/`,
        );

        await waitFor(() =>
            expect(screen.getByRole('status', { name: 'Gjeldende adresse' })).toHaveTextContent(
                `/journalpost/${JOURNALPOST_ID}/`,
            ),
        );
        expect(screen.queryByRole('combobox', { name: 'Velg mal' })).not.toBeInTheDocument();
    });

    it('bruker journalpostident og GENERELL_SAK for behandlet journalpost uten fagsak', async () => {
        const user = userEvent.setup();
        const state = {
            felles: { journalpost: journalpost({ sak: undefined }) },
            fordelingState: { dokumenttype: FordelingDokumenttype.PLEIEPENGER },
        };
        renderWithStore(
            <SendBrevBehandletJp />,
            state,
            `/journalpost/${JOURNALPOST_ID}/brev-behandlet-journalpost/`,
        );

        await sendLetter(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Fortsett' }));
        expect(requests.find(({ url }) => url === ApiPath.BREV_BESTILL)?.body).toMatchObject({
            soekerId: TEST_IDENT,
            journalpostId: JOURNALPOST_ID,
            fagsakYtelseType: 'PSB',
            saksnummer: 'GENERELL_SAK',
        });

        await user.click(screen.getByRole('button', { name: 'Tilbake' }));
        expect(screen.getByRole('status', { name: 'Gjeldende adresse' })).toHaveTextContent(
            `/journalpost/${JOURNALPOST_ID}/`,
        );
    });

    it('viser guard uten brevform når sakstype er uavklart', () => {
        const state = {
            felles: {
                journalpost: journalpost({
                    sak: {
                        fagsakId: FAGSAK_ID,
                        sakstype: DokumenttypeForkortelse.UKJENT,
                        gyldigPeriode: { fom: '2024-01-01', tom: '2024-12-31' },
                    },
                }),
            },
            fordelingState: { dokumenttype: undefined },
        };
        renderWithStore(
            <SendBrevBehandletJp />,
            state,
            `/journalpost/${JOURNALPOST_ID}/brev-behandlet-journalpost/`,
        );

        expect(screen.getByText(/Journalposten mangler avklart ytelsestype/)).toBeVisible();
        expect(screen.queryByRole('combobox', { name: 'Velg mal' })).not.toBeInTheDocument();
    });

    it('bruker journalpostens sakstype foran valgt dokumenttype', async () => {
        const user = userEvent.setup();
        renderWithStore(
            <SendBrevBehandletJp />,
            {
                felles: {
                    journalpost: journalpost({
                        sak: {
                            fagsakId: FAGSAK_ID,
                            sakstype: DokumenttypeForkortelse.OMP,
                            gyldigPeriode: { fom: '2024-01-01', tom: '2024-12-31' },
                        },
                    }),
                },
                fordelingState: { dokumenttype: FordelingDokumenttype.PLEIEPENGER },
            },
            `/journalpost/${JOURNALPOST_ID}/brev-behandlet-journalpost/`,
        );

        await sendLetter(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Fortsett' }));
        expect(requests.find(({ url }) => url === ApiPath.BREV_BESTILL)?.body).toMatchObject({
            fagsakYtelseType: 'OMP',
            saksnummer: FAGSAK_ID,
        });
    });

    it('viser brev etter klassifisering og bruker returnert reservert saksnummer', async () => {
        const user = userEvent.setup();
        const state = {
            felles: { journalpost: journalpost() },
            fordelingState: { dokumenttype: FordelingDokumenttype.PLEIEPENGER },
            identState: { søkerId: TEST_IDENT },
        };
        renderWithStore(
            <KlassifiserModal toSøkere={false} lukkModal={vi.fn()} setFagsak={vi.fn()} />,
            state,
            '/',
            true,
        );

        await user.click(screen.getByRole('button', { name: 'Journalfør og sett på vent' }));
        await screen.findByText(/RES-12345/);
        await screen.findByRole('checkbox', { name: 'Send brev til søker, arbeidsgiver eller tredjepart' });
        await user.click(screen.getByRole('checkbox', { name: 'Send brev til søker, arbeidsgiver eller tredjepart' }));
        await sendLetter(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));

        expect(await screen.findByText('Brevet er sendt. Du kan nå sende nytt brev til annen mottaker eller gå tilbake til LOS.'))
            .toBeVisible();
        expect(requests.find(({ url }) => url === ApiPath.BREV_BESTILL)?.body).toMatchObject({
            soekerId: TEST_IDENT,
            journalpostId: JOURNALPOST_ID,
            saksnummer: 'RES-12345',
            fagsakYtelseType: 'PSB',
        });
    });

    it('åpner og sender brev i vent/lukk-modal uten å sette på vent eller lukke oppgaven', async () => {
        const user = userEvent.setup();
        const state = {
            felles: { journalpost: journalpost() },
            fordelingState: { dokumenttype: FordelingDokumenttype.PLEIEPENGER },
            identState: { søkerId: TEST_IDENT },
        };
        renderWithStore(
            <VentLukkBrevModal open onClose={vi.fn()} />,
            state,
            `/journalpost/${JOURNALPOST_ID}/`,
            true,
        );

        await user.click(screen.getByRole('checkbox', { name: 'Send brev til søker, arbeidsgiver eller tredjepart' }));
        await sendLetter(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await screen.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.');

        expect(requests.find(({ url }) => url === ApiPath.BREV_BESTILL)?.body).toMatchObject({
            soekerId: TEST_IDENT,
            journalpostId: JOURNALPOST_ID,
            saksnummer: FAGSAK_ID,
            fagsakYtelseType: 'PSB',
        });
        expect(requests.some(({ url }) => url.includes('/journalpost/vent/'))).toBe(false);
        expect(requests.some(({ url }) => url.includes('/journalpost/lukk/'))).toBe(false);
    });

    it('viser varsel om usendt brev etter feil og skjuler det etter vellykket sending', async () => {
        const user = userEvent.setup();
        sendReplies = [new Response(null, { status: 500 }), new Response(null, { status: 200 })];
        renderWithStore(
            <HåndterInntektsmeldingUtenKrav journalpost={journalpost()} søkerId={TEST_IDENT} />,
            {
                felles: {},
                fordelingState: {},
                identState: {},
                fordelingSettPåVentState: {},
                fordelingFerdigstillJournalpostState: {},
            },
            '/',
        );

        await user.click(screen.getByRole('checkbox', { name: 'Send brev til søker, arbeidsgiver eller tredjepart' }));
        await sendLetter(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Fortsett' }));
        expect(await screen.findByText('Sending av brev feilet.')).toBeVisible();

        await user.click(screen.getByRole('radio', { name: 'Ferdigstill journalpost' }));
        await user.click(screen.getByRole('button', { name: 'Ferdigstill journalpost' }));
        expect(await screen.findByText(/påbegynt brev som ikke er sendt/)).toBeVisible();
        await user.click(screen.getByRole('button', { name: 'Avbryt' }));

        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Fortsett' }));
        await screen.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.');
        const bookings = requests.filter(({ url }) => url === ApiPath.BREV_BESTILL);
        expect(bookings).toHaveLength(2);
        expect(bookings[1]?.body).toEqual({
            soekerId: TEST_IDENT,
            mottaker: { type: 'AKTØRID', id: AKTØR_ID },
            fagsakYtelseType: 'OMP',
            dokumentMal: MAL,
            dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
            journalpostId: JOURNALPOST_ID,
            saksnummer: 'GENERELL_SAK',
        });

        await user.click(screen.getByRole('radio', { name: 'Ferdigstill journalpost' }));
        await user.click(screen.getByRole('button', { name: 'Ferdigstill journalpost' }));
        expect(screen.queryByText(/påbegynt brev som ikke er sendt/)).not.toBeInTheDocument();
    });
});
