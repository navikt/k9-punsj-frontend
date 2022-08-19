// eslint-disable-next-line import/no-extraneous-dependencies
import { ComponentStory } from '@storybook/react';
import TidsbrukKalenderContainer from 'app/components/calendar/TidsbrukKalenderContainer';
import { ArbeidstidPeriodeMedTimer } from 'app/models/types';
import { getDatesInDateRange } from 'app/utils';
import React from 'react';

export default {
    component: TidsbrukKalenderContainer,
};

const perioder = {
    perioder: [
        {
            periode: {
                fom: '2021-01-30',
                tom: '2021-04-15',
            },
            faktiskArbeidTimerPerDag: 5,
            faktiskMinutterPerDag: 0,
            jobberNormaltTimerPerDag: 7,
            jobberNormaltMinutterPerDag: 30,
        },
    ],
};

const periodeToDaysWithTime = (periode) =>
    getDatesInDateRange(periode.periode).map((date) => ({
        date,
        timer: periode.timer,
        normaltTimer: periode.timer,
    }));
const perioderMappet = periodeToDaysWithTime(perioder.perioder);
console.log(perioderMappet);

const Template: ComponentStory<typeof TidsbrukKalenderContainer> = (args) => (
    <TidsbrukKalenderContainer {...args} kalenderdager={perioderMappet} />
);

export const TidsbrukCalenderContainer = Template.bind({});

TidsbrukCalenderContainer.args = {
    gyldigePerioder: [
        { fom: new Date('2021-12-01'), tom: new Date('2021-12-31') },
        { fom: new Date('2022-08-01'), tom: new Date('2022-10-15') },
    ],
};
