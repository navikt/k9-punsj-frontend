import React from 'react';

import { Field, FieldProps, FormikValues } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';

import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../utils/intlUtils';

interface Props {
    signert: JaNeiIkkeRelevant | null;

    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    handleBlur: (e: any) => void;
}

const OpplysningerOmOMPMASoknad: React.FC<Props> = ({ signert, setSignaturAction, handleBlur }) => {
    const intl = useIntl();

    return (
        <>
            <Heading size="small">
                <FormattedMessage id={'omsorgspenger.midlertidigAlene.punchForm.tittel'} />
            </Heading>

            <VerticalSpacer sixteenPx />

            <Box padding="4" borderWidth="1" borderRadius="small">
                <Alert variant="info" className="mt-4">
                    <FormattedMessage id={'skjema.mottakelsesdato.informasjon'} />
                </Alert>

                <div className="input-row">
                    <Field name="mottattDato">
                        {({ field }: FieldProps<string, FormikValues>) => (
                            <DatoInputFormikNew
                                id="soknad-dato"
                                label={intlHelper(intl, 'skjema.mottakelsesdato')}
                                handleBlur={handleBlur}
                                {...field}
                            />
                        )}
                    </Field>

                    <div>
                        <Field name="klokkeslett">
                            {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                                <TextField
                                    id="klokkeslett"
                                    type="time"
                                    className="ml-4"
                                    // size="small"
                                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                    error={meta.touched && meta.error}
                                    {...field}
                                    onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                                    onBlur={(e) => handleBlur(() => field.onBlur(e))}
                                />
                            )}
                        </Field>
                    </div>
                </div>

                <LegacyJaNeiIkkeRelevantRadioGroup
                    className="horizontalRadios"
                    name="signatur"
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    checked={signert || undefined}
                    onChange={(_, value) => setSignaturAction(value || null)}
                />

                {signert === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id={'skjema.usignert.info'} />
                    </Alert>
                )}
            </Box>
        </>
    );
};

export default OpplysningerOmOMPMASoknad;
