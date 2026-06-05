import React from 'react';

import { Field, FieldProps, FormikValues } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';

import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
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
            <Heading size="medium" level="2">
                <FormattedMessage id="omsorgspenger.midlertidigAlene.punchForm.tittel" />
            </Heading>
            <VerticalSpacer sixteenPx />
            <Box padding="space-16" borderWidth="1" borderRadius="8" className="opplysninger-om-soknaden-panel">
                <VStack gap="space-16">
                    <Heading size="small" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </Heading>

                    <Alert size="small" variant="info">
                        <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                    </Alert>

                    <div className="input-row">
                        <DatovelgerFormik
                            id="soknad-dato"
                            label={intlHelper(intl, 'skjema.mottakelsesdato')}
                            handleBlur={handleBlur}
                            name="mottattDato"
                            size="small"
                        />

                        <div>
                            <Field name="klokkeslett">
                                {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                                    <TextField
                                        id="klokkeslett"
                                        type="time"
                                        className="ml-4"
                                        size="small"
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
                            <FormattedMessage id="skjema.usignert.info" />
                        </Alert>
                    )}
                </VStack>
            </Box>
        </>
    );
};

export default OpplysningerOmOMPMASoknad;
