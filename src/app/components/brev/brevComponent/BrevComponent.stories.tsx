import type { Meta, StoryObj } from '@storybook/react';
import BrevComponent from './BrevComponent';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { IntlProvider } from 'react-intl';
import messages from 'app/i18n/nb.json';

// Импорт стилей
import '@navikt/ds-css/dist/index.css';
import './brevComponent.less';

const meta = {
    title: 'Components/BrevComponent',
    component: BrevComponent,
    decorators: [
        (Story) => (
            <IntlProvider messages={messages} locale="nb">
                <MemoryRouter>
                    <div style={{ margin: '24px' }}>
                        <Story />
                    </div>
                </MemoryRouter>
            </IntlProvider>
        ),
    ],
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: 'path:/api/k9-formidling/brev/maler',
                        method: 'GET',
                    },
                    response: {
                        status: 200,
                        body: {
                            GENERELT_FRITEKSTBREV: {
                                kode: 'GENERELT_FRITEKSTBREV',
                                navn: 'Fritekstbrev',
                                støtterTittelOgFritekst: true,
                                støtterFritekst: true,
                            },
                            INNHENTE_OPPLYSNINGER: {
                                kode: 'INNHENTE_OPPLYSNINGER',
                                navn: 'Innhente opplysninger',
                                støtterTittelOgFritekst: false,
                                støtterFritekst: true,
                            },
                        },
                    },
                },
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/arbeidsgivere',
                        method: 'GET',
                    },
                    response: {
                        status: 200,
                        body: {
                            organisasjoner: [
                                {
                                    navn: 'BEDRIFT AS',
                                    orgNummer: '123456789',
                                },
                                {
                                    navn: 'FIRMA AS',
                                    orgNummer: '987654321',
                                },
                            ],
                        },
                    },
                },
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/brev/aktorId',
                        method: 'GET',
                    },
                    response: {
                        status: 200,
                        body: '1234567890',
                    },
                },
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/person',
                        method: 'GET',
                    },
                    response: {
                        status: 200,
                        body: {
                            etternavn: 'NORDMANN',
                            fornavn: 'OLA',
                            fødselsdato: '1990-01-01',
                            identitetsnummer: '01019012345',
                            mellomnavn: null,
                            sammensattNavn: 'OLA NORDMANN',
                        },
                    },
                },
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/brev/bestill',
                        method: 'POST',
                    },
                    response: {
                        status: 200,
                        body: {},
                    },
                },
            ],
        },
    },
} satisfies Meta<typeof BrevComponent>;

export default meta;

type Story = StoryObj<typeof BrevComponent>;

export const Default: Story = {
    args: {
        søkerId: '01019012345',
        sakstype: 'PSB',
        fagsakId: 'ABC123',
        journalpostId: '123',
        sendBrevUtenModal: false,
        brevFraModal: false,
        visTilbakeBtn: true,
    },
};

export const WithError: Story = {
    args: {
        søkerId: '01019012345',
        sakstype: 'PSB',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: 'path:/api/k9-formidling/brev/maler',
                        method: 'GET',
                    },
                    response: {
                        status: 500,
                        body: {},
                    },
                },
            ],
        },
    },
};

export const WithSendBrevUtenModal: Story = {
    args: {
        søkerId: '01019012345',
        sakstype: 'PSB',
        fagsakId: 'ABC123',
        journalpostId: '123',
        sendBrevUtenModal: true,
        brevFraModal: false,
        visTilbakeBtn: false,
    },
};

export const WithSendBrevError: Story = {
    args: {
        søkerId: '01019012345',
        sakstype: 'PSB',
        fagsakId: 'ABC123',
        journalpostId: '123',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/brev/bestill',
                        method: 'POST',
                    },
                    response: {
                        status: 400,
                        body: {},
                    },
                },
            ],
        },
    },
};
