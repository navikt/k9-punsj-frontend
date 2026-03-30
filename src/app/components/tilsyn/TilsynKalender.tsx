import React from 'react';

import { IOmsorgstid, IPeriode, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { periodeMedTimerTilKalenderdag } from 'app/utils/mappingUtils';

import KalenderMedModal from '../calendar/KalenderMedModal';
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
    const gyldigePerioder = [...nyeSoknadsperioder, ...eksisterendeSoknadsperioder];

    return (
        <KalenderMedModal
            gyldigePerioder={gyldigePerioder}
            kalenderdager={perioderMedTimer.flatMap((p) => periodeMedTimerTilKalenderdag(new PeriodeMedTimerMinutter(p)))}
            tidModal={
                <TilsynTid
                    heading="Registrer omsorgstilbud"
                    lagre={(payload) => tilsynLagreTimer({ ...payload, perioderMedTimer, updateSoknad, updateSoknadState })}
                    toggleModal={() => {}}
                />
            }
            periodeListeModal={(close) => (
                <TilsynPeriodeListe
                    perioder={perioderMedTimer}
                    soknadsperioder={gyldigePerioder}
                    lagre={(periodeInfo) => { updateSoknad(periodeInfo); updateSoknadState(periodeInfo); close(); }}
                    avbryt={close}
                />
            )}
            slettPeriode={(selectedDates) => tilsynSlettDager({ perioderMedTimer, selectedDates, updateSoknad, updateSoknadState })}
            lengrePeriodeIntlId="tilsyn.kalender.lengrePeriodeÅpen.btn"
        />
    );
};

export default TilsynKalender;
