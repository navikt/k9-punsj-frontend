import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    getJournalpostEtterKopiering,
    klassifiserDokument,
    kopierJournalpostNotRedux,
    postBehandlingsAar,
    settJournalpostPaaVentUtenSøknadId,
} from 'app/api/api';
import { ApiPath } from 'app/apiConfig';
import { PunsjDialogProvider } from 'app/components/PunsjDialog';
import KlassifiserModal from 'app/fordeling/Komponenter/KlassifiserModal';
import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import type { IJournalpost } from 'app/models/types';
import { setDokumenttypeAction, setFagsakAction } from 'app/state/actions/FordelingActions';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { rootReducer } from 'app/state/RootState';
import type Fagsak from 'app/types/Fagsak';
import messages from 'app/i18n/nb.json';
import { setJournalpostAction } from 'app/state/reducers/FellesReducer';
import fagsaker from '../../../../cypress/fixtures/fagsaker.json';
import journalpostFixture from '../../../../cypress/fixtures/jpPSB300.json';

vi.mock('app/api/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('app/api/api')>();
    return {
        ...actual,
        getJournalpostEtterKopiering: vi.fn(),
        klassifiserDokument: vi.fn(),
        kopierJournalpostNotRedux: vi.fn(),
        postBehandlingsAar: vi.fn(),
        settJournalpostPaaVentUtenSøknadId: vi.fn(),
    };
});

const JOURNALPOST_ID = '300';
const SØKER_ID = '17420373147';
const ANNEN_SØKER_ID = '02918496664';
const SAK_UTEN_BARN: Fagsak = {
    fagsakId: '1DMU93A',
    sakstype: DokumenttypeForkortelse.PSB,
    gyldigPeriode: { fom: '2024-04-15', tom: '2024-04-15' },
};
const SAK_MED_BARN: Fagsak = {
    fagsakId: '1DQBDDC',
    sakstype: DokumenttypeForkortelse.PSB,
    pleietrengendeIdent: '24420167209',
    gyldigPeriode: { fom: '2024-04-15', tom: '2024-04-15' },
};
const RESERVERT_MED_BARN: Fagsak = {
    fagsakId: fagsaker[3].fagsakId,
    sakstype: DokumenttypeForkortelse.PSB,
    pleietrengendeIdent: fagsaker[3].pleietrengende!.identitetsnummer,
    gyldigPeriode: fagsaker[3].gyldigPeriode,
    reservert: true,
};
const RESERVERT_UTEN_BARN: Fagsak = {
    fagsakId: fagsaker[4].fagsakId,
    sakstype: DokumenttypeForkortelse.PSB,
    gyldigPeriode: fagsaker[4].gyldigPeriode,
    reservert: true,
};
const TO_SØKERE = { toSøkere: true, kanKopieres: true, annenSøkerIdent: ANNEN_SØKER_ID };
const JOURNALFØRT_MED_BARN: IJournalpost = {
    ...journalpostFixture,
    venter: undefined,
    journalpostId: JOURNALPOST_ID,
    journalpostStatus: journalpostStatus.JOURNALFOERT,
    erFerdigstilt: true,
    sak: { ...SAK_MED_BARN, reservertSaksnummer: false },
};

type ModalOptions = {
    toSøkere?: boolean;
    kanKopieres?: boolean;
    annenSøkerIdent?: string;
};

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((complete) => {
        resolve = complete;
    });
    return { promise, resolve };
};

const Location = () => {
    const location = useLocation();
    return <output aria-label="Gjeldende adresse">{location.pathname}</output>;
};

const createStore = (
    fagsak: Fagsak | undefined,
    pleietrengendeIdent = fagsak?.pleietrengendeIdent,
    options: ModalOptions = {},
) => {
    const store = configureStore({ reducer: rootReducer });
    store.dispatch(
        setJournalpostAction({
            journalpostId: JOURNALPOST_ID,
            norskIdent: SØKER_ID,
            dokumenter: [],
            journalpostStatus: journalpostStatus.MOTTATT,
            kanSendeInn: true,
            kanKopieres: options.kanKopieres,
            erSaksbehandler: true,
            erFerdigstilt: false,
        }),
    );
    store.dispatch(setDokumenttypeAction(FordelingDokumenttype.PLEIEPENGER));
    store.dispatch(setFagsakAction(fagsak));
    store.dispatch(setIdentFellesAction(SØKER_ID, pleietrengendeIdent, options.annenSøkerIdent));
    return store;
};

