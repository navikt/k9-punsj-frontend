import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { BodyShort, Box } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';

import { Fravaersperiode } from 'app/models/types/KvitteringTyper';
import { formatereTekstMedTimerOgMinutter, periodToFormattedString } from 'app/utils';

interface Props {
    periode: Fravaersperiode;
}

const OMPUTFravaersperiodeKvittering: React.FC<Props> = ({ periode }) => {
    const intl = useIntl();

    const periodeFormatted = periodToFormattedString(periode.periode);
    const normalArbeidstidFormatted = formatereTekstMedTimerOgMinutter(periode?.delvisFravær?.normalarbeidstid) || '0';
    const fraværPerDagFormatted = formatereTekstMedTimerOgMinutter(periode?.delvisFravær?.fravær) || '0';

    return (
        <Box padding="4" background="bg-subtle">
            <div className="mb-4">
                <BodyShort size="small">
                    <FormattedMessage
                        id="omsorgspenger.utbetaling.kvittering.fravaersperiode.tittel"
                        values={{
                            periode: periodeFormatted,
                            b: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </BodyShort>
            </div>

            <BodyShort size="small">
                <FormattedMessage
                    id="omsorgspenger.utbetaling.kvittering.fravaersperiode.timernormalt"
                    values={{
                        normalarbeidstid: normalArbeidstidFormatted,
                        b: (chunks) => <strong>{chunks}</strong>,
                    }}
                />
            </BodyShort>

            <BodyShort size="small">
                <FormattedMessage
                    id="omsorgspenger.utbetaling.kvittering.fravaersperiode.fraværPerDag"
                    values={{
                        fraværPerDag: fraværPerDagFormatted,
                        b: (chunks) => <strong>{chunks}</strong>,
                    }}
                />
            </BodyShort>

            {periode.søknadÅrsak && (
                <BodyShort size="small">
                    <FormattedMessage
                        id="omsorgspenger.utbetaling.kvittering.fravaersperiode.søknadsårsak"
                        values={{
                            søknadsårsak: intlHelper(
                                intl,
                                `omsorgspenger.omsorgspengeutbetaling.søknadsårsaker.${periode.søknadÅrsak}`,
                            ),
                            b: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </BodyShort>
            )}

            <BodyShort size="small">
                <FormattedMessage
                    id="omsorgspenger.utbetaling.kvittering.fravaersperiode.fraværsårsak"
                    values={{
                        fraværsårsak: intlHelper(
                            intl,
                            `omsorgspenger.omsorgspengeutbetaling.fraværsårsaker.${periode.årsak}`,
                        ),
                        b: (chunks) => <strong>{chunks}</strong>,
                    }}
                />
            </BodyShort>

            {periode.arbeidsgiverOrgNr && (
                <BodyShort size="small">
                    <FormattedMessage
                        id="omsorgspenger.utbetaling.kvittering.fravaersperiode.organisasjonsnummer"
                        values={{
                            organisasjonsnummer: periode.arbeidsgiverOrgNr,
                            b: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </BodyShort>
            )}
        </Box>
    );
};

export default OMPUTFravaersperiodeKvittering;
