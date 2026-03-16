import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IntlProvider } from 'react-intl';

import messages from 'app/i18n/nb.json';
import { FordelingDokumenttype } from 'app/models/enums';
import DokumentTypeVelger from 'app/fordeling/Komponenter/DokumentTypeVelger';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const defaultAppSettings: Record<string, string> = {
    OMP_KS_ENABLED: 'true',
    OMP_AO_ENABLED: 'true',
    OMP_MA_FEATURE_TOGGLE: 'true',
    PLS_ENABLED: 'true',
    OMP_UT_FEATURE_TOGGLE: 'true',
    OLP_ENABLED: 'true',
};

const applyAppSettings = (overrides?: Record<string, string>) => {
    const globalWindow = window as Window & { appSettings?: Record<string, string> };
    globalWindow.appSettings = {
        ...(globalWindow.appSettings ?? {}),
        ...defaultAppSettings,
        ...(overrides ?? {}),
    };
};

const renderInteractive = (
    args: React.ComponentProps<typeof DokumentTypeVelger>,
    appSettingsOverrides?: Record<string, string>,
) => {
    applyAppSettings(appSettingsOverrides);
    const [valgtDokumentType, setValgtDokumentType] = React.useState(args.valgtDokumentType);

    React.useEffect(() => {
        setValgtDokumentType(args.valgtDokumentType);
    }, [args.valgtDokumentType]);

    return (
        <div style={{ maxWidth: '560px' }}>
            <DokumentTypeVelger
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

const meta: Meta<typeof DokumentTypeVelger> = {
    title: 'Fordeling/DokumentTypeVelger',
    component: DokumentTypeVelger,
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
        disableRadios: false,
        handleDokumenttype: () => undefined,
    },
};

export default meta;

type Story = StoryObj<typeof DokumentTypeVelger>;

export const Default: Story = {
    render: (args) => renderInteractive(args),
};

export const OmsorgspengerSelected: Story = {
    args: {
        valgtDokumentType: FordelingDokumenttype.OMSORGSPENGER,
    },
    render: (args) => renderInteractive(args),
};

export const Disabled: Story = {
    args: {
        valgtDokumentType: FordelingDokumenttype.PLEIEPENGER,
        disableRadios: true,
    },
    render: (args) => renderInteractive(args),
};

export const NoOlp: Story = {
    render: (args) => renderInteractive(args, { OLP_ENABLED: 'false' }),
};
