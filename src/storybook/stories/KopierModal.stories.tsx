/// <reference types="msw-storybook-addon/csf3" />

import React, { useState } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw/http';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { expect, fn, mocked, userEvent, within } from 'storybook/test';

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
import fagsaker from '../../../cypress/fixtures/fagsaker.json';
import journalpost from '../../../cypress/fixtures/jpPSB312.json';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const sourceId = '930318';
const applicant = journalpost.norskIdent;
const target = fagsaker[2];
const child = target.pleietrengende!.identitetsnummer;
const copyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', sourceId);
const closePath = ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', sourceId);
const sourceCase = {
    ...journalpost.sak,
    sakstype: DokumenttypeForkortelse.PSB,
    gyldigPeriode: journalpost.sak.gyldigPeriode ?? { fom: '', tom: '' },
    pleietrengendeIdent: journalpost.sak.pleietrengendeIdent ?? undefined,
    relatertPersonIdent: journalpost.sak.relatertPersonIdent ?? undefined,
};
const copyRequest = fn().mockName('Kopier journalpost');
const closeRequest = fn().mockName('Lukk originalen');
const returnToLos = fn().mockName('Tilbake til LOS');
const closeModal = fn().mockName('Avbryt');

const copyHandler = http.post(copyPath, async ({ request }) => {
    copyRequest(await request.json(), request.headers.get('X-Nav-NorskIdent'));
    return HttpResponse.json(
        {
            nyJournalpostId: '9303181',
            saksnummer: target.fagsakId,
            til: applicant,
            pleietrengende: child,
            annenPart: null,
            ytelse: 'PSB',
        },
        { status: 201 },
    );
});
const closeFailure = http.post(
    closePath,
    async ({ request }) => {
        closeRequest(await request.json(), request.headers.get('X-Nav-NorskIdent'));
        return new HttpResponse(null, { status: 500 });
    },
    { once: true },
);
const closeSuccess = http.post(closePath, async ({ request }) => {
    closeRequest(await request.json(), request.headers.get('X-Nav-NorskIdent'));
    return new HttpResponse(null, { status: 200 });
});

const KopierModalStory = () => {
    const [store] = useState(() => {
        const freshStore = configureStore({ reducer: rootReducer });
        freshStore.dispatch(
            setJournalpostAction({
                ...journalpost,
                journalpostId: sourceId,
                journalpostStatus: journalpostStatus.JOURNALFOERT,
                venter: undefined,
                sak: sourceCase,
            }),
        );
        freshStore.dispatch(setDokumenttypeAction(FordelingDokumenttype.PLEIEPENGER));
        freshStore.dispatch(setFagsakAction(sourceCase));
        freshStore.dispatch(setIdentFellesAction(applicant, child));
        return freshStore;
    });
    const [client] = useState(
        () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
    );
    const [dialogRoot, setDialogRoot] = useState<HTMLDivElement | null>(null);

    return (
        <Provider store={store}>
            <QueryClientProvider client={client}>
                <IntlProvider messages={messages} locale="nb">
                    <PunsjDialogProvider rootElement={dialogRoot}>
                        <div ref={setDialogRoot} />
                        <KopierModal
                            søkerId={applicant}
                            pleietrengendeId={child}
                            journalpostId={sourceId}
                            fagsakId={target.fagsakId}
                            lukkModal={closeModal}
                        />
                    </PunsjDialogProvider>
                </IntlProvider>
            </QueryClientProvider>
        </Provider>
    );
};

const meta: Meta<typeof KopierModalStory> = {
    title: 'Components/KopierModal',
    component: KopierModalStory,
    beforeEach: () => {
        closeFailure.restore();
        copyRequest.mockClear();
        closeRequest.mockClear();
        returnToLos.mockClear();
        closeModal.mockClear();
        mocked(redirectToLos).mockReset();
        mocked(redirectToLos).mockImplementation(returnToLos);
    },
    parameters: { msw: { handlers: { kopiering: [copyHandler], lukking: [closeFailure, closeSuccess] } } },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LukkefeilMedNyttForsøk: Story = {
    name: 'Lukkefeil med nytt forsøk',
    play: async () => {
        const dialog = await within(document.body).findByRole('dialog');
        await expect(
            within(dialog).getByRole('heading', { name: 'Vil du kopiere og lukke journalposten?' }),
        ).toBeVisible();
        await expect(dialog).toHaveTextContent(target.fagsakId);
        await expect(dialog).toHaveTextContent(child);
        await userEvent.click(within(dialog).getByRole('button', { name: 'Kopier' }));
        await expect(
            within(dialog).findByText('Error ved lukking av journalpost. Prøv igjen eller gå til LOS.'),
        ).resolves.toBeVisible();
        await expect(within(dialog).getByText('Kopi av journalpost opprettet.')).toBeVisible();
        await expect(copyRequest).toHaveBeenCalledOnce();
        await expect(copyRequest).toHaveBeenCalledWith({ til: applicant, barn: child, ytelse: 'PSB' }, null);
        await expect(closeRequest).toHaveBeenCalledWith(
            { norskIdent: applicant, sak: { fagsakId: sourceCase.fagsakId, sakstype: 'FAGSAK' } },
            null,
        );
        await expect(within(dialog).getByRole('button', { name: 'Tilbake til LOS' })).toBeEnabled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Lukk journalpost' }));
        await expect(within(dialog).findByText('Journalposten ble lukket')).resolves.toBeVisible();
        await expect(
            within(dialog).queryByText('Error ved lukking av journalpost. Prøv igjen eller gå til LOS.'),
        ).not.toBeInTheDocument();
        await expect(within(dialog).queryByRole('button', { name: 'Lukk journalpost' })).not.toBeInTheDocument();
        await expect(within(dialog).getByRole('button', { name: 'Tilbake til LOS' })).toBeEnabled();
        await expect(copyRequest).toHaveBeenCalledOnce();
        await expect(closeRequest).toHaveBeenCalledTimes(2);
        await expect(returnToLos).not.toHaveBeenCalled();
    },
};
