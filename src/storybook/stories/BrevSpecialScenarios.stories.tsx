/// <reference types="msw-storybook-addon/csf3" />

import React, { useMemo, useState } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { http, HttpResponse } from 'msw/http';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IntlProvider } from 'react-intl';
import messages from 'app/i18n/nb.json';

import { ApiPath } from 'app/apiConfig';
import { PunsjDialogProvider } from 'app/components/PunsjDialog';
import { createMockPdfBytes } from '../../mocks/mockPdf.js';
import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import type { IJournalpost } from 'app/models/types';
import KlassifiserModal from 'app/fordeling/Komponenter/KlassifiserModal';
import HåndterInntektsmeldingUtenKrav from 'app/fordeling/Komponenter/HåndterInntektsmeldingUtenKrav';
import VentLukkBrevModal from 'app/fordeling/Komponenter/VentLukkBrevModal';
import SendBrevBehandletJp from 'app/brev-behandlet-journalpost/SendBrevBehandletJp';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const TEST_IDENT = '08438323288';
const AKTØR_ID = '81549300';
const JOURNALPOST_ID = '920001';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_INNHOLD = 'Eksempel på brevtekst';
const PDF_BYTES = createMockPdfBytes('Test letter preview');

type Scenario = 'modal' | 'usendt' | 'uavklart' | 'klassifisering';

const getJournalpost = (scenario: Scenario): IJournalpost => ({
        journalpostId: JOURNALPOST_ID,
        norskIdent: TEST_IDENT,
        dokumenter: [],
        journalpostStatus: journalpostStatus.MOTTATT,
        kanSendeInn: true,
        erSaksbehandler: true,
        sak:
            scenario === 'uavklart'
                ? {
                      fagsakId: '1DMU93A',
                      sakstype: DokumenttypeForkortelse.UKJENT,
                      gyldigPeriode: { fom: '2024-01-01', tom: '2024-12-31' },
                  }
                : {
                      fagsakId: '1DMU93A',
                      sakstype: DokumenttypeForkortelse.PSB,
                      gyldigPeriode: { fom: '2024-01-01', tom: '2024-12-31' },
                  },
        kanKopieres: false,
    });

const createScenarioState = (scenario: Scenario) => ({
    felles: { journalpost: getJournalpost(scenario) },
    fordelingState: {
        fagsak: undefined,
        dokumenttype: scenario === 'uavklart' ? undefined : FordelingDokumenttype.PLEIEPENGER,
    },
    identState: { søkerId: TEST_IDENT },
    fordelingSettPåVentState: {},
    fordelingFerdigstillJournalpostState: {},
});

const BrevScenario = ({ scenario }: { scenario: Scenario }) => {
    const [dialogRoot, setDialogRoot] = useState<HTMLDivElement | null>(null);
    const queryClient = useMemo(
        () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
        [],
    );
    const store = useMemo(
        () => configureStore({ reducer: (state = createScenarioState(scenario)) => state }),
        [scenario],
    );
    const currentJournalpost = getJournalpost(scenario);

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <IntlProvider messages={messages} locale="nb">
                    <MemoryRouter initialEntries={['/journalpost/920001/']}>
                        <PunsjDialogProvider rootElement={dialogRoot}>
                            <div style={{ margin: '24px', maxWidth: '760px' }}>
                                <div ref={setDialogRoot} />
                                {scenario === 'modal' && <VentLukkBrevModal open onClose={fn()} />}
                                {scenario === 'usendt' && (
                                    <HåndterInntektsmeldingUtenKrav journalpost={currentJournalpost} søkerId={TEST_IDENT} />
                                )}
                                {scenario === 'uavklart' && <SendBrevBehandletJp />}
                                {scenario === 'klassifisering' && (
                                    <KlassifiserModal toSøkere={false} lukkModal={fn()} setFagsak={fn()} />
                                )}
                            </div>
                        </PunsjDialogProvider>
                    </MemoryRouter>
                </IntlProvider>
            </QueryClientProvider>
        </Provider>
    );
};

