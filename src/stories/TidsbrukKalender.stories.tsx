// eslint-disable-next-line import/no-extraneous-dependencies
import { Button, Heading } from '@navikt/ds-react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ComponentStory } from '@storybook/react';
import { Input } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Row } from 'react-bootstrap';
import { PeriodeinfoPaneler } from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import { pfArbeidstider } from 'app/containers/pleiepenger/pfArbeidstider';
import { ArbeidstidPeriodeMedTimer } from 'app/models/types';
import TidsbrukKalender from 'app/components/calendar/TidsbrukKalender';
import dayjs from 'dayjs';
import { verdiOgTekstHvisVerdi } from 'app/utils';
import { KalenderDag } from 'app/models/KalenderDag';

export default {
    component: TidsbrukKalender,
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

const dateContent = (dager: KalenderDag[]) => (date: Date) => {
    const kalenderdag = dager.find((dag) => dayjs(dag.date).isSame(dayjs(date), 'date'));

    if (kalenderdag)
        return (
            <>
                <div>
                    {verdiOgTekstHvisVerdi(kalenderdag.tid.timer, 'timer ')}
                    {verdiOgTekstHvisVerdi(kalenderdag.tid.minutter, 'minutter')}
                </div>
                <div style={{ fontWeight: 'bold' }}>
                    {verdiOgTekstHvisVerdi(kalenderdag.tidOpprinnelig.timer, 'timer ')}
                    {verdiOgTekstHvisVerdi(kalenderdag.tidOpprinnelig.minutter, 'minutter')}
                </div>
            </>
        );
    return '';
};

const Template: ComponentStory<typeof TidsbrukKalender> = (args) => (
    <TidsbrukKalender {...args} ModalContent={<ExampleModalContent />} dateContentRenderer={dateContent} />
);

export const multiSelect = Template.bind({});

multiSelect.args = {
    gyldigPeriode: { fom: new Date('2022-08-01'), tom: new Date('2022-08-15') },
    kalenderdager: [
        { date: new Date('2022-08-01'), tid: { timer: 3, minutter: 30 }, tidOpprinnelig: { timer: 7, minutter: 30 } },
    ],
};
