/// <reference types="msw-storybook-addon/csf3" />

import React, { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw/http';
import messages from 'app/i18n/nb.json';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import { expect, userEvent, within } from 'storybook/test';

import { ApiPath } from 'app/apiConfig';
import SendBrevIAvsluttetSak from 'app/send-brev-i-avsluttetSak/SendBrevIAvsluttetSak';
import { createMockPdfBytes } from '../../mocks/mockPdf.js';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const TEST_IDENT = '08438323288';
const EMPTY_IDENT = '17519112922';
const ERROR_IDENT = '05508239132';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_INNHOLD = 'Eksempel på brevtekst';
const PDF_BYTES = createMockPdfBytes('Test letter preview');
const fagsaker = [
    { fagsakId: '1DMU93A', sakstype: 'PSB' },
    { fagsakId: '1DMU93M', sakstype: 'PSB' },
    { fagsakId: 'HIST001', sakstype: 'PSB', historisk: true },
];

const maler = http.get(ApiPath.BREV_MALER, () =>
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
    http.get(ApiPath.BREV_AKTØRID, () => HttpResponse.json('81549300')),
    http.get(ApiPath.PERSON, () =>
        HttpResponse.json({
            etternavn: 'TEST',
            fornavn: 'OLA',
            fødselsdato: '1990-01-01',
            identitetsnummer: TEST_IDENT,
            mellomnavn: null,
            sammensattNavn: 'Ola Test',
        }),
    ),
];
const lookup = http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, ({ request }) => {
    if (request.headers.get('X-Nav-NorskIdent') === EMPTY_IDENT) return HttpResponse.json([]);
    return HttpResponse.json(fagsaker);
});
const send = http.post(ApiPath.BREV_BESTILL, () => new HttpResponse(null, { status: 200 }));
const organizationLookup = http.get(ApiPath.SØK_ORGNUMMER, () => HttpResponse.json({ navn: 'Test Navn' }));
const preview = http.post(ApiPath.BREV_FORHAANDSVIS, () =>
    HttpResponse.arrayBuffer(Uint8Array.from(PDF_BYTES).buffer, {
        headers: { 'Content-Type': 'application/pdf' },
    }),
);

const pendingLookup = http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => new Promise<Response>(() => undefined));

const createRetryLookup = () => {
    let attempts = 0;
    return {
        reset: () => {
            attempts = 0;
        },
        handler: http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => {
            attempts += 1;
            return attempts === 1 ? HttpResponse.json({}, { status: 400 }) : HttpResponse.json(fagsaker);
        }),
    };
};
const retryLookup = createRetryLookup();

const StoryEnvironment = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        const storyWindow = window as Window & { appSettings?: Record<string, string | undefined> };
        const previousSettings = storyWindow.appSettings;
        storyWindow.appSettings = { ...previousSettings, K9_LOS_URL: undefined };
        return () => {
            if (previousSettings === undefined) delete storyWindow.appSettings;
            else storyWindow.appSettings = previousSettings;
        };
    }, []);

    return <>{children}</>;
};

const fillIdent = async (canvasElement: HTMLElement, ident = TEST_IDENT) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Søkers fødselsnummer' }), ident);
    return canvas;
};

const selectCase = async (canvasElement: HTMLElement) => {
    const canvas = await fillIdent(canvasElement);
    await expect(canvas.findByRole('option', { name: /1DMU93A/ })).resolves.toBeVisible();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg fagsak' }), '1DMU93A');
    return canvas;
};

const meta: Meta<typeof SendBrevIAvsluttetSak> = {
    title: 'Components/SendBrevIAvsluttetSak',
    component: SendBrevIAvsluttetSak,
    decorators: [
        (Story) => (
            <StoryEnvironment>
                <IntlProvider messages={messages} locale="nb">
                    <MemoryRouter initialEntries={['/brev-avsluttet-sak']}>
                        <div style={{ margin: '24px', maxWidth: '760px' }}>
                            <Story />
                        </div>
                    </MemoryRouter>
                </IntlProvider>
            </StoryEnvironment>
        ),
    ],
    parameters: {
        msw: {
            handlers: {
                lookup: [lookup],
                templates: [maler],
                recipients: mottakere,
                organization: [organizationLookup],
                creation: [send],
                preview: [preview],
            },
        },
    },
};

export default meta;

type Story = StoryObj<typeof SendBrevIAvsluttetSak>;

export const TomtSkjema: Story = {
    name: 'Tomt skjema',
};

export const LasterFagsaker: Story = {
    name: 'Laster fagsaker',
    parameters: { msw: { handlers: { lookup: [pendingLookup] } } },
    play: async ({ canvasElement }) => {
        await fillIdent(canvasElement);
    },
};

export const IngenFagsaker: Story = {
    name: 'Ingen fagsaker',
    play: async ({ canvasElement }) => {
        const canvas = await fillIdent(canvasElement, EMPTY_IDENT);
        await expect(
            canvas.findByText('Det finnes ingen fagsaker for denne søkeren. Du kan ikke sende brev uten fagsak.'),
        ).resolves.toBeVisible();
    },
};

export const OppslagsfeilMedNyttForsøk: Story = {
    name: 'Oppslagsfeil med nytt forsøk',
    parameters: { msw: { handlers: { lookup: [retryLookup.handler] } } },
    play: async ({ canvasElement }) => {
        retryLookup.reset();
        const canvas = await fillIdent(canvasElement, ERROR_IDENT);
        await expect(
            canvas.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.'),
        ).resolves.toBeVisible();
    },
};

export const ValgtSak: Story = {
    name: 'Valgt PSB-sak',
    play: async ({ canvasElement }) => {
        await selectCase(canvasElement);
        await expect(within(canvasElement).getByRole('combobox', { name: 'Velg mal' })).toBeVisible();
    },
};

export const BrevBestilt: Story = {
    name: 'Brev bestilt og LOS-modal',
    play: async ({ canvasElement }) => {
        const canvas = await selectCase(canvasElement);
        await userEvent.selectOptions(
            await canvas.findByRole('combobox', { name: 'Velg mal' }),
            'GENERELT_FRITEKSTBREV',
        );
        await canvas.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
        await userEvent.selectOptions(
            await canvas.findByRole('combobox', { name: 'Velg mottaker' }),
            '81549300',
        );
        const title = await canvas.findByRole('textbox', { name: 'Tittel' });
        await userEvent.click(title);
        await userEvent.paste(TEST_TITTEL);
        const content = canvas.getByRole('textbox', { name: 'Innhold i brev' });
        await userEvent.click(content);
        await userEvent.paste(TEST_INNHOLD);
        await userEvent.click(canvas.getByRole('button', { name: 'Send brev' }));
        await userEvent.click(await within(document.body).findByRole('button', { name: 'Fortsett' }));
        await expect(within(document.body).findByText('Brevet er sendt. Du blir nå tatt til LOS.')).resolves.toBeVisible();
    },
};
