import React from 'react';
import { Field, FieldProps } from 'formik';
import { Box } from '@navikt/ds-react';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import { Periode } from 'app/models/types';
import { IntlShape } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';

interface Props {
    eksisterendePerioder: Periode[];
    intl: IntlShape;
}

const NySøknadEllerKorrigering = ({ eksisterendePerioder, intl }: Props) => {
    if (eksisterendePerioder.length) {
        return (
            <Box padding="4" borderWidth="1" borderRadius="small">
                <Field name="erKorrigering">
                    {({ field, form }: FieldProps<boolean>) => (
                        <RadioPanelGruppeFormik
                            legend={intlHelper(intl, 'skjema.NySoeknadEllerKorrigering.spm')}
                            name={field.name}
                            options={[
                                { value: 'nySoeknad', label: 'Ny søknad' },
                                { value: 'korrigering', label: 'Korrigering' },
                            ]}
                            checked={field.value ? 'korrigering' : 'nySoeknad'}
                            onChange={(e, value) => form.setFieldValue(field.name, value === 'korrigering')}
                        />
                    )}
                </Field>
            </Box>
        );
    }
    return null;
};

export default NySøknadEllerKorrigering;
