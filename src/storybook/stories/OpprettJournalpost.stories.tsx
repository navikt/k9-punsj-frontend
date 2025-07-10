import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import OpprettJournalpost from '../../app/opprett-journalpost/OpprettJournalpost';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import messages from 'app/i18n/nb.json';

import { hentFagsaker, hentFagsakerMedFeil, hentFagsakerTomtArray } from '../mocks/hentFagsaker';
import { opprettNottat, opprettNottatMedFeil } from '../mocks/opprettNottat';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

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
            mocks: [hentFagsaker, opprettNottat],
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
            mocks: [hentFagsakerMedFeil],
        },
    },
};

export const WithNoFagsaker: Story = {
    name: 'No Fagsaker',
    parameters: {
        fetchMock: {
            mocks: [hentFagsakerTomtArray],
        },
    },
};

export const WithSubmitError: Story = {
    name: 'Submit Error',
    parameters: {
        fetchMock: {
            mocks: [hentFagsaker, opprettNottatMedFeil],
        },
    },
};
