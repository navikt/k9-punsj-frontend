import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { LegacyCheckboxGroup } from 'app/components/legacy-form-compat/checkbox';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const verticalThreeOptions = [
    { label: 'Arbeidstaker', value: 'arbeidstaker' },
    { label: 'Frilanser', value: 'frilanser' },
    { label: 'Selvstendig næringsdrivende', value: 'selvstendig-naeringsdrivende' },
];

const verticalTwoOptions = [
    { label: 'Ja', value: 'ja' },
    { label: 'Nei', value: 'nei' },
];

const meta: Meta<typeof LegacyCheckboxGroup> = {
    title: 'Legacy form compat/Checkbox group',
    component: LegacyCheckboxGroup,
};

export default meta;

type Story = StoryObj<typeof LegacyCheckboxGroup>;

const renderInteractive = (args: React.ComponentProps<typeof LegacyCheckboxGroup>) => {
    const [checked, setChecked] = React.useState(args.checked ?? args.defaultChecked ?? []);

    return (
        <LegacyCheckboxGroup
            {...args}
            checked={checked}
            onChange={(event, value, checkedValues) => {
                setChecked(checkedValues);
                args.onChange?.(event, value, checkedValues);
            }}
        />
    );
};

export const VerticalThree: Story = {
    render: renderInteractive,
    args: {
        name: 'legacy-checkbox-group-vertical-three',
        legend: 'Velg arbeidssituasjon',
        checkboxes: verticalThreeOptions,
        checked: ['arbeidstaker'],
    },
};

export const VerticalTwo: Story = {
    render: renderInteractive,
    args: {
        name: 'legacy-checkbox-group-vertical-two',
        legend: 'Velg alternativer',
        checkboxes: verticalTwoOptions,
        checked: ['ja'],
    },
};

export const Error: Story = {
    render: renderInteractive,
    args: {
        name: 'legacy-checkbox-group-error',
        legend: 'Velg minst ett alternativ',
        checkboxes: verticalThreeOptions,
        checked: [],
        feil: 'Du må velge minst ett alternativ',
    },
};
