import React, { useState } from 'react';

import { Button, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { IOmsorgstid, IPeriode, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { periodeMedTimerTilKalenderdag } from 'app/utils/mappingUtils';

import DateContent from '../calendar/DateContent';
import TidsbrukKalenderContainer from '../calendar/TidsbrukKalenderContainer';
import VerticalSpacer from '../VerticalSpacer';
import TilsynPeriodeListe from './TilsynPeriodeListe';
import TilsynTid from './TilsynTid';
import { tilsynLagreTimer, tilsynSlettDager } from './utils';

interface Props {
    perioderMedTimer: Periodeinfo<IOmsorgstid>[];
    nyeSoknadsperioder: IPeriode[];
    eksisterendeSoknadsperioder: IPeriode[];

    updateSoknad: (v: Periodeinfo<IOmsorgstid>[]) => void;
    updateSoknadState: (v: Periodeinfo<IOmsorgstid>[]) => void;
}

const TilsynKalender = ({
    perioderMedTimer,
    nyeSoknadsperioder = [],
    eksisterendeSoknadsperioder = [],

    updateSoknad,
    updateSoknadState,
}: Props) => {
    const [openPeriodeListe, setOpenPeriodeListe] = useState(false);

    const gyldigePerioder = [...nyeSoknadsperioder, ...eksisterendeSoknadsperioder];

    return (
        <>
            <Button variant="secondary" onClick={() => setOpenPeriodeListe(true)}>
                <FormattedMessage id="tilsyn.kalender.lengrePeriodeÅpen.btn" />
            </Button>

            <VerticalSpacer twentyPx />

            {openPeriodeListe && (
                <Modal
                    open={openPeriodeListe}
                    aria-label="Lengre periode modal"
                    onClose={() => setOpenPeriodeListe(false)}
                    className="max-w-[512px]"
                >
                    <Modal.Body>
                        <TilsynPeriodeListe
                            perioder={perioderMedTimer}
                            soknadsperioder={gyldigePerioder}
                            lagre={(periodeInfo) => {
                                updateSoknad(periodeInfo);
                                updateSoknadState(periodeInfo);
                                setOpenPeriodeListe(false);
                            }}
                            avbryt={() => setOpenPeriodeListe(false)}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {gyldigePerioder && (
                <TidsbrukKalenderContainer
                    gyldigePerioder={gyldigePerioder}
                    ModalContent={
                        <TilsynTid
                            heading="Registrer omsorgstilbud"
                            lagre={(payload) =>
                                tilsynLagreTimer({ ...payload, perioderMedTimer, updateSoknad, updateSoknadState })
                            }
                            toggleModal={() => {}} //TODO: hvor brukes denne?
                        />
                    }
                    kalenderdager={perioderMedTimer.flatMap((periode) =>
                        periodeMedTimerTilKalenderdag(new PeriodeMedTimerMinutter(periode)),
                    )}
                    slettPeriode={(selectedDates) =>
                        tilsynSlettDager({ perioderMedTimer, selectedDates, updateSoknad, updateSoknadState })
                    }
                    dateContentRenderer={DateContent}
                />
            )}
        </>
    );
};

export default TilsynKalender;
