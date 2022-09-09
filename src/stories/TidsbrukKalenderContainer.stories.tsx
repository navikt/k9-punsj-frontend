// eslint-disable-next-line import/no-extraneous-dependencies
import { Heading, Button } from '@navikt/ds-react';
import { ComponentStory } from '@storybook/react';
import TidsbrukKalenderContainer from 'app/components/calendar/TidsbrukKalenderContainer';
import { KalenderDag } from 'app/models/KalenderDag';
import { ArbeidstidPeriodeMedTimer, Periode } from 'app/models/types';
import DateRange from 'app/models/types/DateRange';
import { getDatesInDateRange, verdiOgTekstHvisVerdi } from 'app/utils';
import dayjs from 'dayjs';
import { Input } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Row } from 'react-bootstrap';

export default {
    component: TidsbrukKalenderContainer,
};

const ExampleModalContent = (props: { selectedDates: Date[] }) => {
    const { selectedDates } = props;
    const [normaltTimer, setNormaltTimer] = useState('0');
    const [normaltMinutter, setNormaltMinutter] = useState('0');
    const [faktiskTimer, setFaktiskTimer] = useState('0');
    const [faktiskMinutter, setFaktiskMinutter] = useState('0');
    const perioder = () =>
        selectedDates.map((date) => ({
            periode: { fom: date, tom: date },
            faktiskArbeidTimerPerDag: faktiskTimer,
            jobberNormaltTimerPerDag: normaltTimer,
        }));
    const lagre = () => console.log(perioder());
    return (
        <>
            <Heading size="medium">Modal Modalsen</Heading>
            <Row noGutters>
                <div className="input-row">
                    <Input
                        label="normalt timer"
                        bredde="XS"
                        value={normaltTimer}
                        onChange={(event) => {
                            setNormaltTimer(event.target.value.replace(/\s/g, ''));
                        }}
                    />
                    <Input
                        label="normalt minutter"
                        bredde="XS"
                        value={normaltMinutter}
                        onChange={(event) => {
                            setNormaltMinutter(event.target.value.replace(/\s/g, ''));
                        }}
                    />
                    <Input
                        label="faktisk timer"
                        bredde="XS"
                        value={faktiskTimer}
                        onChange={(event) => {
                            setFaktiskTimer(event.target.value.replace(/\s/g, ''));
                        }}
                    />
                    <Input
                        label="faktisk minutter"
                        bredde="XS"
                        value={faktiskMinutter}
                        onChange={(event) => {
                            setFaktiskMinutter(event.target.value.replace(/\s/g, ''));
                        }}
                    />
                    <Button onClick={lagre}>lagre</Button>
                </div>
            </Row>
        </>
    );
};

const dateContent = (dager: KalenderDag[]) => (date: Date, isDisabled: boolean) => {
    const kalenderdag = dager.find((dag) => dayjs(dag.date).isSame(dayjs(date), 'date'));

    if (kalenderdag) {
        return (
            <>
                <div>
                    {verdiOgTekstHvisVerdi(kalenderdag?.tid?.timer, 'timer ')}
                    {verdiOgTekstHvisVerdi(kalenderdag?.tid?.minutter, 'minutter')}
                </div>
                <div style={{ fontWeight: 'bold' }}>
                    {verdiOgTekstHvisVerdi(kalenderdag?.tidOpprinnelig?.timer, 'timer ')}
                    {verdiOgTekstHvisVerdi(kalenderdag?.tidOpprinnelig?.minutter, 'minutter')}
                </div>
            </>
        );
    }
    return nulll;
};

const perioder = {
    perioder: [
        {
            periode: new Periode({
                fom: '2022-08-05',
                tom: '2022-08-15',
            }),
            faktiskArbeidTimerPerDag: 5,
            jobberNormaltTimerPerDag: 7,
        },
    ],
};

const periodeToDaysWithTime = (arbeidstid: ArbeidstidPeriodeMedTimer): KalenderDag[] => {
    const dateRange = arbeidstid.periode.tilDateRange();
    return getDatesInDateRange(dateRange).map((date) => ({
        date,
        tid: { timer: arbeidstid.faktiskArbeidTimerPerDag },
        tidOpprinnelig: { timer: arbeidstid.jobberNormaltTimerPerDag },
    }));
};

const perioderMappet = perioder.perioder.map((periode) => periodeToDaysWithTime(periode)).flat();

const Template: ComponentStory<typeof TidsbrukKalenderContainer> = (args) => (
    <TidsbrukKalenderContainer
        {...args}
        kalenderdager={perioderMappet}
        ModalContent={<ExampleModalContent />}
        dateContentRenderer={dateContent}
    />
);

export const TidsbrukCalenderContainer = Template.bind({});

TidsbrukCalenderContainer.args = {
    gyldigePerioder: [
        { fom: new Date('2021-12-01'), tom: new Date('2021-12-31') },
        { fom: new Date('2022-08-01'), tom: new Date('2022-10-15') },
    ],
};
