import React from 'react';
import { useField } from 'formik';
import { Collapse } from 'react-collapse';
import { CheckboxGroup, Panel } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboksPanelFormik from 'app/components/formikInput/CheckboksPanelFormik';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import Frilanser from '../components/Frilanser';

const ArbeidsforholdVelger = () => {
    const [field, meta] = useField('metadata.arbeidsforhold');
    return (
        <Panel border>
            <CheckboxGroup
                legend="Arbeidsforhold"
                error={
                    meta.touched && Object.values(field.value).every((v) => !v) && 'Må velge minst ett arbeidsforhold'
                }
            >
                <CheckboksPanelFormik name="metadata.arbeidsforhold.arbeidstaker" label="Arbeidstaker" valueIsBoolean />
                <VerticalSpacer eightPx />
                <Collapse isOpened={field.value.arbeidstaker}>
                    <ArbeidstakerContainer />
                </Collapse>
                <CheckboksPanelFormik
                    name="metadata.arbeidsforhold.selvstendigNaeringsdrivende"
                    label="Selvstendig næringsdrivende"
                    valueIsBoolean
                />
                <VerticalSpacer eightPx />
                <Collapse isOpened={field.value.selvstendigNaeringsdrivende}>
                    <SelvstendigNaeringsdrivende />
                </Collapse>
                <CheckboksPanelFormik name="metadata.arbeidsforhold.frilanser" label="Frilanser" valueIsBoolean />
                <VerticalSpacer eightPx />
                <Collapse isOpened={field.value.frilanser}>
                    <Frilanser />
                </Collapse>
            </CheckboxGroup>
        </Panel>
    );
};

export default ArbeidsforholdVelger;