const renderModal = (
    fagsak: Fagsak | undefined,
    fortsett: boolean,
    pleietrengendeIdent?: string,
    options: ModalOptions = {},
) => {
    const store = createStore(fagsak, pleietrengendeIdent ?? fagsak?.pleietrengendeIdent, options);
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const dialogRoot = document.createElement('div');
    document.body.append(dialogRoot);
    const lukkModal = vi.fn();
    const setFagsak = vi.fn();

    render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <IntlProvider messages={messages} locale="nb">
                    <MemoryRouter initialEntries={[`/journalpost/${JOURNALPOST_ID}/`]}>
                        <PunsjDialogProvider rootElement={dialogRoot}>
                            <Location />
                            <KlassifiserModal
                                toSøkere={options.toSøkere ?? false}
                                fortsett={fortsett}
                                lukkModal={lukkModal}
                                setFagsak={setFagsak}
                            />
                        </PunsjDialogProvider>
                    </MemoryRouter>
                </IntlProvider>
            </QueryClientProvider>
        </Provider>,
    );

    return { store, queryClient, lukkModal, setFagsak, dialogRoot };
};

const expectModalInfo = (fagsak: Fagsak | undefined, pleietrengendeIdent = fagsak?.pleietrengendeIdent) => {
    const infoElement = screen.getByRole('dialog').querySelector('[data-test-id="klassifiseringInfo"]');
    if (!(infoElement instanceof HTMLElement)) throw new Error('Klassifiseringsinformasjonen mangler i dialogen.');
    const info = within(infoElement);
    expect(info.getByText('Sakstype:')).toBeVisible();
    expect(info.getByText('Pleiepenger sykt barn')).toBeVisible();
    expect(info.getByText('Søkers ID:')).toBeVisible();
    expect(info.getByText(SØKER_ID)).toBeVisible();
    if (fagsak) {
        expect(info.getByText('Saksnummer:')).toBeVisible();
        expect(info.getByText(fagsak.fagsakId)).toBeVisible();
        expect(info.getByText('Periode:')).toBeVisible();
        expect(infoElement).toHaveTextContent('15.04.2024');
    } else {
        expect(info.queryByText('Saksnummer:')).not.toBeInTheDocument();
        expect(info.queryByText('Periode:')).not.toBeInTheDocument();
    }

    if (pleietrengendeIdent) {
        expect(info.getByText('Pleietrengendes ID:')).toBeVisible();
        expect(info.getByText(pleietrengendeIdent)).toBeVisible();
    } else {
        expect(info.queryByText('Pleietrengendes ID:')).not.toBeInTheDocument();
    }

    expect(screen.getByText('Informasjonen kan ikke endres etter journalposten er journalført.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Gå til LOS' })).not.toBeInTheDocument();
};

const expectNoMutationCalls = () => {
    expect(klassifiserDokument).not.toHaveBeenCalled();
    expect(kopierJournalpostNotRedux).not.toHaveBeenCalled();
    expect(postBehandlingsAar).not.toHaveBeenCalled();
    expect(settJournalpostPaaVentUtenSøknadId).not.toHaveBeenCalled();
};

const expectCopyCalls = (count: number) => {
    expect(klassifiserDokument).toHaveBeenCalledExactlyOnceWith({
        brukerIdent: SØKER_ID,
        pleietrengendeIdent: SAK_MED_BARN.pleietrengendeIdent,
        relatertPersonIdent: '',
        journalpostId: JOURNALPOST_ID,
        fagsakYtelseTypeKode: DokumenttypeForkortelse.PSB,
        periode: SAK_MED_BARN.gyldigPeriode,
        saksnummer: SAK_MED_BARN.fagsakId,
        barnAktørIder: undefined,
    });
    expect(kopierJournalpostNotRedux).toHaveBeenCalledTimes(count);
    for (let call = 1; call <= count; call++) {
        expect(kopierJournalpostNotRedux).toHaveBeenNthCalledWith(
            call,
            ANNEN_SØKER_ID,
            JOURNALPOST_ID,
            DokumenttypeForkortelse.PSB,
            SAK_MED_BARN.pleietrengendeIdent,
            undefined,
            undefined,
        );
    }
    expect(postBehandlingsAar).not.toHaveBeenCalled();
    expect(settJournalpostPaaVentUtenSøknadId).not.toHaveBeenCalled();
};

