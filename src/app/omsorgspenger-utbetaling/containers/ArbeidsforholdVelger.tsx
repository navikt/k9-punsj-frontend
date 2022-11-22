import { ErrorMessage, Heading, Panel } from '@navikt/ds-react';
import CheckboksPanelFormik from 'app/components/formikInput/CheckboksPanelFormik';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { useField, useFormikContext } from 'formik';
import React from 'react';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import Frilanser from '../components/Frilanser';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

const ArbeidsforholdVelger = () => {
    const [field, meta] = useField('metadata.arbeidsforhold');
    const { values } = useFormikContext<IOMPUTSoknad>();
    return (
        <Panel border>
            <Heading size="small">{!values.erKorrigering ? 'Arbeidsforhold' : 'Arbeidsforhold - korrigering'}</Heading>
            <VerticalSpacer eightPx />
            <CheckboksPanelFormik name="metadata.arbeidsforhold.arbeidstaker" label="Arbeidstaker" valueIsBoolean />
            <VerticalSpacer eightPx />
            {field.value.arbeidstaker && <ArbeidstakerContainer />}
            <CheckboksPanelFormik
                name="metadata.arbeidsforhold.selvstendigNaeringsdrivende"
                label="Selvstendig næringsdrivende"
                valueIsBoolean
            />
            <VerticalSpacer eightPx />
            {field.value.selvstendigNaeringsdrivende && <SelvstendigNaeringsdrivende />}
            <CheckboksPanelFormik name="metadata.arbeidsforhold.frilanser" label="Frilanser" valueIsBoolean />
            <VerticalSpacer eightPx />
            {field.value.frilanser && <Frilanser />}
            {meta.touched && !values.erKorrigering && Object.values(field.value).every((v) => !v) && (
                <ErrorMessage>Må velge minst ett arbeidsforhold</ErrorMessage>
            )}
        </Panel>
    );
};

export default ArbeidsforholdVelger;
