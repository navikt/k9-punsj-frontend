import React from 'react';
import { useField, useFormikContext } from 'formik';
import { Collapse } from 'react-collapse';
import { ErrorMessage, Heading, Panel } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboksPanelFormik from 'app/components/formikInput/CheckboksPanelFormik';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import Frilanser from '../components/Frilanser';
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
            {meta.touched && Object.values(field.value).every((v) => !v) && (
                <ErrorMessage>Må velge minst ett arbeidsforhold</ErrorMessage>
            )}
        </Panel>
    );
};

export default ArbeidsforholdVelger;
