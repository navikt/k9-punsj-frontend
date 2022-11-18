import { initializeDate } from 'app/utils';
import { Alert, Button , Panel } from '@navikt/ds-react';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import AddCircleSvg from '../../../assets/SVG/AddCircleSVG';
import CalendarSvg from '../../../assets/SVG/CalendarSVG';
import { generateDateString } from '../../../components/skjema/skjemaUtils';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { GetUhaandterteFeil, IPeriode, IPSBSoknad } from '../../../models/types';
import { RootStateType } from '../../../state/RootState';
import intlHelper from '../../../utils/intlUtils';
import { Periodepaneler } from '../Periodepaneler';
import './soknadsperioder.less';

interface IOwnProps {
    updateSoknadState: (soknad: Partial<IPSBSoknad>) => void;
    initialPeriode: IPeriode;
    getErrorMessage: (attribute: string, indeks?: number | undefined) => string | undefined;
    soknad: IPSBSoknad;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => void;
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
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_SYKT_BARN.punchFormState);
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
                    initializeDate(nyPeriode.fom).isSameOrBefore(initializeDate(ep.tom))
            )
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
                    {punchFormState.perioder.map((p, i) => (
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
                <SkjemaGruppe>
                    <div className="soknadsperiodecontainer">
                        <Periodepaneler
                            intl={intl}
                            periods={getPerioder()}
                            panelid={(i) => `søknadsperioder_${i}`}
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
                </SkjemaGruppe>
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
