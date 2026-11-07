/// <reference types="msw-storybook-addon/csf3" />

import React, { useCallback, useState } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router';
import { HttpResponse, http } from 'msw/http';
import { expect, fn, mocked, userEvent, within } from 'storybook/test';

import { ApiPath } from 'app/apiConfig';
import { PunsjDialogProvider } from 'app/components/PunsjDialog';
import KlassifiserModal from 'app/fordeling/Komponenter/KlassifiserModal';
import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import type { IJournalpost } from 'app/models/types';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import { setDokumenttypeAction, setFagsakAction } from 'app/state/actions/FordelingActions';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { rootReducer } from 'app/state/RootState';
import { setJournalpostAction } from 'app/state/reducers/FellesReducer';
import type Fagsak from 'app/types/Fagsak';
import { redirectToLos } from 'app/utils/envUtils';
import messages from 'app/i18n/nb.json';
import { createMockPdfBytes } from '../../mocks/mockPdf.js';
import journalpostFixture from '../../../cypress/fixtures/jpPSB300.json';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const JOURNALPOST_ID = '930301';
const SØKER_ID = journalpostFixture.norskIdent;
const BARNE_ID = '24420167209';
const PDF_BYTES = createMockPdfBytes('Test letter preview');
const FAGSAK_UTEN_BARN: Fagsak = {
    fagsakId: '1DMU93A',
    sakstype: DokumenttypeForkortelse.PSB,
    gyldigPeriode: { fom: '2024-04-15', tom: '2024-04-15' },
};
const FAGSAK_MED_BARN: Fagsak = {
    fagsakId: '1DQBDDC',
    sakstype: DokumenttypeForkortelse.PSB,
    pleietrengendeIdent: BARNE_ID,
    gyldigPeriode: { fom: '2024-04-15', tom: '2024-04-15' },
};
type StoryScenario =
    | 'fortsett'
    | 'vent-med-barn'
    | 'vent-uten-barn'
    | 'fortsett-uten-sak'
    | 'vent-uten-sak'
    | 'journalfor-feil'
    | 'vent-feil';

const journalpost = (): IJournalpost => ({
    journalpostId: JOURNALPOST_ID,
    norskIdent: SØKER_ID,
    dokumenter: journalpostFixture.dokumenter,
    journalpostStatus: journalpostStatus.MOTTATT,
    kanSendeInn: true,
    erSaksbehandler: true,
    erFerdigstilt: false,
});

const createStore = (fagsak: Fagsak | undefined, pleietrengendeIdent = fagsak?.pleietrengendeIdent) => {
    const store = configureStore({ reducer: rootReducer });
    store.dispatch(setJournalpostAction(journalpost()));
    store.dispatch(setDokumenttypeAction(FordelingDokumenttype.PLEIEPENGER));
    store.dispatch(setFagsakAction(fagsak));
    store.dispatch(setIdentFellesAction(SØKER_ID, pleietrengendeIdent));
    return store;
};

const Destination = ({ children }: React.PropsWithChildren) => {
    const location = useLocation();

    return location.pathname.includes('pleiepenger-sykt-barn') ? (
        <section aria-label="Lokal registreringsdestinasjon">
            <h2>Registreringsvalg for pleiepenger sykt barn</h2>
            <p>Journalpost-ID: {JOURNALPOST_ID}</p>
        </section>
    ) : (
        children
    );
};

