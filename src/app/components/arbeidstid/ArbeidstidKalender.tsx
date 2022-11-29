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
import { ArbeidstidInfo } from 'app/models/types/søknadTypes/ArbeidstidInfo';
import { useIntl } from 'react-intl';
import DateContent from '../calendar/DateContent';
import TidsbrukKalenderContainer from '../calendar/TidsbrukKalenderContainer';
import ArbeidstidPeriodeListe from '../timefoering/ArbeidstidPeriodeListe';
import FaktiskOgNormalTid from '../timefoering/FaktiskOgNormalTid';
import VerticalSpacer from '../VerticalSpacer';

export interface ArbeidstidKalenderProps {
    arbeidstidInfo: ArbeidstidInfo;
    updateSoknad: (v: IArbeidstidPeriodeMedTimer[]) => void;
    updateSoknadState?: (v: IArbeidstidPeriodeMedTimer[]) => void;
    nyeSoknadsperioder: IPeriode[];
    eksisterendeSoknadsperioder: IPeriode[];
}

export default function ArbeidstidKalender({
    arbeidstidInfo,
    updateSoknad,
    updateSoknadState,
    nyeSoknadsperioder = [],
    eksisterendeSoknadsperioder = [],
}: ArbeidstidKalenderProps) {
    const intl = useIntl();
    const [visArbeidstidLengrePerioder, setVisArbeidstidLengrePerioder] = useState(false);
    const toggleVisArbeidstidLengrePerioder = () => setVisArbeidstidLengrePerioder(!visArbeidstidLengrePerioder);

    const gyldigePerioder = [...nyeSoknadsperioder, ...eksisterendeSoknadsperioder].filter(Boolean);

    const slettDager =
        (opprinneligePerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => (selectedDates?: Date[]) => {
            if (!selectedDates) {
                return;
            }

            const perioderFiltert = removeDatesFromPeriods(opprinneligePerioder, selectedDates).map(
                (v: IArbeidstidPeriodeMedTimer) => new ArbeidstidPeriodeMedTimer(v)
            );

            updateSoknad(perioderFiltert);
            if (updateSoknadState) {
                updateSoknadState(perioderFiltert);
            }
        };

    const lagreTimer = ({
        faktiskArbeidPerDag,
        jobberNormaltPerDag,
        selectedDates,
    }: {
        faktiskArbeidPerDag: ITimerOgMinutterString;
        jobberNormaltPerDag: ITimerOgMinutterString;
        selectedDates: Date[];
    }) => {
        const eksisterendePerioderUtenSelectedDates = removeDatesFromPeriods(
            arbeidstidInfo.perioder,
            selectedDates
        ).map((v: IArbeidstidPeriodeMedTimer) => new ArbeidstidPeriodeMedTimer(v));

        const payload = selectedDates.map((day) => ({
            periode: new Periode({
                fom: dayjs(day).format(formats.YYYYMMDD),
                tom: dayjs(day).format(formats.YYYYMMDD),
            }),
            faktiskArbeidPerDag,
            jobberNormaltPerDag,
        }));
        updateSoknad([...eksisterendePerioderUtenSelectedDates, ...payload]);
        if (updateSoknadState) {
            updateSoknadState([...eksisterendePerioderUtenSelectedDates, ...payload]);
        }
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
                className="venstrestilt lengre-periode-modal"
            >
                <Modal.Content>
                    <ArbeidstidPeriodeListe
                        heading="Periode med jobb"
                        arbeidstidPerioder={arbeidstidInfo.perioder}
                        soknadsperioder={gyldigePerioder}
                        nyeSoknadsperioder={nyeSoknadsperioder}
                        lagre={(periodeInfo) => {
                            updateSoknad(periodeInfo);
                            if (updateSoknadState) {
                                updateSoknadState(periodeInfo);
                            }
                            toggleVisArbeidstidLengrePerioder();
                        }}
                        avbryt={toggleVisArbeidstidLengrePerioder}
                    />
                </Modal.Content>
            </Modal>
            {gyldigePerioder && (
                <TidsbrukKalenderContainer
                    gyldigePerioder={gyldigePerioder}
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
