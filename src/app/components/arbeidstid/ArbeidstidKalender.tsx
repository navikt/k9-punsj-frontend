import React, { useState, useEffect } from 'react';

import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import { Button, Heading, Modal } from '@navikt/ds-react';
import {
    ArbeidstidPeriodeMedTimer,
    IArbeidstidPeriodeMedTimer,
    IPeriode,
    ITimerOgMinutterString,
    Periode,
    Periodeinfo,
} from 'app/models/types';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import { formats, removeDatesFromPeriods } from 'app/utils';
import { arbeidstidPeriodeTilKalenderdag } from 'app/utils/mappingUtils';
import VerticalSpacer from '../VerticalSpacer';
import DateContent from '../calendar/DateContent';
import TidsbrukKalenderContainer from '../calendar/TidsbrukKalenderContainer';
import ArbeidstidPeriodeListe from '../timefoering/ArbeidstidPeriodeListe';
import FaktiskOgNormalTid from '../timefoering/FaktiskOgNormalTid';

export interface ArbeidstidKalenderProps {
    arbeidstidInfo: ArbeidstidInfo;
    updateSoknad: (v: IArbeidstidPeriodeMedTimer[]) => void;
    updateSoknadState?: (v: IArbeidstidPeriodeMedTimer[]) => void;
    nyeSoknadsperioder: IPeriode[] | null;
    eksisterendeSoknadsperioder: IPeriode[];
}

// Wrapper-komponent for FaktiskOgNormalTid
const FaktiskOgNormalTidWrapper = (props: {
    heading: string;
    lagre: (
        params: { faktiskArbeidPerDag: ITimerOgMinutterString; jobberNormaltPerDag: ITimerOgMinutterString },
        selectedDates: Date[],
    ) => void;
    toggleModal?: () => void;
    selectedDates?: Date[];
    clearSelectedDates?: () => void;
}) => (
    <FaktiskOgNormalTid
        {...props}
        toggleModal={props.toggleModal || (() => {})}
        selectedDates={props.selectedDates || []}
    />
);