const KlassifiserModalStory = ({
    scenario,
    lukkModal,
    setFagsak,
}: {
    scenario: StoryScenario;
    lukkModal: () => void;
    setFagsak: (sak: Fagsak) => void;
}) => {
    const utenFagsak = scenario === 'fortsett-uten-sak' || scenario === 'vent-uten-sak';
    const fagsak = utenFagsak ? undefined : scenario === 'vent-uten-barn' ? FAGSAK_UTEN_BARN : FAGSAK_MED_BARN;
    const pleietrengendeIdent = scenario === 'fortsett-uten-sak' ? BARNE_ID : undefined;
    const [store] = useState(() => createStore(fagsak, pleietrengendeIdent));
    const [queryClient] = useState(
        () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
    );
    const [dialogRoot, setDialogRoot] = useState<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(true);
    const closeModal = useCallback(() => {
        lukkModal();
        setOpen(false);
    }, [lukkModal]);

    const fortsett =
        scenario === 'fortsett' || scenario === 'fortsett-uten-sak' || scenario === 'journalfor-feil';

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <IntlProvider messages={messages} locale="nb">
                    <MemoryRouter initialEntries={[`/journalpost/${JOURNALPOST_ID}/`]}>
                        <PunsjDialogProvider rootElement={dialogRoot}>
                            <div ref={setDialogRoot} />
                            <Destination>
                                {open && (
                                    <KlassifiserModal
                                        toSøkere={false}
                                        fortsett={fortsett}
                                        lukkModal={closeModal}
                                        setFagsak={setFagsak}
                                    />
                                )}
                            </Destination>
                        </PunsjDialogProvider>
                    </MemoryRouter>
                </IntlProvider>
            </QueryClientProvider>
        </Provider>
    );
};

const updatedJournalpost = (fagsak: Fagsak) => ({
    ...journalpost(),
    erFerdigstilt: true,
    journalpostStatus: 'JOURNALFOERT',
    sak: {
        fagsakId: fagsak.fagsakId,
        sakstype: fagsak.sakstype,
        gyldigPeriode: fagsak.gyldigPeriode,
        pleietrengendeIdent: fagsak.pleietrengendeIdent,
        relatertPersonIdent: null,
        reservertSaksnummer: false,
    },
});

const journalpostGet = (fagsak: Fagsak) =>
    http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID), () =>
        HttpResponse.json(updatedJournalpost(fagsak)),
    );
const classify = (fagsak: Fagsak) =>
    http.post(ApiPath.JOURNALPOST_MOTTAK, async ({ request }) => {
        const body = (await request.json()) as { journalpostId?: string };
        if (body.journalpostId !== JOURNALPOST_ID) return;
        return HttpResponse.json({ saksnummer: fagsak.fagsakId }, { status: 200 });
    });
const setOnHold = http.post(
    ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID),
    () => new HttpResponse(null, { status: 200 }),
);
const letterHandlers = [
    http.get(ApiPath.BREV_MALER, () =>
        HttpResponse.json({
            GENERELT_FRITEKSTBREV: {
                kode: 'GENERELT_FRITEKSTBREV',
                navn: 'Generelt fritekstbrev',
                mottakere: [],
                linker: [],
                støtterFritekst: false,
                støtterTittelOgFritekst: true,
                støtterTredjepartsmottaker: true,
            },
        }),
    ),
    http.get(ApiPath.FINN_ARBEIDSGIVERE, () => HttpResponse.json({ organisasjoner: [] })),
    http.get(ApiPath.BREV_AKTØRID, () => HttpResponse.json(81549300)),
    http.get(ApiPath.PERSON, () =>
        HttpResponse.json({
            etternavn: 'Søker',
            fornavn: 'Test',
            fødselsdato: '1990-01-01',
            identitetsnummer: SØKER_ID,
            sammensattNavn: 'Test Søker',
        }),
    ),
    http.get(ApiPath.SØK_ORGNUMMER, () => HttpResponse.json({ navn: 'Test arbeidsgiver' })),
    http.post(ApiPath.BREV_BESTILL, () => new HttpResponse(null, { status: 200 })),
    http.post(ApiPath.BREV_FORHAANDSVIS, () =>
        HttpResponse.arrayBuffer(Uint8Array.from(PDF_BYTES).buffer, {
            headers: { 'Content-Type': 'application/pdf' },
        }),
    ),
];

const createRetryHandlers = (path: string, success: () => Response) => {
    const failure = http.post(path, () => HttpResponse.json({ detail: 'Midlertidig feil' }, { status: 500 }), {
        once: true,
    });
    return {
        reset: () => failure.restore(),
        handlers: [failure, http.post(path, success)],
    };
};

