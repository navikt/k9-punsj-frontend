import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IntlProvider } from 'react-intl';

import messages from 'app/i18n/nb.json';
import { FordelingDokumenttype } from 'app/models/enums';
import DokumentTypeVelgerForKopiering from 'app/fordeling/Komponenter/DokumentTypeVelgerForKopiering';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const applyAppSettings = (overrides?: Record<string, string>) => {
    const globalWindow = window as Window & { appSettings?: Record<string, string> };
    globalWindow.appSettings = {
        ...(globalWindow.appSettings ?? {}),
        OLP_ENABLED: 'true',
        ...(overrides ?? {}),
    };
};

const renderInteractive = (
    args: React.ComponentProps<typeof DokumentTypeVelgerForKopiering>,
    appSettingsOverrides?: Record<string, string>,
) => {
    applyAppSettings(appSettingsOverrides);
    const [valgtDokumentType, setValgtDokumentType] = React.useState(args.valgtDokumentType);

    React.useEffect(() => {
        setValgtDokumentType(args.valgtDokumentType);
    }, [args.valgtDokumentType]);

    return (
        <div style={{ maxWidth: '560px' }}>
            <DokumentTypeVelgerForKopiering
                {...args}
                valgtDokumentType={valgtDokumentType}
                handleDokumenttype={(type) => {
                    setValgtDokumentType(type);
                    args.handleDokumenttype(type);
                }}
            />
        </div>
    );
};

const meta: Meta<typeof DokumentTypeVelgerForKopiering> = {
    title: 'Fordeling/DokumentTypeVelgerForKopiering',
    component: DokumentTypeVelgerForKopiering,
    decorators: [
        (Story) => (
            <IntlProvider messages={messages} locale="nb">
                <div style={{ margin: '24px' }}>
                    <Story />
                </div>
            </IntlProvider>
        ),
    ],
    args: {
        valgtDokumentType: FordelingDokumenttype.PLEIEPENGER,
        visComponent: true,
        handleDokumenttype: () => undefined,
    },
};

export default meta;

type Story = StoryObj<typeof DokumentTypeVelgerForKopiering>;

export const Default: Story = {
    render: (args) => renderInteractive(args),
};

export const OmsorgspengerSelected: Story = {
    args: {
        valgtDokumentType: FordelingDokumenttype.OMSORGSPENGER,
    },
    render: (args) => renderInteractive(args),
};

export const NoOlp: Story = {
    render: (args) => renderInteractive(args, { OLP_ENABLED: 'false' }),
};

export const Hidden: Story = {
    args: {
        visComponent: false,
    },
    render: (args) => renderInteractive(args),
};
