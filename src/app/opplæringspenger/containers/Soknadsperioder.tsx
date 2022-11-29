import { Alert, Panel } from '@navikt/ds-react';
import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import CalendarSvg from 'app/assets/SVG/CalendarSVG';
import { generateDateString } from 'app/components/skjema/skjemaUtils';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { Periode } from 'app/models/types';
import { OLPSoknad } from 'app/models/types/søknadTypes/OLPSoknad';
import { initializeDate } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { useFormikContext } from 'formik';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Periodepaneler } from './Periodepaneler';
import './soknadsperioder.less';

interface IOwnProps {
    eksisterendePerioder: Periode[];
    hentEksisterendePerioderError: boolean;
}

const initialPeriode = { fom: '', tom: '' };

const Soknadsperioder: React.FunctionComponent<IOwnProps> = ({
    eksisterendePerioder,
    hentEksisterendePerioderError,
}) => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();
    const intl = useIntl();
    const [visLeggTilPerioder, setVisLeggTilPerioder] = useState<boolean>(true);
    const [harSlettetPerioder, setHarSlettetPerioder] = useState<boolean>(false);
    const finnesIkkeEksisterendePerioder = !eksisterendePerioder.length;

    const overlappendeSoknadsperiode = () => {
        const nyePerioder = values.soeknadsperiode?.filter((periode) => periode.fom && periode.tom);

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
        if (values.soeknadsperiode && values.soeknadsperiode.length > 0) {
            return values.soeknadsperiode;
        }

        if (harSlettetPerioder) {
            return [];
        }

        return [initialPeriode];
    };

    return (
        <Panel className="eksiterendesoknaderpanel">
            <h3>{intl.formatMessage({ id: 'skjema.soknadsperiode' })}</h3>
            {hentEksisterendePerioderError && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'skjema.eksisterende.feil')}
                </Alert>
            )}
            {!!eksisterendePerioder?.length && (
                <>
                    <Alert size="small" variant="info">
                        {intlHelper(intl, 'skjema.generellinfo')}
                    </Alert>
                    <h4>{intlHelper(intl, 'skjema.eksisterende')}</h4>
                    {eksisterendePerioder.map((p, i) => (
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
                                    setFieldValue('soeknadsperiode', [initialPeriode]);
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
                            initialPeriode={initialPeriode}
                            editSoknad={(perioder) => setFieldValue('soeknadsperiode', [...perioder])}
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            feilkodeprefiks="ytelse.søknadsperiode"
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
