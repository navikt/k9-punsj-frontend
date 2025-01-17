import React, { useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, Heading } from '@navikt/ds-react';

import { initializeDate } from 'app/utils';
import AddCircleSvg from '../../../assets/SVG/AddCircleSVG';
import CalendarSvg from '../../../assets/SVG/CalendarSVG';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { generateDateString } from '../../../components/skjema/skjemaUtils';
import { Periodepaneler } from 'app/components/Periodepaneler';
import { GetUhaandterteFeil, IPeriode } from '../../../models/types';
import { RootStateType } from '../../../state/RootState';
import { IPLSSoknad } from '../types/PLSSoknad';

import './soknadsperioder.less';

interface Props {
    soknad: IPLSSoknad;
    initialPeriode: IPeriode;

    getErrorMessage: (attribute: string, indeks?: number | undefined) => string | undefined;
    getUhaandterteFeil: GetUhaandterteFeil;
    updateSoknadState: (soknad: Partial<IPLSSoknad>) => void;
    updateSoknad: (soknad: Partial<IPLSSoknad>) => void;
}

const Soknadsperioder: React.FC<Props> = ({
    soknad,
    initialPeriode,

    getUhaandterteFeil,
    getErrorMessage,
    updateSoknadState,
    updateSoknad,
}) => {
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
        <Box padding="4" borderWidth="1" borderRadius="small" className="eksiterendesoknaderpanel">
            <Heading size="small" level="3">
                <FormattedMessage id="skjema.soknadsperiode" />
            </Heading>

            {punchFormState.hentPerioderError && (
                <p>
                    <FormattedMessage id="skjema.eksisterende.feil" />
                </p>
            )}

            {!punchFormState.hentPerioderError && !!punchFormState.perioder?.length && (
                <>
                    <Alert size="small" variant="info">
                        <FormattedMessage id="skjema.generellinfo" />
                    </Alert>

                    <div className="mb-2 mt-4">
                        <Heading size="xsmall" level="4">
                            <FormattedMessage id="skjema.eksisterende" />
                        </Heading>
                    </div>

                    {punchFormState.perioder.map((p) => (
                        <div key={`${p.fom}_${p.tom}`} className="datocontainer">
                            <CalendarSvg title="calendar" />

                            <div className="periode">{generateDateString(p)}</div>
                        </div>
                    ))}

                    <VerticalSpacer eightPx />

                    {visLeggTilPerioder && (
                        <div className="knappecontainer">
                            <Button
                                id="leggtilsoknadsperiode"
                                className="leggtilsoknadsperiode"
                                type="button"
                                onClick={() => {
                                    setVisLeggTilPerioder(false);
                                    updateSoknadState({ soeknadsperiode: [initialPeriode] });
                                }}
                                icon={<AddCircleSvg title="leggtilcircle" />}
                                size="small"
                            >
                                <FormattedMessage id="skjema.soknadsperiode.leggtil" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {finnesIkkeEksisterendePerioder && (
                <Alert size="small" variant="info">
                    <FormattedMessage id="skjema.eksisterende.ingen" />
                </Alert>
            )}

            {(!visLeggTilPerioder || finnesIkkeEksisterendePerioder) && (
                <div className="soknadsperiodecontainer">
                    <Periodepaneler
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
                    <FormattedMessage id="skjema.soknadsperiode.overlapper" />
                </Alert>
            )}
        </Box>
    );
};
export default Soknadsperioder;
