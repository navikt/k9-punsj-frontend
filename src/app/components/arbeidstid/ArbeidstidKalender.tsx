import intlHelper from 'app/utils/intlUtils';
import { arbeidstidPeriodeTilKalenderdag } from 'app/utils/mappingUtils';
import React, { useState } from 'react';
import {
    ITimerOgMinutterString,
    Periode,
    Periodeinfo,
    IArbeidstidPeriodeMedTimer,
    IPeriode,
    ArbeidstidPeriodeMedTimer,
} from 'app/models/types';
import { formats, removeDatesFromPeriods } from 'app/utils';
import dayjs from 'dayjs';
import { Button, Modal } from '@navikt/ds-react';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import { useIntl } from 'react-intl';
import DateContent from '../calendar/DateContent';
import TidsbrukKalenderContainer from '../calendar/TidsbrukKalenderContainer';
import ArbeidstidPeriodeListe from '../timefoering/ArbeidstidPeriodeListe';
import FaktiskOgNormalTid from '../timefoering/FaktiskOgNormalTid';
import VerticalSpacer from '../VerticalSpacer';

interface OwnProps {
    arbeidstidInfo: ArbeidstidInfo;
    updateSoknad: (v: IArbeidstidPeriodeMedTimer[]) => void;
    updateSoknadState: (v: IArbeidstidPeriodeMedTimer[]) => void;
    soknadsperioder: IPeriode[];
}

export default function ArbeidstidKalender({
    arbeidstidInfo,
    updateSoknad,
    updateSoknadState,
    soknadsperioder,
}: OwnProps) {
    const intl = useIntl();
    const [visArbeidstidLengrePerioder, setVisArbeidstidLengrePerioder] = useState(false);
    const toggleVisArbeidstidLengrePerioder = () => setVisArbeidstidLengrePerioder(!visArbeidstidLengrePerioder);

    const lagreTimer = ({
        faktiskArbeidPerDag,
        jobberNormaltPerDag,
        selectedDates,
    }: {
        faktiskArbeidPerDag: ITimerOgMinutterString;
        jobberNormaltPerDag: ITimerOgMinutterString;
        selectedDates: Date[];
    }) => {
        const utenDagerSomAlleredeFinnes = selectedDates.filter(
            (day) => !arbeidstidInfo.perioder.some((periode) => periode.periode.includesDate(day))
        );
        const payload = utenDagerSomAlleredeFinnes.map((day) => ({
            periode: new Periode({
                fom: dayjs(day).format(formats.YYYYMMDD),
                tom: dayjs(day).format(formats.YYYYMMDD),
            }),
            faktiskArbeidPerDag,
            jobberNormaltPerDag,
        }));
        updateSoknad([...arbeidstidInfo.perioder, ...payload]);
        updateSoknadState([...arbeidstidInfo.perioder, ...payload]);
    };

    const slettDager =
        (opprinneligePerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => (selectedDates?: Date[]) => {
            if (!selectedDates) {
                return;
            }

            const perioderFiltert = removeDatesFromPeriods(opprinneligePerioder, selectedDates).map(
                (v: IArbeidstidPeriodeMedTimer) => new ArbeidstidPeriodeMedTimer(v)
            );

            updateSoknad(perioderFiltert);
            updateSoknadState(perioderFiltert);
        };
    return (
        <>
            <Button variant="secondary" onClick={toggleVisArbeidstidLengrePerioder}>
                {intlHelper(intl, 'skjema.arbeid.registrerArbeidstidLengrePeriode')}
            </Button>
            <VerticalSpacer twentyPx />
            <Modal
                open={visArbeidstidLengrePerioder}
                onClose={toggleVisArbeidstidLengrePerioder}
                className="lengre-periode-modal"
            >
                <Modal.Content>
                    <ArbeidstidPeriodeListe
                        heading="Periode med jobb"
                        arbeidstidPerioder={arbeidstidInfo.perioder}
                        soknadsperioder={soknadsperioder}
                        lagre={(periodeInfo) => {
                            updateSoknad(periodeInfo);
                            updateSoknadState(periodeInfo);
                            toggleVisArbeidstidLengrePerioder();
                        }}
                        avbryt={toggleVisArbeidstidLengrePerioder}
                    />
                </Modal.Content>
            </Modal>
            {soknadsperioder && (
                <TidsbrukKalenderContainer
                    gyldigePerioder={soknadsperioder}
                    ModalContent={<FaktiskOgNormalTid heading="Registrer arbeidstid" lagre={lagreTimer} />}
                    kalenderdager={arbeidstidInfo.perioder.flatMap((periode) =>
                        arbeidstidPeriodeTilKalenderdag(periode)
                    )}
                    slettPeriode={slettDager(arbeidstidInfo.perioder)}
                    dateContentRenderer={DateContent}
                />
            )}
        </>
    );
}
