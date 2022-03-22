import React from 'react';
import { Heading, Select, Textarea, TextField } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';

import './annenForelder.less';
import { IntlShape } from 'react-intl';
import { IOMPMASoknad } from '../types/OMPMASoknad';

const situasjonstyper = ['INNLAGT_I_HELSEINSTITUSJON', 'UTØVER_VERNEPLIKT', 'FENGSEL', 'SYKDOM', 'ANNET'];

type OwnProps = {
    soknad: IOMPMASoknad;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    intl: IntlShape;
};

const AnnenForelder = ({ intl, changeAndBlurUpdatesSoknad, soknad }: OwnProps) => (
    <Panel border>
        <Heading size="xsmall" spacing>
            Annen forelder
        </Heading>
        <VerticalSpacer twentyPx />
        <TextField
            label="Identifikasjonsnummer"
            size="small"
            value={soknad.annenForelder.norskIdent}
            {...changeAndBlurUpdatesSoknad((e) => ({
                ...soknad,
                annenForelder: { ...soknad.annenForelder, norskIdent: e.target.value },
            }))}
        />
        <VerticalSpacer twentyPx />
        <Select
            size="small"
            label="Hva er situasjonen til den andre forelderen?"
            value={soknad.annenForelder.situasjonType}
            {...changeAndBlurUpdatesSoknad((e) => ({
                ...soknad,
                annenForelder: { ...soknad.annenForelder, situasjonType: e.target.value },
            }))}
        >
            <option value="">Velg situasjon</option>
            {situasjonstyper.map((situasjonstype) => (
                <option value={situasjonstype}>
                    {intlHelper(intl, `omsorgspenger.midlertidigAlene.situasjonstyper.${situasjonstype}`)}
                </option>
            ))}
        </Select>
        <VerticalSpacer twentyPx />
        <Textarea
            size="small"
            label="Beskrivelse av situasjonen"
            value={soknad.annenForelder.situasjonBeskrivelse}
            {...changeAndBlurUpdatesSoknad((e) => ({
                ...soknad,
                annenForelder: { ...soknad.annenForelder, situasjonBeskrivelse: e.target.value },
            }))}
        />
        <VerticalSpacer twentyPx />
        <PeriodInput
            intl={intl}
            periode={soknad.annenForelder.periode}
            {...changeAndBlurUpdatesSoknad((periode) => ({
                ...soknad,
                annenForelder: { ...soknad.annenForelder, periode },
            }))}
        />
    </Panel>
);

export default AnnenForelder;
