import React from 'react';
import { BodyShort, Heading, Label } from '@navikt/ds-react';
import { periodToFormattedString, formatereTekstMedTimerOgMinutter } from 'app/utils';
import { Fravaersperiode } from 'app/models/types/KvitteringTyper';
import intlHelper from 'app/utils/intlUtils';
import { useIntl } from 'react-intl';

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
                <BodyShort>{formatereTekstMedTimerOgMinutter(periode.delvisFravær.normalarbeidstid)}</BodyShort>
            </div>
            <div>
                <Label>{intlHelper(intl, 'skjema.arbeid.arbeidstaker.fraværPerDag')}:</Label>
                <BodyShort>{formatereTekstMedTimerOgMinutter(periode.duration)}</BodyShort>
            </div>
            <div>
                <Label>Søknadsårsak:</Label>
                <BodyShort>
                    {intlHelper(intl, `omsorgspenger.omsorgspengeutbetaling.søknadsårsaker.${periode.søknadÅrsak}`)}
                </BodyShort>
            </div>
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
