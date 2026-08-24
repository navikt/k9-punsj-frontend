import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import messages from 'app/i18n/nb.json';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import BrevComponent from '../../app/components/brev/brevComponent/BrevComponent';
import { hentAktørId } from '../mocks/hentAktørId';
import { hentArbeidsgivere } from '../mocks/hentArbeidsgivere';
import { hentBrevmaler } from '../mocks/hentBrevmaler';
import { hentPerson } from '../mocks/hentPerson';
import { sendBrev, sendBrevMedFeil } from '../mocks/sendBrev';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const meta: Meta<typeof BrevComponent> = {
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
            mocks: [hentBrevmaler, hentArbeidsgivere, hentAktørId, hentPerson, sendBrev],
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
            mocks: [hentBrevmaler],
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
            mocks: [sendBrevMedFeil],
        },
    },
};