const journalforRetry = createRetryHandlers(ApiPath.JOURNALPOST_MOTTAK, () =>
    HttpResponse.json({ saksnummer: FAGSAK_MED_BARN.fagsakId }, { status: 200 }),
);
const ventRetry = createRetryHandlers(
    ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID),
    () => new HttpResponse(null, { status: 200 }),
);
const goToLosAction = fn().mockName('Gå til LOS');
const lukkModalAction = fn().mockName('Lukk klassifiseringsmodal');
const setFagsakActionSpy = fn().mockName('Oppdater valgt fagsak');

const makeHandlers = (
    fagsak: Fagsak | undefined,
    classifyHandlers = fagsak ? [classify(fagsak)] : [],
    ventHandlers = [setOnHold],
) => ({
    journalpost: fagsak ? [journalpostGet(fagsak)] : [],
    klassifisering: classifyHandlers,
    vent: fagsak ? ventHandlers : [],
    brev: letterHandlers,
});

const expectDialogSummary = async (scenario: StoryScenario) => {
    const dialog = await within(document.body).findByRole('dialog');
    const infoElement = dialog.querySelector('[data-test-id="klassifiseringInfo"]');
    if (!(infoElement instanceof HTMLElement)) throw new Error('Klassifiseringsinformasjonen mangler i dialogen.');
    const info = within(infoElement);
    const utenFagsak = scenario === 'fortsett-uten-sak' || scenario === 'vent-uten-sak';
    const utenBarn = scenario === 'vent-uten-barn' || scenario === 'vent-uten-sak';
    await expect(
        within(dialog).getByRole('heading', {
            name:
                scenario === 'fortsett' || scenario === 'fortsett-uten-sak' || scenario === 'journalfor-feil'
                    ? 'Vil du lagre følgende informasjon til journalposten?'
                    : 'Vil du lagre følgende informasjon til journalposten og sett på vent?',
        }),
    ).toBeVisible();
    await expect(info.getByText('Pleiepenger sykt barn', { exact: true })).toBeVisible();
    await expect(info.getByText(SØKER_ID, { exact: true })).toBeVisible();
    if (utenFagsak) {
        await expect(info.queryByText('Saksnummer:', { exact: true })).not.toBeInTheDocument();
        await expect(info.queryByText('Periode:', { exact: true })).not.toBeInTheDocument();
    } else {
        const fagsakId = scenario === 'vent-uten-barn' ? FAGSAK_UTEN_BARN.fagsakId : FAGSAK_MED_BARN.fagsakId;
        await expect(info.getByText(fagsakId, { exact: true })).toBeVisible();
        await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    }

    if (scenario === 'fortsett-uten-sak' || (!utenFagsak && !utenBarn)) {
        await expect(info.getByText(BARNE_ID, { exact: true })).toBeVisible();
    } else {
        await expect(info.queryByText('Pleietrengendes ID:', { exact: true })).not.toBeInTheDocument();
    }
    await expect(
        within(dialog).getByText('Informasjonen kan ikke endres etter journalposten er journalført.'),
    ).toBeVisible();
    await expect(within(dialog).queryByRole('button', { name: 'Gå til LOS' })).not.toBeInTheDocument();
    return dialog;
};

