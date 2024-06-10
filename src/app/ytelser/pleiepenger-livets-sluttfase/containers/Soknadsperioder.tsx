import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { Alert, Panel } from '@navikt/ds-react';

import { initializeDate } from 'app/utils';

import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import CalendarSvg from 'app/assets/SVG/CalendarSVG';
import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import { generateDateString } from 'app/components/skjema/skjemaUtils';
import { Periodepaneler } from 'app/components/periodepaneler/Periodepaneler';
import { GetUhaandterteFeil, IPeriode } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { IPLSSoknad } from '../types/PLSSoknad';
import './soknadsperioder.less';

interface IOwnProps {
    updateSoknadState: (soknad: Partial<IPLSSoknad>) => void;
    initialPeriode: IPeriode;
    getErrorMessage: (attribute: string, indeks?: number | undefined) => string | undefined;
    soknad: IPLSSoknad;
    updateSoknad: (soknad: Partial<IPLSSoknad>) => void;
    getUhaandterteFeil: GetUhaandterteFeil;
}

const Soknadsperioder: React.FunctionComponent<IOwnProps> = ({
    updateSoknadState,
    initialPeriode,
    getErrorMessage,
    soknad,
    updateSoknad,
    getUhaandterteFeil,
}) => {
    const intl = useIntl();
    const [visLeggTilPerioder, setVisLeggTilPerioder] = useState<boolean>(true);
    const [harSlettetPerioder, setHarSlettetPerioder] = useState<boolean>(false);
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState);
    const finnesIkkeEksisterendePerioder: boolean =
        !punchFormState.hentPerioderError && !punchFormState?.perioder?.length;

    const overlappendeSoknadsperiode = () => {
        const eksisterendePerioder = punchFormState.perioder;
        const nyePerioder = soknad.soeknadsperiode?.filter((periode) => periode.fom && periode.tom);

        if (!eksisterendePerioder || eksisterendePerioder.length === 0) {
            return false;
        }
        return eksisterendePerioder.some((ep) =>
            nyePerioder?.some(
                (nyPeriode) =>
                    initializeDate(ep.fom).isSameOrBefore(initializeDate(nyPeriode.tom)) &&
                    initializeDate(nyPeriode.fom).isSameOrBefore(initializeDate(ep.tom)),
            ),
        );
    };

    const getPerioder = () => {
        if (soknad.soeknadsperiode && soknad.soeknadsperiode.length > 0) {
            return soknad.soeknadsperiode;
        }

        if (harSlettetPerioder) {
            return [];
        }

        return [initialPeriode];
    };

    return (
        <Panel className="eksiterendesoknaderpanel">
            <h3>{intlHelper(intl, 'skjema.soknadsperiode')}</h3>
            {punchFormState.hentPerioderError && <p>{intlHelper(intl, 'skjema.eksisterende.feil')}</p>}
            {!punchFormState.hentPerioderError && !!punchFormState.perioder?.length && (
                <>
                    <Alert size="small" variant="info">
                        {intlHelper(intl, 'skjema.generellinfo')}
                    </Alert>
                    <h4>{intlHelper(intl, 'skjema.eksisterende')}</h4>
                    {punchFormState.perioder.map((p) => (
                        <div key={`${p.fom}_${p.tom}`} className="datocontainer">
                            <CalendarSvg title="calendar" />
                            <div className="periode">{generateDateString(p)}</div>
                        </div>
                    ))}

                    <VerticalSpacer eightPx />
                    {visLeggTilPerioder && (
                        <div className="knappecontainer">
                            <button
                                id="leggtilsoknadsperiode"
                                className="leggtilsoknadsperiode"
                                type="button"
                                onClick={() => {
                                    setVisLeggTilPerioder(false);
                                    updateSoknadState({ soeknadsperiode: [initialPeriode] });
                                }}
                            >
                                <div className="leggtilcircle">
                                    <AddCircleSvg title="leggtilcircle" />
                                </div>
                                {intlHelper(intl, 'skjema.soknadsperiode.leggtil')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {finnesIkkeEksisterendePerioder && (
                <Alert size="small" variant="info">
                    {intlHelper(intl, 'skjema.eksisterende.ingen')}
                </Alert>
            )}

            {(!visLeggTilPerioder || finnesIkkeEksisterendePerioder) && (
                <div className="soknadsperiodecontainer">
                    <Periodepaneler
                        intl={intl}
                        periods={getPerioder()}
                        initialPeriode={initialPeriode}
                        editSoknad={(perioder) => updateSoknad({ soeknadsperiode: perioder })}
                        editSoknadState={(perioder) => {
                            updateSoknadState({ soeknadsperiode: perioder });
                        }}
                        textLeggTil="skjema.perioder.legg_til"
                        textFjern="skjema.perioder.fjern"
                        feilkodeprefiks="ytelse.søknadsperiode"
                        getErrorMessage={getErrorMessage}
                        getUhaandterteFeil={getUhaandterteFeil}
                        kanHaFlere
                        onRemove={() => setHarSlettetPerioder(true)}
                    />
                </div>
            )}
            {overlappendeSoknadsperiode() && (
                <Alert size="small" variant="warning">
                    {intlHelper(intl, 'skjema.soknadsperiode.overlapper')}
                </Alert>
            )}
        </Panel>
    );
};
export default Soknadsperioder;
