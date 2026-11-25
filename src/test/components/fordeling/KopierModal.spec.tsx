import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiPath } from 'app/apiConfig';
import { PunsjDialogProvider } from 'app/components/PunsjDialog';
import KopierModal from 'app/fordeling/Komponenter/KopierModal';
import messages from 'app/i18n/nb.json';
import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import { setDokumenttypeAction, setFagsakAction } from 'app/state/actions/FordelingActions';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { rootReducer } from 'app/state/RootState';
import { setJournalpostAction } from 'app/state/reducers/FellesReducer';
import { redirectToLos } from 'app/utils/envUtils';
import fagsaker from '../../../mocks/fixtures/fagsaker.json';
import journalpost from '../../../mocks/fixtures/jpPSB312.json';

vi.mock('app/utils/envUtils', async (importOriginal) => ({
    ...(await importOriginal<typeof import('app/utils/envUtils')>()),
    redirectToLos: vi.fn(),
}));

const sourceId = '930318';
const copiedId = '9303181';
const applicant = journalpost.norskIdent;
const target = fagsaker[2];
const child = target.pleietrengende!.identitetsnummer;
const copyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', sourceId);
const closePath = ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', sourceId);
const copyBody = { til: applicant, barn: child, ytelse: 'PSB' };
const closeBody = { norskIdent: applicant, sak: { fagsakId: journalpost.sak.fagsakId, sakstype: 'FAGSAK' } };

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });
    return { promise, resolve };
};

const copySuccess = () =>
    Response.json(
        {
            nyJournalpostId: copiedId,
            saksnummer: target.fagsakId,
            til: applicant,
            pleietrengende: child,
            annenPart: null,
            ytelse: 'PSB',
        },
        { status: 201 },
    );
const closeSuccess = () => new Response(null, { status: 200 });

const dialogRoots: HTMLDivElement[] = [];

const setup = (responses: Promise<Response>[]) => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(() => {
        const response = responses.shift();
        if (!response) throw new Error('Uventet HTTP-kall');
        return response;
    });
    vi.stubGlobal('fetch', fetchMock);
    const store = configureStore({ reducer: rootReducer });
    const sourceCase = {
        ...journalpost.sak,
        sakstype: DokumenttypeForkortelse.PSB,
        gyldigPeriode: journalpost.sak.gyldigPeriode ?? { fom: '', tom: '' },
        pleietrengendeIdent: journalpost.sak.pleietrengendeIdent ?? undefined,
        relatertPersonIdent: journalpost.sak.relatertPersonIdent ?? undefined,
    };
    store.dispatch(
        setJournalpostAction({
            ...journalpost,
            journalpostId: sourceId,
            journalpostStatus: journalpostStatus.JOURNALFOERT,
            venter: undefined,
            sak: sourceCase,
        }),
    );
    store.dispatch(setDokumenttypeAction(FordelingDokumenttype.PLEIEPENGER));
    store.dispatch(setFagsakAction(sourceCase));
    store.dispatch(setIdentFellesAction(applicant, child));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const dialogRoot = document.createElement('div');
    document.body.append(dialogRoot);
    dialogRoots.push(dialogRoot);
    const lukkModal = vi.fn();
    render(
        <Provider store={store}>
            <QueryClientProvider client={client}>
                <IntlProvider messages={messages} locale="nb">
                    <PunsjDialogProvider rootElement={dialogRoot}>
                        <KopierModal
                            søkerId={applicant}
                            pleietrengendeId={child}
                            journalpostId={sourceId}
                            fagsakId={target.fagsakId}
                            lukkModal={lukkModal}
                        />
                    </PunsjDialogProvider>
                </IntlProvider>
            </QueryClientProvider>
        </Provider>,
    );
    return { fetchMock, lukkModal, dialogRoot, client, user: userEvent.setup() };
};

const expectCall = (fetchMock: ReturnType<typeof setup>['fetchMock'], index: number, path: string, body: object) => {
    const [url, init] = fetchMock.mock.calls[index];
    expect(url).toBe(path);
    expect(init).toMatchObject({
        method: 'post',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });
    expect(new Headers(init?.headers).get('X-Nav-NorskIdent')).toBeNull();
    expect(JSON.parse(String(init?.body))).toEqual(body);
};

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    dialogRoots.splice(0).forEach((element) => element.remove());
});