beforeEach(() => {
    vi.mocked(getJournalpostEtterKopiering).mockReset();
    vi.mocked(klassifiserDokument).mockReset();
    vi.mocked(kopierJournalpostNotRedux).mockReset();
    vi.mocked(postBehandlingsAar).mockReset();
    vi.mocked(settJournalpostPaaVentUtenSøknadId).mockReset();
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('KlassifiserModal', () => {
    it.each<{
        name: string;
        fagsak?: Fagsak;
        fortsett: boolean;
        pleietrengendeIdent?: string;
    }>([
        { name: 'Fortsett med eksisterende sak og barn', fagsak: SAK_MED_BARN, fortsett: true },
        { name: 'Vent med eksisterende sak og barn', fagsak: SAK_MED_BARN, fortsett: false },
        { name: 'Vent med eksisterende sak uten barn', fagsak: SAK_UTEN_BARN, fortsett: false },
        { name: 'Fortsett med reservert sak og barn', fagsak: RESERVERT_MED_BARN, fortsett: true },
        { name: 'Vent med reservert sak og barn', fagsak: RESERVERT_MED_BARN, fortsett: false },
        { name: 'Vent med reservert sak uten barn', fagsak: RESERVERT_UTEN_BARN, fortsett: false },
        { name: 'Vent uten fagsak med barn', fortsett: false, pleietrengendeIdent: '18410162721' },
    ])('$name viser valgt sak og avbryter uten å journalføre', async ({ fagsak, fortsett, pleietrengendeIdent }) => {
        const user = userEvent.setup();
        const { lukkModal, setFagsak } = renderModal(fagsak, fortsett, pleietrengendeIdent);

        expect(
            screen.getByRole('heading', {
                name: fortsett
                    ? 'Vil du lagre følgende informasjon til journalposten?'
                    : 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
            }),
        ).toBeVisible();
        expectModalInfo(fagsak, pleietrengendeIdent ?? fagsak?.pleietrengendeIdent);
        expect(
            screen.getByRole('button', {
                name: fortsett ? 'Journalfør journalposten' : 'Journalfør og sett på vent',
            }),
        ).toBeEnabled();

        await user.click(screen.getByRole('button', { name: 'Avbryt' }));

        expect(lukkModal).toHaveBeenCalledOnce();
        expect(setFagsak).not.toHaveBeenCalled();
        expectNoMutationCalls();
    });

    it('viser modal for Fortsett uten fagsak med barn og avbryter uten mutasjon', async () => {
        const user = userEvent.setup();
        const barnId = '53488838241';
        const { lukkModal, setFagsak } = renderModal(undefined, true, barnId);

        expect(
            screen.getByRole('heading', { name: 'Vil du lagre følgende informasjon til journalposten?' }),
        ).toBeVisible();
        expectModalInfo(undefined, barnId);
        expect(screen.getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();

        await user.click(screen.getByRole('button', { name: 'Avbryt' }));

        expect(lukkModal).toHaveBeenCalledOnce();
        expect(setFagsak).not.toHaveBeenCalled();
        expectNoMutationCalls();
    });

    it('viser modal for Vent uten fagsak eller barn og avbryter uten mutasjon', async () => {
        const user = userEvent.setup();
        const { lukkModal, setFagsak } = renderModal(undefined, false);

        expect(
            screen.getByRole('heading', {
                name: 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
            }),
        ).toBeVisible();
        expectModalInfo(undefined);
        expect(screen.getByRole('button', { name: 'Journalfør og sett på vent' })).toBeEnabled();

        await user.click(screen.getByRole('button', { name: 'Avbryt' }));

        expect(lukkModal).toHaveBeenCalledOnce();
        expect(setFagsak).not.toHaveBeenCalled();
        expectNoMutationCalls();
    });

    it('journalfører, oppdaterer Redux fra samme journalpost og navigerer etter vellykket refresh', async () => {
        const user = userEvent.setup();
        const updatedJournalpost: IJournalpost = {
            journalpostId: JOURNALPOST_ID,
            norskIdent: SØKER_ID,
            dokumenter: [],
            journalpostStatus: journalpostStatus.JOURNALFOERT,
            kanSendeInn: true,
            erSaksbehandler: true,
            erFerdigstilt: true,
            sak: SAK_MED_BARN,
        };
        vi.mocked(klassifiserDokument).mockResolvedValue({ saksnummer: SAK_MED_BARN.fagsakId });
        vi.mocked(getJournalpostEtterKopiering).mockResolvedValue(updatedJournalpost);
        const { store, queryClient } = renderModal(SAK_MED_BARN, true);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        await waitFor(() =>
            expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent('pleiepenger-sykt-barn/'),
        );

        expect(klassifiserDokument).toHaveBeenCalledWith({
            brukerIdent: SØKER_ID,
            pleietrengendeIdent: SAK_MED_BARN.pleietrengendeIdent,
            relatertPersonIdent: '',
            journalpostId: JOURNALPOST_ID,
            fagsakYtelseTypeKode: DokumenttypeForkortelse.PSB,
            periode: SAK_MED_BARN.gyldigPeriode,
            saksnummer: SAK_MED_BARN.fagsakId,
            barnAktørIder: undefined,
        });
        expect(getJournalpostEtterKopiering).toHaveBeenCalledOnce();
        expect(getJournalpostEtterKopiering).toHaveBeenCalledWith(JOURNALPOST_ID);
        expect(store.getState().felles.journalpost).toEqual(updatedJournalpost);
        expect(kopierJournalpostNotRedux).not.toHaveBeenCalled();
        expect(postBehandlingsAar).not.toHaveBeenCalled();
        expect(settJournalpostPaaVentUtenSøknadId).not.toHaveBeenCalled();

        queryClient.clear();
    });

    it('bruker det returnerte nye nummeret i callback, oppdaterer journalpost og navigerer til PSB', async () => {
        const user = userEvent.setup();
        const nyttNummer = 'NYPSB12';
        const barnId = '18410162721';
        expect(fagsaker.map((sak) => sak.fagsakId)).not.toContain(nyttNummer);
        const nyFagsak: Fagsak = {
            fagsakId: nyttNummer,
            sakstype: DokumenttypeForkortelse.PSB,
            pleietrengendeIdent: barnId,
            gyldigPeriode: { fom: '', tom: '' },
            reservertSaksnummer: true,
        };
        const refreshed: IJournalpost = {
            ...journalpostFixture,
            venter: undefined,
            journalpostId: JOURNALPOST_ID,
            journalpostStatus: journalpostStatus.JOURNALFOERT,
            erFerdigstilt: true,
            sak: nyFagsak,
        };
        vi.mocked(klassifiserDokument).mockResolvedValue({ saksnummer: nyttNummer });
        vi.mocked(getJournalpostEtterKopiering).mockResolvedValue(refreshed);
        const { store, queryClient, setFagsak } = renderModal(undefined, true, barnId);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        await waitFor(() =>
            expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(/^\/pleiepenger-sykt-barn\/$/),
        );

        expect(klassifiserDokument).toHaveBeenCalledExactlyOnceWith({
            brukerIdent: SØKER_ID,
            pleietrengendeIdent: barnId,
            relatertPersonIdent: '',
            journalpostId: JOURNALPOST_ID,
            fagsakYtelseTypeKode: DokumenttypeForkortelse.PSB,
            periode: undefined,
            saksnummer: undefined,
            barnAktørIder: undefined,
        });
        expect(setFagsak).toHaveBeenCalledExactlyOnceWith({ ...nyFagsak, behandlingsår: undefined });
        expect(getJournalpostEtterKopiering).toHaveBeenCalledExactlyOnceWith(JOURNALPOST_ID);
        expect(store.getState().felles.journalpost).toEqual(refreshed);
        expect(kopierJournalpostNotRedux).not.toHaveBeenCalled();
        expect(postBehandlingsAar).not.toHaveBeenCalled();
        expect(settJournalpostPaaVentUtenSøknadId).not.toHaveBeenCalled();
        queryClient.clear();
    });

    it('setter på vent etter journalføring og viser LOS først når begge handlingene lykkes', async () => {
        const user = userEvent.setup();
        let completeClassification: ((response: { saksnummer: string }) => void) | undefined;
        let completeVent: (() => void) | undefined;
        vi.mocked(klassifiserDokument).mockImplementation(
            () =>
                new Promise((resolve) => {
                    completeClassification = resolve;
                }),
        );
        vi.mocked(settJournalpostPaaVentUtenSøknadId).mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    completeVent = resolve;
                }),
        );
        const { queryClient } = renderModal(SAK_MED_BARN, false);

        await user.click(screen.getByRole('button', { name: 'Journalfør og sett på vent' }));
        expect(klassifiserDokument).toHaveBeenCalledOnce();
        expect(settJournalpostPaaVentUtenSøknadId).not.toHaveBeenCalled();
        expect(screen.queryByRole('button', { name: 'Gå til LOS' })).not.toBeInTheDocument();

        completeClassification?.({ saksnummer: SAK_MED_BARN.fagsakId });
        await waitFor(() => expect(settJournalpostPaaVentUtenSøknadId).toHaveBeenCalledWith(JOURNALPOST_ID));
        expect(screen.queryByRole('button', { name: 'Gå til LOS' })).not.toBeInTheDocument();

        completeVent?.();
        expect(await screen.findByRole('button', { name: 'Gå til LOS' })).toBeEnabled();
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);
        expect(getJournalpostEtterKopiering).not.toHaveBeenCalled();

        queryClient.clear();
    });

    it('viser journalføringsfeil og lar journalføringen prøves på nytt', async () => {
        const user = userEvent.setup();
        vi.mocked(klassifiserDokument)
            .mockRejectedValueOnce(new Error('Midlertidig feil'))
            .mockResolvedValueOnce({ saksnummer: SAK_MED_BARN.fagsakId });
        vi.mocked(getJournalpostEtterKopiering).mockResolvedValue({
            journalpostId: JOURNALPOST_ID,
            norskIdent: SØKER_ID,
            dokumenter: [],
            journalpostStatus: journalpostStatus.JOURNALFOERT,
            kanSendeInn: true,
            erSaksbehandler: true,
            sak: SAK_MED_BARN,
        });
        const { queryClient } = renderModal(SAK_MED_BARN, true);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        expect(await screen.findByText('Midlertidig feil')).toBeVisible();
        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        await waitFor(() =>
            expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent('pleiepenger-sykt-barn/'),
        );

        expect(klassifiserDokument).toHaveBeenCalledTimes(2);
        expect(getJournalpostEtterKopiering).toHaveBeenCalledOnce();
        expect(settJournalpostPaaVentUtenSøknadId).not.toHaveBeenCalled();

        queryClient.clear();
    });

    it('prøver bare vent på nytt etter ventefeil', async () => {
        const user = userEvent.setup();
        vi.mocked(klassifiserDokument).mockResolvedValue({ saksnummer: SAK_MED_BARN.fagsakId });
        vi.mocked(settJournalpostPaaVentUtenSøknadId)
            .mockRejectedValueOnce(new Error('Midlertidig feil'))
            .mockResolvedValueOnce();
        const { queryClient } = renderModal(SAK_MED_BARN, false);

        await user.click(screen.getByRole('button', { name: 'Journalfør og sett på vent' }));
        expect(await screen.findByText('Midlertidig feil')).toBeVisible();
        await user.click(screen.getByRole('button', { name: 'Sett på vent' }));
        expect(await screen.findByRole('button', { name: 'Gå til LOS' })).toBeEnabled();

        expect(klassifiserDokument).toHaveBeenCalledOnce();
        expect(settJournalpostPaaVentUtenSøknadId).toHaveBeenCalledTimes(2);
        expect(getJournalpostEtterKopiering).not.toHaveBeenCalled();

        queryClient.clear();
    });

    it('journalfører, kopierer og oppdaterer originalen før brukeren går videre', async () => {
        const user = userEvent.setup();
        const classification = deferred<{ saksnummer: string }>();
        const copy = deferred<void>();
        const refresh = deferred<IJournalpost>();
        vi.mocked(klassifiserDokument).mockReturnValue(classification.promise);
        vi.mocked(kopierJournalpostNotRedux).mockReturnValue(copy.promise);
        vi.mocked(getJournalpostEtterKopiering).mockReturnValue(refresh.promise);
        const { store, queryClient, lukkModal, setFagsak } = renderModal(SAK_MED_BARN, true, undefined, TO_SØKERE);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeDisabled();
        expect(kopierJournalpostNotRedux).not.toHaveBeenCalled();
        expect(getJournalpostEtterKopiering).not.toHaveBeenCalled();

        await act(async () => classification.resolve({ saksnummer: SAK_MED_BARN.fagsakId }));
        await waitFor(() => expect(kopierJournalpostNotRedux).toHaveBeenCalledOnce());
        expect(screen.getByRole('button', { name: 'Videre' })).toBeDisabled();
        expect(screen.getByText('Journalpost kopieres....')).toBeVisible();
        expect(getJournalpostEtterKopiering).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);

        await act(async () => copy.resolve());
        await waitFor(() => expect(getJournalpostEtterKopiering).toHaveBeenCalledExactlyOnceWith(JOURNALPOST_ID));
        expect(screen.getByRole('button', { name: 'Videre' })).toBeDisabled();
        expect(screen.getByText('Sjekker journalposten for tilgangsrettigheter ....')).toBeVisible();
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);

        await act(async () => refresh.resolve(JOURNALFØRT_MED_BARN));
        expect(await screen.findByText(/Kopi av journalposten er opprettet/)).toHaveTextContent(ANNEN_SØKER_ID);
        expect(screen.getByText(/Kopi av journalposten er opprettet/)).toHaveTextContent(
            SAK_MED_BARN.pleietrengendeIdent!,
        );
        await waitFor(() => expect(screen.getByRole('button', { name: 'Videre' })).toBeEnabled());
        expect(store.getState().felles.journalpost).toEqual(JOURNALFØRT_MED_BARN);
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);
        expectCopyCalls(1);
        expect(lukkModal).not.toHaveBeenCalled();
        expect(setFagsak).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Videre' }));
        await waitFor(() =>
            expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(/^\/pleiepenger-sykt-barn\/$/),
        );
        expect(getJournalpostEtterKopiering).toHaveBeenCalledOnce();
        queryClient.clear();
    });

    it('prøver bare kopiering på nytt etter feil og krever at brukeren går videre', async () => {
        const user = userEvent.setup();
        const retry = deferred<void>();
        vi.mocked(klassifiserDokument).mockResolvedValue({ saksnummer: SAK_MED_BARN.fagsakId });
        vi.mocked(kopierJournalpostNotRedux)
            .mockRejectedValueOnce(new Error('Det oppstod en feil ved kopiering av journalpost.'))
            .mockReturnValueOnce(retry.promise);
        vi.mocked(getJournalpostEtterKopiering).mockResolvedValue(JOURNALFØRT_MED_BARN);
        const { store, queryClient, setFagsak } = renderModal(SAK_MED_BARN, true, undefined, TO_SØKERE);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        expect(await screen.findByText('Det oppstod en feil ved kopiering av journalpost.')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Videre' })).toBeEnabled();
        expect(getJournalpostEtterKopiering).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Kopier journalpost' }));
        expect(screen.getByRole('button', { name: 'Videre' })).toBeDisabled();
        expect(getJournalpostEtterKopiering).not.toHaveBeenCalled();
        await act(async () => retry.resolve());
        await waitFor(() => expect(getJournalpostEtterKopiering).toHaveBeenCalledExactlyOnceWith(JOURNALPOST_ID));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Videre' })).toBeEnabled());
        expect(screen.queryByText('Det oppstod en feil ved kopiering av journalpost.')).not.toBeInTheDocument();
        expect(screen.getByText(/Kopi av journalposten er opprettet/)).toBeVisible();
        expect(store.getState().felles.journalpost).toEqual(JOURNALFØRT_MED_BARN);
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);
        expectCopyCalls(2);
        expect(setFagsak).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Videre' }));
        await waitFor(() =>
            expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(/^\/pleiepenger-sykt-barn\/$/),
        );
        expect(getJournalpostEtterKopiering).toHaveBeenCalledOnce();
        queryClient.clear();
    });

    it('går videre med originalen etter kopieringsfeil uten å prøve kopiering på nytt', async () => {
        const user = userEvent.setup();
        const refresh = deferred<IJournalpost>();
        vi.mocked(klassifiserDokument).mockResolvedValue({ saksnummer: SAK_MED_BARN.fagsakId });
        vi.mocked(kopierJournalpostNotRedux).mockRejectedValue(
            new Error('Det oppstod en feil ved kopiering av journalpost.'),
        );
        vi.mocked(getJournalpostEtterKopiering).mockReturnValue(refresh.promise);
        const { store, queryClient, setFagsak } = renderModal(SAK_MED_BARN, true, undefined, TO_SØKERE);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        expect(await screen.findByText('Det oppstod en feil ved kopiering av journalpost.')).toBeVisible();
        expect(getJournalpostEtterKopiering).not.toHaveBeenCalled();
        await user.click(screen.getByRole('button', { name: 'Videre' }));
        await waitFor(() => expect(getJournalpostEtterKopiering).toHaveBeenCalledExactlyOnceWith(JOURNALPOST_ID));
        expect(screen.getByRole('button', { name: 'Videre' })).toBeDisabled();
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);

        await act(async () => refresh.resolve(JOURNALFØRT_MED_BARN));
        await waitFor(() =>
            expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(/^\/pleiepenger-sykt-barn\/$/),
        );
        expect(store.getState().felles.journalpost).toEqual(JOURNALFØRT_MED_BARN);
        expectCopyCalls(1);
        expect(setFagsak).not.toHaveBeenCalled();
        queryClient.clear();
    });

    it('viser tilgangsfeil og LOS ved 403 etter vellykket kopi uten å navigere', async () => {
        const user = userEvent.setup();
        vi.mocked(klassifiserDokument).mockResolvedValue({ saksnummer: SAK_MED_BARN.fagsakId });
        vi.mocked(kopierJournalpostNotRedux).mockResolvedValue();
        const api = await vi.importActual<typeof import('app/api/api')>('app/api/api');
        vi.mocked(getJournalpostEtterKopiering).mockImplementation(api.getJournalpostEtterKopiering);
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 403 }));
        vi.stubGlobal('fetch', fetchMock);
        const { store, queryClient, setFagsak } = renderModal(SAK_MED_BARN, true, undefined, TO_SØKERE);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        expect(await screen.findByText('Du har ikke tilgang til å jobbe videre med journalposten.')).toBeVisible();
        expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
            ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID),
            expect.objectContaining({ credentials: 'include' }),
        );
        expect(screen.getByText(/Kopi av journalposten er opprettet/)).toBeVisible();
        expect(screen.getByRole('button', { name: 'Gå til LOS' })).toBeEnabled();
        expect(screen.queryByRole('button', { name: 'Videre' })).not.toBeInTheDocument();
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);
        expect(getJournalpostEtterKopiering).toHaveBeenCalledExactlyOnceWith(JOURNALPOST_ID);
        expect(store.getState().felles.journalpost?.norskIdent).toBe(SØKER_ID);
        expect(store.getState().felles.journalpost?.journalpostId).toBe(JOURNALPOST_ID);
        expectCopyCalls(1);
        expect(setFagsak).not.toHaveBeenCalled();
        queryClient.clear();
    });

    it('viser tilgangsfeil etter journalføring uten å navigere', async () => {
        const user = userEvent.setup();
        vi.mocked(klassifiserDokument).mockResolvedValue({ saksnummer: SAK_MED_BARN.fagsakId });
        vi.mocked(getJournalpostEtterKopiering).mockRejectedValueOnce(
            new Error('Du har ikke tilgang til å jobbe videre med journalposten.'),
        );
        const { store, queryClient } = renderModal(SAK_MED_BARN, true);

        await user.click(screen.getByRole('button', { name: 'Journalfør journalposten' }));
        expect(await screen.findByText(/Du har ikke tilgang til å jobbe videre med journalposten/)).toBeVisible();
        expect(screen.getByLabelText('Gjeldende adresse')).toHaveTextContent(`/journalpost/${JOURNALPOST_ID}/`);
        expect(screen.getByRole('button', { name: 'Gå til LOS' })).toBeEnabled();

        expect(getJournalpostEtterKopiering).toHaveBeenCalledOnce();
        expect(getJournalpostEtterKopiering).toHaveBeenNthCalledWith(1, JOURNALPOST_ID);
        expect(store.getState().felles.journalpost?.journalpostId).toBe(JOURNALPOST_ID);
        expect(klassifiserDokument).toHaveBeenCalledOnce();

        queryClient.clear();
    });
});
