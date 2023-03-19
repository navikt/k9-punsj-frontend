import { Meta, Story } from '@storybook/react';
import React from 'react';

import { ArbeidstidPeriodeMedTimer } from 'app/models/types';

import ArbeidstidKalender, { ArbeidstidKalenderProps } from './ArbeidstidKalender';

const nyeSoknadsperioder = [
    {
        fom: '2022-09-05',
        tom: '2022-09-09',
    },
    {
        fom: '2022-09-19',
        tom: '2022-09-23',
    },
];
const arbeidstidInfo = { perioder: [] };

const props = {
    nyeSoknadsperioder,
    arbeidstidInfo,
};
export default {
    title: 'ArbeidstidKalender',
    component: ArbeidstidKalender,
    argTypes: { updateSoknad: { action: 'clicked' }, updateSoknadState: { action: 'clicked' } },
} as Meta<typeof ArbeidstidKalender>;

const Template: Story<ArbeidstidKalenderProps> = (args) => <ArbeidstidKalender {...args} />;
export const Default = Template.bind({});
Default.args = props;
export const MedArbeidstidperiode = Template.bind({});
MedArbeidstidperiode.args = {
    ...Default.args,
    arbeidstidInfo: {
        perioder: [
            new ArbeidstidPeriodeMedTimer({
                periode: {
                    fom: '2022-09-05',
                    tom: '2022-09-09',
                },
                faktiskArbeidTimerPerDag: '',
                faktiskArbeidMinutterPerDag: '',
                jobberNormaltTimerPerDag: '',
                jobberNormaltMinutterPerDag: '',
                jobberNormaltPerDag: {
                    timer: '8',
                    minutter: '0',
                },
                faktiskArbeidPerDag: {
                    timer: '0',
                    minutter: '0',
                },
            }),
        ],
    },
};
