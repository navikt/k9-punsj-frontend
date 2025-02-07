import { Meta, StoryObj } from '@storybook/react';
import OpprettJournalpost from './OpprettJournalpost';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { IntlProvider } from 'react-intl';
import messages from 'app/i18n/nb.json';

// Импорт стилей
import '@navikt/ds-css/dist/index.css';
import './opprettJournalpost.less';

const meta: Meta<typeof OpprettJournalpost> = {
    title: 'Components/OpprettJournalpost',
    component: OpprettJournalpost,
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
                        url: 'path:/api/k9-punsj/saker/hent',
                        method: 'GET',
                    },
                    response: {
                        status: 200,
                        body: [
                            {
                                fagsakId: 'ABC123',
                                sakstype: 'PSB',
                                pleietrengende: null,
                                gyldigPeriode: null,
                            },
                            {
                                fagsakId: 'DEF456',
                                sakstype: 'PPN',
                                pleietrengende: null,
                                gyldigPeriode: null,
                            },
                        ],
                    },
                },
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/notat/opprett',
                        method: 'POST',
                    },
                    response: {
                        status: 201,
                        body: { journalpostId: '200' },
                    },
                },
            ],
        },
    },
};

export default meta;

type Story = StoryObj<typeof OpprettJournalpost>;

export const Default: Story = {
    name: 'Default',
};

export const WithError: Story = {
    name: 'With Error',
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/saker/hent',
                        method: 'GET',
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

export const WithNoFagsaker: Story = {
    name: 'No Fagsaker',
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/saker/hent',
                        method: 'GET',
                    },
                    response: {
                        status: 200,
                        body: [],
                    },
                },
            ],
        },
    },
};

export const WithSubmitError: Story = {
    name: 'Submit Error',
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/saker/hent',
                        method: 'GET',
                    },
                    response: {
                        status: 200,
                        body: [
                            {
                                fagsakId: 'ABC123',
                                sakstype: 'PSB',
                                pleietrengende: null,
                                gyldigPeriode: null,
                            },
                            {
                                fagsakId: 'DEF456',
                                sakstype: 'PPN',
                                pleietrengende: null,
                                gyldigPeriode: null,
                            },
                        ],
                    },
                },
                {
                    matcher: {
                        url: 'path:/api/k9-punsj/notat/opprett',
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
