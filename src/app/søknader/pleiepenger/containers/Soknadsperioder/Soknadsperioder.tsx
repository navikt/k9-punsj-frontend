import React, { useEffect, useState } from 'react';

import { Alert, Box, Button, Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { CalendarIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { generateDateString } from 'app/components/skjema/skjemaUtils';
import { initializeDate } from 'app/utils';
import { GetUhaandterteFeil, IPSBSoknad, IPeriode, IPunchPSBFormState } from 'app/models/types';
import { Periodepaneler } from '../../../../components/Periodepaneler';

import './soknadsperioder.less';

interface Props {
    soknad: IPSBSoknad;
    initialPeriode: IPeriode;
    punchFormState: IPunchPSBFormState;

    updateSoknad: (soknad: Partial<IPSBSoknad>) => void;
    updateSoknadState: (soknad: Partial<IPSBSoknad>) => void;
    getErrorMessage: (attribute: string, indeks?: number | undefined) => string | undefined;
    getUhaandterteFeil: GetUhaandterteFeil;
}

const Soknadsperioder: React.FC<Props> = ({
    soknad,
    initialPeriode,
    punchFormState,

    updateSoknad,
    updateSoknadState,
    getErrorMessage,
    getUhaandterteFeil,
}) => {
    const harLagretPerioder = soknad.soeknadsperiode && soknad.soeknadsperiode.length > 0;

    const [visLeggTilPerioder, setVisLeggTilPerioder] = useState<boolean>(true);
    const [harSlettetPerioder, setHarSlettetPerioder] = useState<boolean>(false);

    useEffect(() => {
        if (harLagretPerioder && visLeggTilPerioder) {
            setVisLeggTilPerioder(false);
        }
    }, [harLagretPerioder, visLeggTilPerioder, setVisLeggTilPerioder]);

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
        if (harLagretPerioder) {
            return soknad.soeknadsperiode;
        }

        if (harSlettetPerioder) {
            return [];
        }

        return [initialPeriode];
    };

    return (
        <Box
            padding="4"
            borderWidth="1"
            borderRadius="small"
            className="eksiterendesoknaderpanel"
            data-testid="søknadsperioder"
        >
            <div className="mb-4">
                <Heading size="small" level="3">
                    <FormattedMessage id={'skjema.soknadsperiode'} />
                </Heading>
            </div>

            {punchFormState.hentPerioderError && (
                <p>
                    <FormattedMessage id={'skjema.eksisterende.feil'} />
                </p>
            )}

            {!punchFormState.hentPerioderError && !!punchFormState.perioder?.length && (
                <>
                    <Alert size="small" variant="info">
                        <FormattedMessage id={'skjema.generellinfo'} />
                    </Alert>

                    <div className="mb-2 mt-4">
                        <Heading size="xsmall" level="4">
                            <FormattedMessage id={'skjema.eksisterende'} />
                        </Heading>
                    </div>

                    {punchFormState.perioder.map((p) => (
                        <div key={`${p.fom}_${p.tom}`} className="datocontainer">
                            <CalendarIcon title="calendar" fontSize="2rem" />

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
                                icon={<PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />}
                                size="small"
                                data-testid="leggtilsoknadsperiode"
                            >
                                <FormattedMessage id={'skjema.soknadsperiode.leggtil'} />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {finnesIkkeEksisterendePerioder && (
                <Alert size="small" variant="info">
                    <FormattedMessage id={'skjema.eksisterende.ingen'} />
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
                        doNotShowBorders
                    />
                </div>
            )}

            {overlappendeSoknadsperiode() && (
                <Alert size="small" variant="warning">
                    <FormattedMessage id={'skjema.soknadsperiode.overlapper'} />
                </Alert>
            )}
        </Box>
    );
};
export default Soknadsperioder;
