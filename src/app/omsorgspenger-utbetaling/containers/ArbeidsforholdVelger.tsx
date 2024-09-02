import React from 'react';
import { useField, useFormikContext } from 'formik';
import { Box, ErrorMessage, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboksPanelFormik from 'app/components/formikInput/CheckboksPanelFormik';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import Frilanser from '../components/Frilanser';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

interface Props {
    søknadsperiodeFraSak?: { fom: string; tom: string };
}

const ArbeidsforholdVelger = ({ søknadsperiodeFraSak }: Props) => {
    const [field, meta] = useField('metadata.arbeidsforhold');
    const { values } = useFormikContext<IOMPUTSoknad>();
    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small">{!values.erKorrigering ? 'Arbeidsforhold' : 'Arbeidsforhold - korrigering'}</Heading>
            <VerticalSpacer eightPx />
            <CheckboksPanelFormik name="metadata.arbeidsforhold.arbeidstaker" label="Arbeidstaker" valueIsBoolean />
            <VerticalSpacer eightPx />
            {field.value.arbeidstaker && <ArbeidstakerContainer søknadsperiodeFraSak={søknadsperiodeFraSak} />}
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
        </Box>
    );
};

export default ArbeidsforholdVelger;