const meta: Meta<typeof KlassifiserModalStory> = {
    title: 'Components/KlassifiserModal',
    component: KlassifiserModalStory,
    args: { scenario: 'fortsett', lukkModal: lukkModalAction, setFagsak: setFagsakActionSpy },
    beforeEach: () => {
        journalforRetry.reset();
        ventRetry.reset();
        lukkModalAction.mockClear();
        setFagsakActionSpy.mockClear();
        goToLosAction.mockClear();
        mocked(redirectToLos).mockReset();
        mocked(redirectToLos).mockImplementation(goToLosAction);
    },
    decorators: [(Story, context) => <Story key={context.id} />],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const FortsettMedEksisterendeSakOgBarn: Story = {
    name: 'Fortsett med eksisterende sak og barn',
    parameters: { msw: { handlers: makeHandlers(FAGSAK_MED_BARN) } },
    play: async () => {
        const dialog = await expectDialogSummary('fortsett');
        await expect(within(dialog).getByText(BARNE_ID, { exact: true })).toBeVisible();
        await expect(within(dialog).getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();
    },
};

export const VentMedEksisterendeSakOgBarn: Story = {
    name: 'Vent med eksisterende sak og barn',
    args: { scenario: 'vent-med-barn' },
    parameters: { msw: { handlers: makeHandlers(FAGSAK_MED_BARN) } },
    play: async () => {
        const dialog = await expectDialogSummary('vent-med-barn');
        await expect(within(dialog).getByText(BARNE_ID, { exact: true })).toBeVisible();
        await expect(within(dialog).getByRole('button', { name: 'Journalfør og sett på vent' })).toBeEnabled();
    },
};

export const VentUtenBarn: Story = {
    name: 'Vent uten barn',
    args: { scenario: 'vent-uten-barn' },
    parameters: { msw: { handlers: makeHandlers(FAGSAK_UTEN_BARN) } },
    play: async () => {
        const dialog = await within(document.body).findByRole('dialog');
        await expect(within(dialog).getByText(FAGSAK_UTEN_BARN.fagsakId, { exact: true })).toBeVisible();
        await expect(within(dialog).queryByText('Pleietrengendes ID:')).not.toBeInTheDocument();
        await expect(within(dialog).getByRole('button', { name: 'Journalfør og sett på vent' })).toBeEnabled();
    },
};

export const FortsettUtenFagsakMedBarn: Story = {
    name: 'Fortsett uten fagsak med barn',
    args: { scenario: 'fortsett-uten-sak' },
    parameters: { msw: { handlers: makeHandlers(undefined) } },
    play: async () => {
        const dialog = await expectDialogSummary('fortsett-uten-sak');
        await expect(within(dialog).getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Avbryt' }));
        await expect(dialog).not.toBeInTheDocument();
        await expect(lukkModalAction).toHaveBeenCalledOnce();
        await expect(setFagsakActionSpy).not.toHaveBeenCalled();
    },
};

export const VentUtenFagsakEllerBarn: Story = {
    name: 'Vent uten fagsak eller barn',
    args: { scenario: 'vent-uten-sak' },
    parameters: { msw: { handlers: makeHandlers(undefined) } },
    play: async () => {
        const dialog = await expectDialogSummary('vent-uten-sak');
        await expect(within(dialog).getByRole('button', { name: 'Journalfør og sett på vent' })).toBeEnabled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Avbryt' }));
        await expect(dialog).not.toBeInTheDocument();
        await expect(lukkModalAction).toHaveBeenCalledOnce();
        await expect(setFagsakActionSpy).not.toHaveBeenCalled();
    },
};

export const JournalforFeilMedVellykketNyttForsok: Story = {
    name: 'Journalfør-feil med vellykket nytt forsøk',
    args: { scenario: 'journalfor-feil' },
    parameters: {
        msw: { handlers: makeHandlers(FAGSAK_MED_BARN, journalforRetry.handlers) },
    },
    play: async () => {
        journalforRetry.reset();
        const dialog = await within(document.body).findByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Journalfør journalposten' }));
        await expect(within(dialog).findByText('Det oppstod en feil ved klassifisering.')).resolves.toBeVisible();
        await expect(within(dialog).getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();
    },
};

export const VentFeilMedVellykketRetry: Story = {
    name: 'Vent-feil med vellykket retry',
    args: { scenario: 'vent-feil' },
    parameters: {
        msw: {
            handlers: makeHandlers(FAGSAK_MED_BARN, [classify(FAGSAK_MED_BARN)], ventRetry.handlers),
        },
    },
    play: async () => {
        ventRetry.reset();
        const dialog = await within(document.body).findByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Journalfør og sett på vent' }));
        await expect(
            within(dialog).findByText('Det oppstod en feil når journalpost skulle settes på vent.'),
        ).resolves.toBeVisible();
        await expect(within(dialog).getByRole('button', { name: 'Sett på vent' })).toBeEnabled();
    },
};