const brevmaler = http.get(ApiPath.BREV_MALER, () =>
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
);
const mottakere = [
    http.get(ApiPath.FINN_ARBEIDSGIVERE, () => HttpResponse.json({ organisasjoner: [] })),
    http.get(ApiPath.BREV_AKTØRID, () => HttpResponse.json(AKTØR_ID)),
    http.get(ApiPath.PERSON, () =>
        HttpResponse.json({
            identitetsnummer: TEST_IDENT,
            sammensattNavn: 'Ola Test',
            fornavn: 'OLA',
            mellomnavn: null,
            etternavn: 'TEST',
            fødselsdato: '1990-01-01',
        }),
    ),
];
const preview = http.post(ApiPath.BREV_FORHAANDSVIS, () =>
    HttpResponse.arrayBuffer(Uint8Array.from(PDF_BYTES).buffer, { headers: { 'Content-Type': 'application/pdf' } }),
);
const organizationLookup = http.get(ApiPath.SØK_ORGNUMMER, () => HttpResponse.json({ navn: 'Test Navn' }));
const classify = http.post(ApiPath.JOURNALPOST_MOTTAK, () => HttpResponse.json({ saksnummer: 'RES-12345' }));
const setOnHold = http.post(
    ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', JOURNALPOST_ID),
    () => new HttpResponse(null, { status: 200 }),
);
const completion = http.post(ApiPath.JOURNALPOST_FERDIGSTILL, () => new HttpResponse(null, { status: 200 }));
const creation = http.post(ApiPath.BREV_BESTILL, () => new HttpResponse(null, { status: 200 }));

const createFailThenSucceed = () => {
    let attempts = 0;
    return {
        reset: () => {
            attempts = 0;
        },
        handler: http.post(ApiPath.BREV_BESTILL, () => {
            attempts += 1;
            return attempts === 1
                ? HttpResponse.json({ feilmelding: 'Midlertidig feil' }, { status: 500 })
                : new HttpResponse(null, { status: 200 });
        }),
    };
};
const retrySend = createFailThenSucceed();

const fillLetter = async (container: HTMLElement) => {
    const canvas = within(container);
    await canvas.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mal' }), 'GENERELT_FRITEKSTBREV');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mottaker' }), AKTØR_ID);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Tittel' }));
    await userEvent.paste(TEST_TITTEL);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Innhold i brev' }));
    await userEvent.paste(TEST_INNHOLD);
};

const meta: Meta<typeof BrevScenario> = {
    title: 'Components/BrevSpecialScenarios',
    component: BrevScenario,
    args: { scenario: 'modal' },
    parameters: {
        msw: {
            handlers: {
                templates: [brevmaler],
                recipients: mottakere,
                organization: [organizationLookup],
                preview: [preview],
                classification: [classify],
                onHold: [setOnHold],
                completion: [completion],
                creation: [creation],
            },
        },
    },
};

export default meta;

type Story = StoryObj<typeof BrevScenario>;

export const BrevIModal: Story = {
    name: 'Brev i vent/lukk-modal',
    args: { scenario: 'modal' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(
            await canvas.findByRole('checkbox', { name: 'Send brev til søker, arbeidsgiver eller tredjepart' }),
        );
    },
};

export const VarselOmUsendtBrev: Story = {
    name: 'Varsel om usendt brev',
    args: { scenario: 'usendt' },
    parameters: { msw: { handlers: { creation: [retrySend.handler] } } },
    play: async ({ canvasElement }) => {
        retrySend.reset();
        const canvas = within(canvasElement);
        const page = within(document.body);
        await userEvent.click(
            canvas.getByRole('checkbox', { name: 'Send brev til søker, arbeidsgiver eller tredjepart' }),
        );
        await fillLetter(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Send brev' }));
        await userEvent.click(await page.findByRole('button', { name: 'Fortsett' }));
        await canvas.findByText('Sending av brev feilet.');
        await userEvent.click(page.getByLabelText('Ferdigstill journalpost'));
        await userEvent.click(canvas.getByRole('button', { name: 'Ferdigstill journalpost' }));
        await expect(page.findByText(/påbegynt brev som ikke er sendt/)).resolves.toBeVisible();
    },
};

export const UavklartSakstype: Story = {
    name: 'Guard ved uavklart sakstype',
    args: { scenario: 'uavklart' },
};

export const BrevEtterKlassifisering: Story = {
    name: 'Brev etter klassifisering',
    args: { scenario: 'klassifisering' },
    play: async () => {
        const canvas = within(document.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Journalfør og sett på vent' }));
        await userEvent.click(
            await canvas.findByRole('checkbox', { name: 'Send brev til søker, arbeidsgiver eller tredjepart' }),
        );
        await fillLetter(document.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Send brev' }));
        await expect(
            canvas.findByText('Brevet er sendt. Du kan nå sende nytt brev til annen mottaker eller gå tilbake til LOS.'),
        ).resolves.toBeVisible();
    },
};