describe('Kopier og lukk journalpost', () => {
    it('viser sammendraget og avbryter uten HTTP-kall', async () => {
        const { user, lukkModal, fetchMock } = setup([]);
        expect(screen.getByRole('heading', { name: 'Vil du kopiere og lukke journalposten?' })).toBeVisible();
        expect(screen.getByRole('dialog')).toHaveTextContent(target.fagsakId);
        expect(screen.getByRole('dialog')).toHaveTextContent(child);
        expect(screen.getByRole('dialog')).toHaveTextContent('Denne journalposten vil bli lukket.');
        await user.click(screen.getByRole('button', { name: 'Avbryt' }));
        expect(lukkModal).toHaveBeenCalledOnce();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(redirectToLos).not.toHaveBeenCalled();
    });

    it('kopierer før lukking og går bare til LOS etter et eksplisitt valg', async () => {
        const copy = deferred<Response>();
        const close = deferred<Response>();
        const { user, fetchMock } = setup([copy.promise, close.promise]);
        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expectCall(fetchMock, 0, copyPath, copyBody);
        expect(screen.queryByText('Kopi av journalpost opprettet.')).not.toBeInTheDocument();
        expect(redirectToLos).not.toHaveBeenCalled();
        await act(async () => copy.resolve(copySuccess()));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
        expectCall(fetchMock, 1, closePath, closeBody);
        expect(screen.getByText('Kopi av journalpost opprettet.')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Tilbake til LOS' })).toBeDisabled();
        expect(redirectToLos).not.toHaveBeenCalled();
        await act(async () => close.resolve(closeSuccess()));
        expect(await screen.findByText('Journalposten ble lukket')).toBeVisible();
        expect(screen.queryByRole('button', { name: 'Lukk journalpost' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Tilbake til LOS' }));
        expect(redirectToLos).toHaveBeenCalledOnce();
    });

    it('viser generell kopieringsfeil og prøver kopiering på nytt før én lukking', async () => {
        const { user, fetchMock } = setup([
            Promise.resolve(new Response(null, { status: 500 })),
            Promise.resolve(copySuccess()),
            Promise.resolve(closeSuccess()),
        ]);
        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(await screen.findByText('Noe gikk galt. Prøv igjen senere.')).toBeVisible();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(redirectToLos).not.toHaveBeenCalled();
        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(await screen.findByText('Journalposten ble lukket')).toBeVisible();
        expect(screen.queryByText('Noe gikk galt. Prøv igjen senere.')).not.toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expectCall(fetchMock, 0, copyPath, copyBody);
        expectCall(fetchMock, 1, copyPath, copyBody);
        expectCall(fetchMock, 2, closePath, closeBody);
    });

    it('viser opprettet kopi og lukkefeil når nytt kopieringsforsøk svarer 202', async () => {
        const { user, fetchMock } = setup([
            Promise.resolve(new Response(null, { status: 500 })),
            Promise.resolve(Response.json({ saksnummer: target.fagsakId }, { status: 202 })),
            Promise.resolve(new Response(null, { status: 500 })),
        ]);
        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(await screen.findByText('Noe gikk galt. Prøv igjen senere.')).toBeVisible();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(redirectToLos).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(await screen.findByText('Error ved lukking av journalpost. Prøv igjen eller gå til LOS.')).toBeVisible();
        expect(screen.getByText('Kopi av journalpost opprettet.')).toBeVisible();
        expect(screen.queryByText('Noe gikk galt. Prøv igjen senere.')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Lukk journalpost' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Tilbake til LOS' })).toBeEnabled();
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expectCall(fetchMock, 0, copyPath, copyBody);
        expectCall(fetchMock, 1, copyPath, copyBody);
        expectCall(fetchMock, 2, closePath, closeBody);
        expect(redirectToLos).not.toHaveBeenCalled();
    });

    it.each([
        [403, 'Mangler rettigheter for opprettelse av kopi av journalpost.'],
        [409, 'Journalpost kan ikke kopieres.'],
    ])('viser kopieringsfeil %i uten å lukke', async (status, message) => {
        const { user, fetchMock } = setup([Promise.resolve(new Response('Avvist', { status }))]);
        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(await screen.findByText(message)).toBeVisible();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expectCall(fetchMock, 0, copyPath, copyBody);
        expect(redirectToLos).not.toHaveBeenCalled();
    });

    it('prøver bare lukking på nytt og sperrer retur mens lukking pågår', async () => {
        const retry = deferred<Response>();
        const { user, fetchMock } = setup([
            Promise.resolve(copySuccess()),
            Promise.resolve(new Response(null, { status: 500 })),
            retry.promise,
        ]);
        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(await screen.findByText('Error ved lukking av journalpost. Prøv igjen eller gå til LOS.')).toBeVisible();
        expect(screen.getByText('Kopi av journalpost opprettet.')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Tilbake til LOS' })).toBeEnabled();
        await user.click(screen.getByRole('button', { name: 'Lukk journalpost' }));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
        expect(screen.getByRole('button', { name: 'Tilbake til LOS' })).toBeDisabled();
        await act(async () => retry.resolve(closeSuccess()));
        expect(await screen.findByText('Journalposten ble lukket')).toBeVisible();
        expect(
            screen.queryByText('Error ved lukking av journalpost. Prøv igjen eller gå til LOS.'),
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Lukk journalpost' })).not.toBeInTheDocument();
        expectCall(fetchMock, 0, copyPath, copyBody);
        expectCall(fetchMock, 1, closePath, closeBody);
        expectCall(fetchMock, 2, closePath, closeBody);
        expect(redirectToLos).not.toHaveBeenCalled();
    });

    it('kan gå til LOS etter mislykket lukking uten nytt lukkeforsøk', async () => {
        const { user, fetchMock } = setup([
            Promise.resolve(copySuccess()),
            Promise.resolve(new Response(null, { status: 500 })),
        ]);
        await user.click(screen.getByRole('button', { name: 'Kopier' }));
        expect(await screen.findByText('Error ved lukking av journalpost. Prøv igjen eller gå til LOS.')).toBeVisible();
        expect(screen.queryByText('Journalposten ble lukket')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Tilbake til LOS' }));
        expect(redirectToLos).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
