/// <reference types="msw-storybook-addon/csf3" />

import React, { useCallback, useState } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router';
import { HttpResponse, http } from 'msw/http';
import { expect, fn, mocked, userEvent, waitFor, within } from 'storybook/test';

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
import fagsaker from '../../../cypress/fixtures/fagsaker.json';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const JOURNALPOST_ID = '930301';
const SØKER_ID = journalpostFixture.norskIdent;
const ANNEN_SØKER_ID = '02918496664';
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
const RESERVERT_MED_BARN: Fagsak = {
    fagsakId: fagsaker[3].fagsakId,
    sakstype: DokumenttypeForkortelse.PSB,
    pleietrengendeIdent: fagsaker[3].pleietrengende!.identitetsnummer,
    gyldigPeriode: fagsaker[3].gyldigPeriode,
    reservert: true,
    reservertSaksnummer: true,
};
type StoryScenario =
    | 'fortsett'
    | 'vent-med-barn'
    | 'vent-uten-barn'
    | 'fortsett-uten-sak'
    | 'vent-uten-sak'
    | 'journalfor-feil'
    | 'vent-feil'
    | 'reservert-med-barn'
    | 'ny-sak-konflikt'
    | 'to-søkere-kopier-feil';

const journalpost = (kanKopieres = false): IJournalpost => ({
    journalpostId: JOURNALPOST_ID,
    norskIdent: SØKER_ID,
    dokumenter: journalpostFixture.dokumenter,
    journalpostStatus: journalpostStatus.MOTTATT,
    kanSendeInn: true,
    kanKopieres,
    erSaksbehandler: true,
    erFerdigstilt: false,
});

const createStore = (
    fagsak: Fagsak | undefined,
    pleietrengendeIdent = fagsak?.pleietrengendeIdent,
    toSøkere = false,
) => {
    const store = configureStore({ reducer: rootReducer });
    store.dispatch(setJournalpostAction(journalpost(toSøkere)));
    store.dispatch(setDokumenttypeAction(FordelingDokumenttype.PLEIEPENGER));
    store.dispatch(setFagsakAction(fagsak));
    store.dispatch(setIdentFellesAction(SØKER_ID, pleietrengendeIdent, toSøkere ? ANNEN_SØKER_ID : undefined));
    return store;
};

