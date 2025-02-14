import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Alert, Box, Heading } from '@navikt/ds-react';
import { CalendarIcon } from '@navikt/aksel-icons';

import { generateDateString } from 'app/components/skjema/skjemaUtils';
import { Periode } from 'app/models/types';

import './soknadsperioder.less';

interface Props {
    eksisterendePerioder: Periode[];
    hentEksisterendePerioderError: boolean;
}

const Soknadsperioder: React.FC<Props> = ({ eksisterendePerioder, hentEksisterendePerioderError }) => {
    const finnesIkkeEksisterendePerioder = !eksisterendePerioder.length;

    return (
        <Box padding="4" borderWidth="1" borderRadius="small" className="eksiterendesoknaderpanel">
            <Heading size="small" level="3">
                <FormattedMessage id="skjema.soknadsperiode" />
            </Heading>

            {hentEksisterendePerioderError && (
                <Alert size="small" variant="error">
                    <FormattedMessage id="skjema.eksisterende.feil" />
                </Alert>
            )}

            {!!eksisterendePerioder?.length && (
                <>
                    <Alert size="small" variant="info">
                        <FormattedMessage id="skjema.generellinfo" />
                    </Alert>

                    <Heading size="small" level="4">
                        <FormattedMessage id="skjema.eksisterende" />
                    </Heading>

                    {eksisterendePerioder.map((p) => (
                        <div key={`${p.fom}_${p.tom}`} className="datocontainer">
                            <CalendarIcon title="calendar" fontSize="2rem" />

                            <div className="periode">{generateDateString(p)}</div>
                        </div>
                    ))}
                </>
            )}

            {finnesIkkeEksisterendePerioder && (
                <Alert size="small" variant="info">
                    <FormattedMessage id="skjema.opplæringspenger.eksisterende.ingen" />
                </Alert>
            )}
        </Box>
    );
};
export default Soknadsperioder;
