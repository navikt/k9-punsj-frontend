import React from 'react';
import { Heading, Select, Textarea, TextField } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';

import './annenForelder.less';
import { IntlShape } from 'react-intl';
import { Field } from 'formik';
import { IOMPMASoknad } from '../types/OMPMASoknad';

const situasjonstyper = ['INNLAGT_I_HELSEINSTITUSJON', 'UTØVER_VERNEPLIKT', 'FENGSEL', 'SYKDOM', 'ANNET'];

type OwnProps = {
    values: IOMPMASoknad;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    intl: IntlShape;
    getErrorMessage: (path: string) => string | undefined;
    visFeil: boolean;
};

const AnnenForelder = ({ intl, changeAndBlurUpdatesSoknad, values, getErrorMessage, visFeil }: OwnProps) => (
    <Panel border>
        <Heading size="xsmall" spacing>
            Annen forelder
        </Heading>
        <VerticalSpacer twentyPx />
        <Field name="annenForelder.identifikasjonsnummer">
            {({ field, meta }) => (
                <TextField
                    label="Identifikasjonsnummer"
                    size="small"
                    error={meta.touched && meta.error}
                    value={values.annenForelder.norskIdent}
                    {...field}
                />
            )}
        </Field>

        <VerticalSpacer twentyPx />
        <Field name="annenForelder.situasjonType">
            {({ field, meta }) => (
                <Select
                    size="small"
                    label="Hva er situasjonen til den andre forelderen?"
                    error={meta.touched && meta.error}
                    {...field}
                >
                    <option value="">Velg situasjon</option>
                    {situasjonstyper.map((situasjonstype) => (
                        <option value={situasjonstype}>
                            {intlHelper(intl, `omsorgspenger.midlertidigAlene.situasjonstyper.${situasjonstype}`)}
                        </option>
                    ))}
                </Select>
            )}
        </Field>
        <VerticalSpacer twentyPx />
        <Field name="annenForelder.situasjonBeskrivelse">
            {({ field, meta }) => (
                <Textarea
                    size="small"
                    label="Beskrivelse av situasjonen"
                    error={meta.touched && meta.error}
                    {...field}
                />
            )}
        </Field>
        <VerticalSpacer twentyPx />
        <PeriodInput
            intl={intl}
            periode={values.annenForelder.periode}
            error={visFeil && getErrorMessage('periode')}
            errorFom={visFeil && getErrorMessage('periodeFom')}
            errorTom={visFeil && getErrorMessage('periodeTom')}
            {...changeAndBlurUpdatesSoknad((periode) => ({
                ...values,
                annenForelder: { ...values.annenForelder, periode },
            }))}
        />
    </Panel>
);

export default AnnenForelder;
