import React from 'react';
import { Heading, Select, Textarea, TextField } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';

import './annenForelder.less';
import { IntlShape } from 'react-intl';
import { AnnenForelderType } from '../types/OMPMASoknad';

const situasjonstyper = ['INNLAGT_I_HELSEINSTITUSJON', 'UTØVER_VERNEPLIKT', 'FENGSEL', 'SYKDOM', 'ANNET'];

type OwnProps = {
    annenForelder: AnnenForelderType;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    intl: IntlShape;
};

const AnnenForelder = ({ intl, annenForelder, changeAndBlurUpdatesSoknad }: OwnProps) => (
        <Panel border>
            <Heading size="xsmall" spacing>
                Annen forelder
            </Heading>
            <VerticalSpacer twentyPx />
            <TextField label="Identifikasjonsnummer" size="small" />
            <VerticalSpacer twentyPx />
            <Select size="small" label="Hva er situasjonen til den andre forelderen?">
                <option value="">Velg situasjon</option>
                {situasjonstyper.map((situasjonstype) => (
                    <option value={situasjonstype}>
                        {intlHelper(intl, `omsorgspenger.midlertidigAlene.situasjonstyper.${situasjonstype}`)}
                    </option>
                ))}
            </Select>
            <VerticalSpacer twentyPx />
            <Textarea size="small" label="Beskrivelse av situasjonen" />
            <VerticalSpacer twentyPx />
            <PeriodInput intl={intl} />
        </Panel>
    );

export default AnnenForelder;
