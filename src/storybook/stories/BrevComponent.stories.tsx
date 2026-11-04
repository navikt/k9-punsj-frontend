/// <reference types="msw-storybook-addon/csf3" />

import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw/http';
import { expect, fn, userEvent, within } from 'storybook/test';
import messages from 'app/i18n/nb.json';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';

import { ApiPath } from 'app/apiConfig';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import { createMockPdfBytes } from '../../mocks/mockPdf.js';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const TEST_IDENT = '08438323288';
const AKTØR_ID = '81549300';
const ORGNUMMER = '889640782';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_INNHOLD = 'Eksempel på brevtekst';
const PDF_BYTES = createMockPdfBytes('Test letter preview');

const brevmaler = {
    GENERELT_FRITEKSTBREV: {
        kode: 'GENERELT_FRITEKSTBREV',
        navn: 'Generelt fritekstbrev',
        mottakere: [],
        linker: [],
        støtterFritekst: false,
        støtterTittelOgFritekst: true,
        støtterTredjepartsmottaker: true,
    },
    INNHEN: {
        kode: 'INNHEN',
        navn: 'Innhente opplysninger',
        mottakere: [],
        linker: [],
        støtterFritekst: true,
        støtterTittelOgFritekst: false,
        støtterTredjepartsmottaker: false,
    },
    UTEN_FRITEKST: {
        kode: 'UTEN_FRITEKST',
        navn: 'Standardbrev uten fritekst',
        mottakere: [],
        linker: [],
        støtterFritekst: false,
        støtterTittelOgFritekst: false,
        støtterTredjepartsmottaker: false,
    },
};

const templates = http.get(ApiPath.BREV_MALER, () => HttpResponse.json(brevmaler));
const recipientData = [
    http.get(ApiPath.FINN_ARBEIDSGIVERE, () =>
        HttpResponse.json({
            organisasjoner: [{ organisasjonsnummer: '979312059', navn: 'Test Arbeidsgiver' }],
        }),
    ),
    http.get(ApiPath.BREV_AKTØRID, () => HttpResponse.json(AKTØR_ID)),
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
const organizationLookup = http.get(ApiPath.SØK_ORGNUMMER, () => HttpResponse.json({ navn: 'Test Navn' }));
const creation = http.post(ApiPath.BREV_BESTILL, () => new HttpResponse(null, { status: 200 }));
const preview = http.post(ApiPath.BREV_FORHAANDSVIS, () =>
    HttpResponse.arrayBuffer(Uint8Array.from(PDF_BYTES).buffer, {
        headers: { 'Content-Type': 'application/pdf' },
    }),
);

const createRetryHandler = (
    path: string,
    successResponse: () => Response = () => new HttpResponse(null, { status: 200 }),
) => {
    let attempts = 0;
    return {
        reset: () => {
            attempts = 0;
        },
        handler: http.post(path, () => {
            attempts += 1;
            return attempts === 1
                ? HttpResponse.json({ feilmelding: 'Feil ved sending. Prøv igjen.' }, { status: 500 })
                : successResponse();
        }),
    };
};

const sendRetry = createRetryHandler(ApiPath.BREV_BESTILL);
const previewRetry = createRetryHandler(ApiPath.BREV_FORHAANDSVIS, () =>
    HttpResponse.arrayBuffer(Uint8Array.from(PDF_BYTES).buffer, {
        headers: { 'Content-Type': 'application/pdf' },
    }),
);
const brevSendtCallback = fn();
const setVisBrevIkkeSendtInfoboks = fn();

const fillText = async (element: HTMLElement, value: string) => {
    await userEvent.clear(element);
    await userEvent.type(element, value);
};

const fillLetter = async (container: HTMLElement) => {
    const canvas = within(container);
    await canvas.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mal' }), 'GENERELT_FRITEKSTBREV');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mottaker' }), AKTØR_ID);
    await fillText(canvas.getByRole('textbox', { name: 'Tittel' }), TEST_TITTEL);
    await fillText(canvas.getByRole('textbox', { name: 'Innhold i brev' }), TEST_INNHOLD);
};

const fillOnlyFreeTextLetter = async (container: HTMLElement) => {
    const canvas = within(container);
    await canvas.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mal' }), 'INNHEN');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mottaker' }), AKTØR_ID);
    await fillText(canvas.getByRole('textbox', { name: 'Innhold i brev' }), TEST_INNHOLD);
};

const fillNoTextLetter = async (container: HTMLElement) => {
    const canvas = within(container);
    await canvas.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mal' }), 'UTEN_FRITEKST');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mottaker' }), AKTØR_ID);
};

const prepareFailedSend = async (container: HTMLElement) => {
    await fillLetter(container);
    const canvas = within(container);
    await userEvent.click(canvas.getByRole('button', { name: 'Send brev' }));
    await userEvent.click(await within(document.body).findByRole('button', { name: 'Fortsett' }));
    await expect(canvas.findByText('Sending av brev feilet.')).resolves.toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);
    await expect(canvas.getByRole('textbox', { name: 'Innhold i brev' })).toHaveValue(TEST_INNHOLD);
};