const Destination = ({ children }: React.PropsWithChildren) => {
    const location = useLocation();

    return location.pathname.includes('pleiepenger-sykt-barn') ? (
        <section aria-label="Lokal registreringsdestinasjon">
            <h2>Registreringsvalg for pleiepenger sykt barn</h2>
            <p>Demonstrasjonsdestinasjon, ikke applikasjonsskjermen.</p>
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
    const utenFagsak =
        scenario === 'fortsett-uten-sak' || scenario === 'vent-uten-sak' || scenario === 'ny-sak-konflikt';
    const fagsak = utenFagsak
        ? undefined
        : scenario === 'reservert-med-barn'
          ? RESERVERT_MED_BARN
          : scenario === 'vent-uten-barn'
            ? FAGSAK_UTEN_BARN
            : FAGSAK_MED_BARN;
    const pleietrengendeIdent =
        scenario === 'fortsett-uten-sak' || scenario === 'ny-sak-konflikt' ? BARNE_ID : undefined;
    const toSøkere = scenario === 'to-søkere-kopier-feil';
    const [store] = useState(() => createStore(fagsak, pleietrengendeIdent, toSøkere));
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
        scenario === 'fortsett' ||
        scenario === 'fortsett-uten-sak' ||
        scenario === 'journalfor-feil' ||
        scenario === 'reservert-med-barn' ||
        scenario === 'ny-sak-konflikt' ||
        toSøkere;

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
                                        toSøkere={toSøkere}
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

const updatedJournalpost = (fagsak: Fagsak, kanKopieres = false) => ({
    ...journalpost(kanKopieres),
    erFerdigstilt: true,
    journalpostStatus: 'JOURNALFOERT',
    sak: {
        fagsakId: fagsak.fagsakId,
        sakstype: fagsak.sakstype,
        gyldigPeriode: fagsak.gyldigPeriode,
        pleietrengendeIdent: fagsak.pleietrengendeIdent,
        relatertPersonIdent: null,
        reservertSaksnummer: fagsak.reservertSaksnummer ?? false,
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
const newCaseRequest = fn().mockName('Ny PSB-sak avvist med 409');
const reservedCaseRequest = fn().mockName('Journalfør valgt reservert PSB-sak');
const conflictHandler = http.post(ApiPath.JOURNALPOST_MOTTAK, async ({ request }) => {
    const body = (await request.json()) as { journalpostId?: string };
    if (body.journalpostId !== JOURNALPOST_ID) return;
    newCaseRequest(body, request.headers.get('X-Nav-NorskIdent'));
    return HttpResponse.json(
        {
            type: '/problem-details/post-mottak',
            status: 409,
            title: 'Konflikt ved postmottak',
            detail: 'Det finnes allerede en fagsak for barnet og ytelsen.',
            instance: '/api/journalpost/mottak',
            correlationId: 'psb-story-conflict',
        },
        { status: 409 },
    );
});
const reservedHandler = http.post(ApiPath.JOURNALPOST_MOTTAK, async ({ request }) => {
    const body = (await request.json()) as { journalpostId?: string };
    if (body.journalpostId !== JOURNALPOST_ID) return;
    reservedCaseRequest(body);
    return HttpResponse.json({ saksnummer: RESERVERT_MED_BARN.fagsakId });
});
const copyPath = ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', JOURNALPOST_ID);
const copyRequests = fn().mockName('Kopier til annen søker');
const twoApplicantsClassification = fn().mockName('Journalfør originalen');
const twoApplicantsRefresh = fn().mockName('Hent originalen etter kopiering');
const copyFailure = http.post(
    copyPath,
    async ({ request }) => {
        copyRequests(await request.json());
        return HttpResponse.json({ detail: 'Kopiering er ikke tilgjengelig.' }, { status: 409 });
    },
    { once: true },
);
const copySuccess = http.post(copyPath, async ({ request }) => {
    copyRequests(await request.json());
    return HttpResponse.json(
        {
            nyJournalpostId: '9303011',
            saksnummer: 'KOPI123',
            til: ANNEN_SØKER_ID,
            pleietrengende: BARNE_ID,
            annenPart: null,
            ytelse: 'PSB',
        },
        { status: 201 },
    );
});
const twoApplicantsHandlers = {
    klassifisering: [
        http.post(ApiPath.JOURNALPOST_MOTTAK, async ({ request }) => {
            const body = (await request.json()) as { journalpostId?: string };
            if (body.journalpostId !== JOURNALPOST_ID) return;
            twoApplicantsClassification(body);
            return HttpResponse.json({ saksnummer: FAGSAK_MED_BARN.fagsakId });
        }),
    ],
    kopiering: [copyFailure, copySuccess],
    journalpost: [
        http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', JOURNALPOST_ID), () => {
            twoApplicantsRefresh();
            return HttpResponse.json(updatedJournalpost(FAGSAK_MED_BARN, true));
        }),
    ],
    vent: [],
    brev: [],
};

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
    const utenFagsak =
        scenario === 'fortsett-uten-sak' || scenario === 'vent-uten-sak' || scenario === 'ny-sak-konflikt';
    const utenBarn = scenario === 'vent-uten-barn' || scenario === 'vent-uten-sak';
    await expect(
        within(dialog).getByRole('heading', {
            name:
                scenario === 'fortsett' ||
                scenario === 'fortsett-uten-sak' ||
                scenario === 'journalfor-feil' ||
                scenario === 'reservert-med-barn' ||
                scenario === 'ny-sak-konflikt' ||
                scenario === 'to-søkere-kopier-feil'
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
        const fagsakId =
            scenario === 'reservert-med-barn'
                ? RESERVERT_MED_BARN.fagsakId
                : scenario === 'vent-uten-barn'
                  ? FAGSAK_UTEN_BARN.fagsakId
                  : FAGSAK_MED_BARN.fagsakId;
        await expect(info.getByText(fagsakId, { exact: true })).toBeVisible();
        await expect(info.getByText('Periode:', { exact: true })).toBeVisible();
    }

    if (scenario === 'fortsett-uten-sak' || scenario === 'ny-sak-konflikt' || (!utenFagsak && !utenBarn)) {
        await expect(
            info.getByText(scenario === 'reservert-med-barn' ? RESERVERT_MED_BARN.pleietrengendeIdent! : BARNE_ID, {
                exact: true,
            }),
        ).toBeVisible();
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
        copyFailure.restore();
        lukkModalAction.mockClear();
        setFagsakActionSpy.mockClear();
        goToLosAction.mockClear();
        newCaseRequest.mockClear();
        reservedCaseRequest.mockClear();
        copyRequests.mockClear();
        twoApplicantsClassification.mockClear();
        twoApplicantsRefresh.mockClear();
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

export const ReservertSakMedBarn: Story = {
    name: 'Reservert sak med barn',
    args: { scenario: 'reservert-med-barn' },
    parameters: { msw: { handlers: makeHandlers(RESERVERT_MED_BARN, [reservedHandler]) } },
    play: async () => {
        const dialog = await expectDialogSummary('reservert-med-barn');
        await expect(dialog).toHaveTextContent('15.04.2024');
        await expect(within(dialog).queryByText(FAGSAK_MED_BARN.fagsakId, { exact: true })).not.toBeInTheDocument();
        await expect(within(dialog).getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Avbryt' }));
        await expect(dialog).not.toBeInTheDocument();
        await expect(lukkModalAction).toHaveBeenCalledOnce();
        await expect(setFagsakActionSpy).not.toHaveBeenCalled();
        await expect(reservedCaseRequest).not.toHaveBeenCalled();
    },
};

export const NySakMedBackendkonflikt: Story = {
    name: 'Ny sak med backendkonflikt (409)',
    args: { scenario: 'ny-sak-konflikt' },
    parameters: { msw: { handlers: makeHandlers(undefined, [conflictHandler]) } },
    play: async () => {
        const dialog = await expectDialogSummary('ny-sak-konflikt');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Journalfør journalposten' }));
        await expect(within(dialog).findByText('Det oppstod en feil ved klassifisering.')).resolves.toBeVisible();
        await expect(newCaseRequest).toHaveBeenCalledOnce();
        await expect(newCaseRequest).toHaveBeenCalledWith(
            {
                journalpostId: JOURNALPOST_ID,
                brukerIdent: SØKER_ID,
                pleietrengendeIdent: BARNE_ID,
                fagsakYtelseTypeKode: 'PSB',
                relatertPersonIdent: '',
            },
            SØKER_ID,
        );
        await expect(
            within(dialog).queryByText('Det finnes allerede en fagsak for barnet og ytelsen.'),
        ).not.toBeInTheDocument();
        await expect(within(dialog).queryByText(/Journalposten er journalført/)).not.toBeInTheDocument();
        await expect(within(dialog).getByRole('button', { name: 'Journalfør journalposten' })).toBeEnabled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Avbryt' }));
        await expect(dialog).not.toBeInTheDocument();
        await expect(lukkModalAction).toHaveBeenCalledOnce();
        await expect(setFagsakActionSpy).not.toHaveBeenCalled();
        await expect(
            within(document.body).queryByRole('region', { name: 'Lokal registreringsdestinasjon' }),
        ).not.toBeInTheDocument();
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

export const ToSokereKopierFeilMedVellykketNyttForsok: Story = {
    name: 'To søkere: kopieringsfeil og nytt forsøk',
    args: { scenario: 'to-søkere-kopier-feil' },
    parameters: { msw: { handlers: twoApplicantsHandlers } },
    play: async () => {
        copyFailure.restore();
        const dialog = await expectDialogSummary('to-søkere-kopier-feil');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Journalfør journalposten' }));
        await expect(
            within(dialog).findByText('Det oppstod en feil ved kopiering av journalpost.'),
        ).resolves.toBeVisible();
        await expect(within(dialog).queryByText('Kopiering er ikke tilgjengelig.')).not.toBeInTheDocument();
        await expect(twoApplicantsClassification).toHaveBeenCalledOnce();
        await expect(copyRequests).toHaveBeenCalledOnce();
        await expect(twoApplicantsRefresh).not.toHaveBeenCalled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Kopier journalpost' }));
        await expect(within(dialog).findByText(/Kopi av journalposten er opprettet/)).resolves.toHaveTextContent(
            `${ANNEN_SØKER_ID} med pleietrengende: ${BARNE_ID}`,
        );
        await waitFor(() => expect(twoApplicantsRefresh).toHaveBeenCalledOnce());
        await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Videre' })).toBeEnabled());
        await expect(twoApplicantsClassification).toHaveBeenCalledOnce();
        await expect(copyRequests).toHaveBeenCalledTimes(2);
        await expect(copyRequests).toHaveBeenNthCalledWith(1, { til: ANNEN_SØKER_ID, barn: BARNE_ID, ytelse: 'PSB' });
        await expect(copyRequests).toHaveBeenNthCalledWith(2, { til: ANNEN_SØKER_ID, barn: BARNE_ID, ytelse: 'PSB' });
        await expect(
            within(document.body).queryByRole('region', { name: 'Lokal registreringsdestinasjon' }),
        ).not.toBeInTheDocument();
    },
};
