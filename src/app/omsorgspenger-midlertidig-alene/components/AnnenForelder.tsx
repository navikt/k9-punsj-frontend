import React from 'react';
import { IntlShape } from 'react-intl';
import { Field } from 'formik';
import { Heading, Select, Textarea, TextField } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';

import './annenForelder.less';
import { OMPMASoknad } from '../types/OMPMASoknad';

const situasjonstyper = ['INNLAGT_I_HELSEINSTITUSJON', 'UTØVER_VERNEPLIKT', 'FENGSEL', 'SYKDOM', 'ANNET'];

type OwnProps = {
    intl: IntlShape;
    updateSoknad: (soknad: OMPMASoknad) => void;
};

const AnnenForelder = ({ intl }: OwnProps) => (
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
                    type="number"
                    error={meta.touched && meta.error}
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
        <Field name="annenForelder.periode">
            {({ form }) => (
                <PeriodInput
                    intl={intl}
                    periode={form.values.annenForelder?.periode}
                    errorMessageFom={
                        form.touched?.annenForelder?.periode?.fom && form.errors?.annenForelder?.periode?.fom
                    }
                    errorMessageTom={
                        form.touched?.annenForelder?.periode?.tom && form.errors?.annenForelder?.periode?.tom
                    }
                    onBlur={() => {
                        form.setFieldTouched('annenForelder.periode.fom');
                        form.setFieldTouched('annenForelder.periode.tom');
                    }}
                    onChange={(value) => form.setFieldValue('annenForelder.periode', value)}
                />
            )}
        </Field>
    </Panel>
);

export default AnnenForelder;
