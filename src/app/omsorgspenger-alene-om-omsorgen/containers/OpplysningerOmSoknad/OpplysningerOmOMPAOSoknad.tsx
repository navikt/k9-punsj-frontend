import React from 'react';
import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, TextField } from '@navikt/ds-react';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import { IOMPAOSoknad } from 'app/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknad';
import { DateInputNew } from 'app/components/skjema/DateInputNew';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../utils/intlUtils';

import './opplysningerOmOMPAOSoknad.less';

const OpplysningerOmOMPAOSoknad: React.FC = () => {
    const intl = useIntl();
    const { values } = useFormikContext<IOMPAOSoknad>();

    return (
        <div className="mt-4">
            <Box padding="4" borderWidth="1" borderRadius="small">
                <Alert variant="info" className="alert">
                    <FormattedMessage id={`skjema.mottakelsesdato.informasjon`} />
                </Alert>
                <div className="input-row">
                    <Field name="mottattDato">
                        {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                            <DateInputNew
                                id="soknad-dato"
                                label={intlHelper(intl, 'skjema.mottakelsesdato')}
                                errorMessage={meta.touched && meta.error}
                                value={field.value}
                                onChange={(value: string) => form.setFieldValue('mottattDato', value)}
                            />
                        )}
                    </Field>

                    <Field name="klokkeslett">
                        {({ field, meta }: FieldProps<string, FormikValues>) => (
                            <div>
                                <TextField
                                    id="klokkeslett"
                                    type="time"
                                    className="klokkeslett"
                                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                    error={meta.touched && meta.error}
                                    {...field}
                                />
                            </div>
                        )}
                    </Field>
                </div>

                <RadioPanelGruppeFormik
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    name="metadata.signatur"
                    options={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                        label: intlHelper(intl, jn),
                        value: jn,
                    }))}
                />

                {values.metadata.signatur === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id={`skjema.usignert.info`} />
                    </Alert>
                )}
            </Box>
        </div>
    );
};
export default OpplysningerOmOMPAOSoknad;