const prepareFailedPreview = async (container: HTMLElement) => {
    await fillLetter(container);
    const canvas = within(container);
    await userEvent.click(canvas.getByRole('button', { name: 'Forhåndsvis brev' }));
    await expect(canvas.findByText(/Prøv igjen/)).resolves.toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);
    await expect(canvas.getByRole('textbox', { name: 'Innhold i brev' })).toHaveValue(TEST_INNHOLD);
};

const meta: Meta<typeof BrevComponent> = {
    title: 'Components/BrevComponent',
    component: BrevComponent,
    args: {
        søkerId: TEST_IDENT,
        sakstype: 'PSB',
        fagsakId: '1DMU93A',
        brevSendtCallback,
        setVisBrevIkkeSendtInfoboks,
    },
    beforeEach: () => {
        sendRetry.reset();
        previewRetry.reset();
        brevSendtCallback.mockClear();
        setVisBrevIkkeSendtInfoboks.mockClear();
    },
    decorators: [
        (Story) => (
            <IntlProvider messages={messages} locale="nb">
                <MemoryRouter>
                    <div style={{ margin: '24px', maxWidth: '640px' }}>
                        <Story />
                    </div>
                </MemoryRouter>
            </IntlProvider>
        ),
    ],
    parameters: {
        msw: {
            handlers: {
                templates: [templates],
                recipients: recipientData,
                organization: [organizationLookup],
                creation: [creation],
                preview: [preview],
            },
        },
    },
} satisfies Meta<typeof BrevComponent>;

export default meta;

type Story = StoryObj<typeof BrevComponent>;

export const VanligBrev: Story = {
    name: 'Tomt skjema',
};

export const BareFritekst: Story = {
    name: 'Mal med bare fritekst',
    play: async ({ canvasElement }) => {
        await fillOnlyFreeTextLetter(canvasElement);
    },
};

export const UtenFritekst: Story = {
    name: 'Mal uten fritekst',
    play: async ({ canvasElement }) => {
        await fillNoTextLetter(canvasElement);
    },
};

export const Arbeidsgiver: Story = {
    name: 'Arbeidsgiver som mottaker',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await canvas.findByRole('option', { name: `Test Arbeidsgiver - 979312059` });
        await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mal' }), 'GENERELT_FRITEKSTBREV');
        await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mottaker' }), '979312059');
        await fillText(canvas.getByRole('textbox', { name: 'Tittel' }), TEST_TITTEL);
        await fillText(canvas.getByRole('textbox', { name: 'Innhold i brev' }), TEST_INNHOLD);
    },
};

export const Tredjepart: Story = {
    name: 'Tredjepart med navneoppslag',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await canvas.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
        await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Velg mal' }), 'GENERELT_FRITEKSTBREV');
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Send til tredjepart' }));
        const organizationField = canvas.getByRole('textbox', { name: 'Organisasjonsnummer' });
        await fillText(organizationField, ORGNUMMER);
        await expect(canvas.findByText('Test Navn')).resolves.toBeVisible();
        await fillText(canvas.getByRole('textbox', { name: 'Tittel' }), TEST_TITTEL);
        await fillText(canvas.getByRole('textbox', { name: 'Innhold i brev' }), TEST_INNHOLD);
    },
};

export const SendingFeilerMedNyttForsøk: Story = {
    name: 'Sendefeil med nytt forsøk',
    parameters: { msw: { handlers: { creation: [sendRetry.handler] } } },
    play: async ({ canvasElement }) => {
        sendRetry.reset();
        await prepareFailedSend(canvasElement);
    },
};

export const UtenBekreftelsesdialog: Story = {
    name: 'Sending uten bekreftelsesdialog',
    args: { sendBrevUtenModal: true },
    play: async ({ canvasElement }) => {
        await fillLetter(canvasElement);
    },
};

export const BrevIAnnenModal: Story = {
    name: 'Brev i modal',
    args: { sendBrevUtenModal: true, brevFraModal: true },
    play: async ({ canvasElement }) => {
        await fillLetter(canvasElement);
    },
};

export const MalhentingFeiler: Story = {
    name: 'Malhenting feiler',
    parameters: {
        msw: {
            handlers: {
                templates: [http.get(ApiPath.BREV_MALER, () => new HttpResponse(null, { status: 500 }))],
            },
        },
    },
};

export const Forhaandsvisning: Story = {
    name: 'Forhåndsvisning av PDF',
    play: async ({ canvasElement }) => {
        await fillLetter(canvasElement);
    },
};

export const ForhaandsvisningFeilerMedNyttForsøk: Story = {
    name: 'Preview-feil med nytt forsøk',
    parameters: { msw: { handlers: { preview: [previewRetry.handler] } } },
    play: async ({ canvasElement }) => {
        previewRetry.reset();
        await prepareFailedPreview(canvasElement);
    },
};
