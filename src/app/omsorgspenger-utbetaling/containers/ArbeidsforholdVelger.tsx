import React from 'react';
import { useField } from 'formik';
import { Collapse, UnmountClosed } from 'react-collapse';
import { CheckboksPanelGruppe } from 'nav-frontend-skjema';
import { CheckboxGroup, Panel } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboksPanelFormik from 'app/components/formikInput/CheckboksPanelFormik';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import Frilanser from './Frilanser';

interface OwnProps {
    handleBlur: () => void;
}

const ArbeidsforholdVelger = ({ handleBlur }: OwnProps) => {
    const [field, meta] = useField('metadata.arbeidsforhold');
    return (
        <Panel border>
            <CheckboxGroup legend="Arbeidsforhold" error={meta.touched && meta.error}>
                <CheckboksPanelFormik name="metadata.arbeidsforhold.arbeidstaker" label="Arbeidstaker" valueIsBoolean />
                <VerticalSpacer eightPx />
                <Collapse isOpened={field.value.arbeidstaker}>
                    <ArbeidstakerContainer />
                </Collapse>
                <CheckboksPanelFormik
                    name="metadata.arbeidsforhold.selvstendigNæringsdrivende"
                    label="Selvstendig næringsdrivende"
                    valueIsBoolean
                />
                <VerticalSpacer eightPx />
                <Collapse isOpened={field.value.selvstendigNæringsdrivende}>
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
