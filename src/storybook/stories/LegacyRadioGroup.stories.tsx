import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { LegacyRadioGroup } from 'app/components/legacy-form-compat/radio';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const horizontalThreeOptions = [
    { label: 'Ja', value: 'ja' },
    { label: 'Nei', value: 'nei' },
    { label: 'Ikke opplyst', value: 'ikke-opplyst' },
];

const horizontalFourOptions = [
    { label: 'Ja', value: 'ja' },
    { label: 'Nei', value: 'nei' },
    { label: 'Ikke opplyst', value: 'ikke-opplyst' },
    { label: 'Vet ikke', value: 'vet-ikke' },
];

const verticalTwoOptions = [
    { label: 'Ja', value: 'ja' },
    { label: 'Nei', value: 'nei' },
];

const meta: Meta<typeof LegacyRadioGroup> = {
    title: 'Legacy form compat/Radio group',
    component: LegacyRadioGroup,
};

export default meta;

type Story = StoryObj<typeof LegacyRadioGroup>;

const renderInteractive = (args: React.ComponentProps<typeof LegacyRadioGroup>) => {
    const [checked, setChecked] = React.useState(args.checked ?? args.defaultChecked ?? '');

    return (
        <LegacyRadioGroup
            {...args}
            checked={checked}
            onChange={(event, value) => {
                setChecked(value);
                args.onChange?.(event, value);
            }}
        />
    );
};

export const HorizontalThree: Story = {
    render: renderInteractive,
    args: {
        name: 'legacy-radio-group-horizontal-three',
        legend: 'Har søker opphold i utlandet?',
        retning: 'horisontal',
        radios: horizontalThreeOptions,
        checked: 'nei',
    },
};

export const HorizontalFour: Story = {
    render: renderInteractive,
    args: {
        name: 'legacy-radio-group-horizontal-four',
        legend: 'Hva gjelder saken?',
        retning: 'horisontal',
        radios: horizontalFourOptions,
        checked: 'ja',
    },
};

export const VerticalTwo: Story = {
    render: renderInteractive,
    args: {
        name: 'legacy-radio-group-vertical-two',
        legend: 'Er dokumentet signert?',
        retning: 'vertikal',
        radios: verticalTwoOptions,
        checked: 'ja',
    },
};
