import React from 'react';
import { useIntl } from 'react-intl';

import { Alert, Panel } from '@navikt/ds-react';

import CalendarSvg from 'app/assets/SVG/CalendarSVG';
import { generateDateString } from 'app/components/skjema/skjemaUtils';
import { Periode } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

import './soknadsperioder.less';

interface IOwnProps {
    eksisterendePerioder: Periode[];
    hentEksisterendePerioderError: boolean;
}

const Soknadsperioder: React.FunctionComponent<IOwnProps> = ({
    eksisterendePerioder,
    hentEksisterendePerioderError,
}) => {
    const intl = useIntl();
    const finnesIkkeEksisterendePerioder = !eksisterendePerioder.length;

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
                    {eksisterendePerioder.map((p) => (
                        <div key={`${p.fom}_${p.tom}`} className="datocontainer">
                            <CalendarSvg title="calendar" />
                            <div className="periode">{generateDateString(p)}</div>
                        </div>
                    ))}
                </>
            )}

            {finnesIkkeEksisterendePerioder && (
                <Alert size="small" variant="info">
                    {intlHelper(intl, 'skjema.opplæringspenger.eksisterende.ingen')}
                </Alert>
            )}
        </Panel>
    );
};
export default Soknadsperioder;
