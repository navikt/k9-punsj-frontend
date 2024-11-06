import React from 'react';

import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps } from 'formik';
import { Box } from '@navikt/ds-react';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import { Periode } from 'app/models/types';
import { useIntl } from 'react-intl';

enum SøknadsType {
    NY = 'nySoeknad',
    KORRIGERING = 'korrigering',
}

interface Props {
    eksisterendePerioder: Periode[];
}

const NySoeknadEllerKorrigering: React.FC<Props> = ({ eksisterendePerioder }: Props) => {
    const intl = useIntl();

    if (eksisterendePerioder.length) {
        return (
            <Box padding="4" borderWidth="1" borderRadius="small">
                <Field name="erKorrigering">
                    {({ field, form }: FieldProps<boolean>) => (
                        <RadioPanelGruppeFormik
                            legend={intlHelper(intl, 'omsorgspenger.utbetaling.nySoeknadEllerKorrigering.spm')}
                            name={field.name}
                            options={[
                                {
                                    value: SøknadsType.NY,
                                    label: intlHelper(
                                        intl,
                                        'omsorgspenger.utbetaling.nySoeknadEllerKorrigering.optionsLabel.nySøknad',
                                    ),
                                },
                                {
                                    value: SøknadsType.KORRIGERING,
                                    label: intlHelper(
                                        intl,
                                        'omsorgspenger.utbetaling.nySoeknadEllerKorrigering.optionsLabel.korrigering',
                                    ),
                                },
                            ]}
                            checked={field.value ? SøknadsType.KORRIGERING : SøknadsType.NY}
                            onChange={(e, value) => form.setFieldValue(field.name, value === SøknadsType.KORRIGERING)}
                        />
                    )}
                </Field>
            </Box>
        );
    }

    return null;
};

export default NySoeknadEllerKorrigering;
