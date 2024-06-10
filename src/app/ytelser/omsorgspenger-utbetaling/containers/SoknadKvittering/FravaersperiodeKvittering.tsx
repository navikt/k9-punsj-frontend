import React from 'react';
import { useIntl } from 'react-intl';

import { BodyShort, Heading, Label } from '@navikt/ds-react';

import { Fravaersperiode } from 'app/models/types/KvitteringTyper';
import { formatereTekstMedTimerOgMinutter, periodToFormattedString } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

export default function FravaersperiodeKvittering({ periode }: { periode: Fravaersperiode }) {
    const intl = useIntl();
    return (
        <div className="values">
            <div style={{ marginBottom: '1rem' }}>
                <Heading style={{ display: 'inline' }} size="small">
                    Fraværsperiode
                </Heading>
                <BodyShort>{` (${periodToFormattedString(periode.periode)})`}</BodyShort>
            </div>
            <div>
                <Label>{intlHelper(intl, 'skjema.arbeid.arbeidstaker.timernormalt')}:</Label>
                <BodyShort>
                    {formatereTekstMedTimerOgMinutter(periode?.delvisFravær?.normalarbeidstid) || '0'}
                </BodyShort>
            </div>
            <div>
                <Label>{intlHelper(intl, 'skjema.arbeid.arbeidstaker.fraværPerDag')}:</Label>
                <BodyShort>{formatereTekstMedTimerOgMinutter(periode?.delvisFravær?.fravær) || '0'}</BodyShort>
            </div>
            {periode.søknadÅrsak && (
                <div>
                    <Label>Søknadsårsak:</Label>
                    <BodyShort>
                        {intlHelper(intl, `omsorgspenger.omsorgspengeutbetaling.søknadsårsaker.${periode.søknadÅrsak}`)}
                    </BodyShort>
                </div>
            )}
            <div>
                <Label>Fraværsårsak:</Label>
                <BodyShort>
                    {intlHelper(intl, `omsorgspenger.omsorgspengeutbetaling.fraværsårsaker.${periode.årsak}`)}
                </BodyShort>
            </div>
            {periode.arbeidsgiverOrgNr && (
                <div>
                    <Label>Organisasjonsnummer:</Label>
                    <BodyShort>{periode.arbeidsgiverOrgNr}</BodyShort>
                </div>
            )}
        </div>
    );
}
