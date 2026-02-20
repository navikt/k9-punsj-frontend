import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { LegacyRadio } from 'app/components/legacy-form-compat/radio';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

const meta: Meta<typeof LegacyRadio> = {
    title: 'Legacy form compat/Radio',
    component: LegacyRadio,
    args: {
        name: 'legacy-radio-example',
        value: 'pleiepenger-sykt-barn',
        label: 'Pleiepenger sykt barn',
    },
};

export default meta;

type Story = StoryObj<typeof LegacyRadio>;

export const Default: Story = {
    args: {
        checked: false,
    },
};

export const Selected: Story = {
    args: {
        checked: true,
    },
};

export const Disabled: Story = {
    args: {
        checked: false,
        disabled: true,
    },
};

export const Error: Story = {
    args: {
        checked: false,
        feil: true,
    },
};

export const Interactive: Story = {
    render: (args) => {
        const [checked, setChecked] = React.useState(Boolean(args.checked));

        return (
            <LegacyRadio
                {...args}
                checked={checked}
                onChange={(event) => {
                    setChecked((event.target as HTMLInputElement).checked);
                    args.onChange?.(event);
                }}
            />
        );
    },
    args: {
        checked: false,
    },
};
