import React from 'react';

import { useField, useFormikContext } from 'formik';
import { Box, ErrorMessage, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboksPanelFormik from 'app/components/formikInput/CheckboksPanelFormik';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import Frilanser from '../components/Frilanser';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { FormattedMessage, useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';

interface Props {
    søknadsperiodeFraSak?: { fom: string; tom: string };
}

const ArbeidsforholdVelger = ({ søknadsperiodeFraSak }: Props) => {
    const intl = useIntl();

    const [field, meta] = useField('metadata.arbeidsforhold');

    const { values } = useFormikContext<IOMPUTSoknad>();

    return (
        <Box padding="4">
            <Heading size="small">
                <FormattedMessage
                    id={`omsorgspenger.utbetaling.arbeidsforhold${values.erKorrigering ? '.erKorrigering' : ''}`}
                />
            </Heading>

            <VerticalSpacer eightPx />

            <CheckboksPanelFormik
                name="metadata.arbeidsforhold.arbeidstaker"
                label={intlHelper(intl, 'omsorgspenger.utbetaling.skjematyper.AT')}
                valueIsBoolean
            />

            <VerticalSpacer eightPx />

            {field.value.arbeidstaker && <ArbeidstakerContainer søknadsperiodeFraSak={søknadsperiodeFraSak} />}

            <CheckboksPanelFormik
                name="metadata.arbeidsforhold.selvstendigNaeringsdrivende"
                label={intlHelper(intl, 'omsorgspenger.utbetaling.selvstendig.tittel')}
                valueIsBoolean
            />

            <VerticalSpacer eightPx />

            {field.value.selvstendigNaeringsdrivende && <SelvstendigNaeringsdrivende />}

            <CheckboksPanelFormik
                name="metadata.arbeidsforhold.frilanser"
                label={intlHelper(intl, 'omsorgspenger.utbetaling.frilanser.tittel')}
                valueIsBoolean
            />

            <VerticalSpacer eightPx />

            {field.value.frilanser && <Frilanser />}

            {meta.touched && !values.erKorrigering && Object.values(field.value).every((v) => !v) && (
                <ErrorMessage>
                    <FormattedMessage id={'omsorgspenger.utbetaling.arbeidsforhold.valgsValidering'} />
                </ErrorMessage>
            )}
        </Box>
    );
};

export default ArbeidsforholdVelger;
