import React from 'react';

import { Field, FieldProps } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Heading, TextField } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
import { KorrigeringAvInntektsmeldingFormFields } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

import './opplysningerOmKorrigering.less';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();

    return (
        <>
            <Heading level={'3'} size="small">
                <FormattedMessage id={'skjema.opplysningeromkorrigering'} />
            </Heading>

            <Box padding="4" borderWidth="1" borderRadius="small" className="listepanel opplysningerOmKorrigering">
                <Heading level={'4'} size="xsmall" className="opplysningerOmKorrigering__subHeading">
                    <FormattedMessage id={'skjema.opplysningeromkorrigering.spm'} />
                </Heading>

                <div className="input-row">
                    <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`}>
                        {({ field }: FieldProps) => (
                            <DatoInputFormikNew {...field} label={intlHelper(intl, 'skjema.dato')} />
                        )}
                    </Field>
                    <div>
                        <Field name={`${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.klokkeslett`}>
                            {({ field }: FieldProps) => (
                                <TextField
                                    {...field}
                                    type="time"
                                    className="klokkeslett"
                                    label={intlHelper(intl, 'skjema.mottatt.tidspunkt')}
                                />
                            )}
                        </Field>
                    </div>
                </div>
            </Box>
        </>
    );
};

export default OpplysningerOmKorrigering;