const ArbeidstidKalender = ({
    arbeidstidInfo,
    updateSoknad,
    updateSoknadState,
    nyeSoknadsperioder = [],
    eksisterendeSoknadsperioder = [],
}: ArbeidstidKalenderProps) => {
    const [visArbeidstidLengrePerioder, setVisArbeidstidLengrePerioder] = useState(false);
    // Holder en kopi av perioder som vises i modalen
    const [perioderForModal, setPerioderForModal] = useState<IArbeidstidPeriodeMedTimer[]>([]);

    // Oppdaterer perioderForModal når arbeidstidInfo endres
    useEffect(() => {
        if (arbeidstidInfo && arbeidstidInfo.perioder) {
            // Kopier alle perioder fra arbeidstidInfo
            const perioder = arbeidstidInfo.perioder.map((p) => new ArbeidstidPeriodeMedTimer(p));
            setPerioderForModal(perioder);
        }
    }, [arbeidstidInfo, arbeidstidInfo.perioder]);

    const toggleVisArbeidstidLengrePerioder = () => {
        // Sikrer at vi har oppdaterte perioder når modalen åpnes
        if (!visArbeidstidLengrePerioder) {
            // Når modalen åpnes, oppdaterer vi perioderForModal med de nyeste data fra arbeidstidInfo
            if (arbeidstidInfo && arbeidstidInfo.perioder) {
                const perioder = arbeidstidInfo.perioder.map((p) => new ArbeidstidPeriodeMedTimer(p));
                setPerioderForModal(perioder);
            }
        }
        setVisArbeidstidLengrePerioder(!visArbeidstidLengrePerioder);
    };

    const gyldigePerioder = [...(nyeSoknadsperioder || []), ...eksisterendeSoknadsperioder].filter(Boolean);

    const slettDager =
        (opprinneligePerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => (selectedDates?: Date[]) => {
            if (!selectedDates) {
                return;
            }

            const perioderFiltert = removeDatesFromPeriods(opprinneligePerioder, selectedDates).map(
                (v: IArbeidstidPeriodeMedTimer) => new ArbeidstidPeriodeMedTimer(v),
            );

            updateSoknad(perioderFiltert);
            if (updateSoknadState) {
                updateSoknadState(perioderFiltert);
            }

            // Oppdaterer også perioder for modal
            setPerioderForModal(perioderFiltert);
        };

    const lagreTimer = (
        {
            faktiskArbeidPerDag,
            jobberNormaltPerDag,
        }: {
            faktiskArbeidPerDag: ITimerOgMinutterString;
            jobberNormaltPerDag: ITimerOgMinutterString;
        },
        selectedDates: Date[],
    ) => {
        const eksisterendePerioderUtenSelectedDates = removeDatesFromPeriods(
            arbeidstidInfo.perioder,
            selectedDates,
        ).map((v: IArbeidstidPeriodeMedTimer) => new ArbeidstidPeriodeMedTimer(v));

        const payload = selectedDates.map((day: Date) => ({
            periode: new Periode({
                fom: dayjs(day).format(formats.YYYYMMDD),
                tom: dayjs(day).format(formats.YYYYMMDD),
            }),
            faktiskArbeidPerDag,
            jobberNormaltPerDag,
        }));

        const nyePerioder = [...eksisterendePerioderUtenSelectedDates, ...payload];

        updateSoknad(nyePerioder);
        if (updateSoknadState) {
            updateSoknadState(nyePerioder);
        }

        setPerioderForModal(nyePerioder);
    };

    const lagrePerioder = (nyePerioder: IArbeidstidPeriodeMedTimer[]) => {
        // Ved lagring erstatter vi alle periodene med de nye fra modalvinduet
        updateSoknad(nyePerioder);
        if (updateSoknadState) {
            updateSoknadState(nyePerioder);
        }

        // Oppdaterer også perioder for modal
        setPerioderForModal(nyePerioder);
    };

    return (
        <div className="mt-6">
            <div className="mb-4">
                <Heading size="xsmall">
                    <FormattedMessage id="skjema.arbeid.arbeidstidKalender.header" />
                </Heading>
            </div>

            <Button variant="secondary" onClick={toggleVisArbeidstidLengrePerioder}>
                <FormattedMessage id="skjema.arbeid.registrerArbeidstidLengrePeriode" />
            </Button>

            <VerticalSpacer twentyPx />

            {visArbeidstidLengrePerioder && (
                <Modal
                    open={true}
                    onClose={() => setVisArbeidstidLengrePerioder(false)}
                    aria-label="Periode med jobb modal"
                >
                    <Modal.Body data-test-id="arbeidstid-periode-liste">
                        <ArbeidstidPeriodeListe
                            heading="Periode med jobb"
                            arbeidstidPerioder={perioderForModal}
                            soknadsperioder={gyldigePerioder}
                            lagre={(periodeInfo) => {
                                lagrePerioder(periodeInfo);
                                toggleVisArbeidstidLengrePerioder();
                            }}
                            avbryt={toggleVisArbeidstidLengrePerioder}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {!!gyldigePerioder.length && (
                <TidsbrukKalenderContainer
                    gyldigePerioder={gyldigePerioder}
                    ModalContent={<FaktiskOgNormalTidWrapper heading="Registrer arbeidstid" lagre={lagreTimer} />}
                    kalenderdager={arbeidstidInfo.perioder
                        .map((periode) => new ArbeidstidPeriodeMedTimer(periode))
                        .flatMap((periode) => arbeidstidPeriodeTilKalenderdag(periode))}
                    slettPeriode={slettDager(arbeidstidInfo.perioder)}
                    dateContentRenderer={DateContent}
                />
            )}
        </div>
    );
};

export default ArbeidstidKalender;
