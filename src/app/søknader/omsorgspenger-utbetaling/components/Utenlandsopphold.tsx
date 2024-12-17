import React, { useEffect } from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { AddCircle, Delete } from '@navikt/ds-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import intlHelper from 'app/utils/intlUtils';
import { utenlandsoppholdInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

const Utenlandsopphold: React.FC = () => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<IOMPUTSoknad>();

    const options = [
        { value: JaNeiIkkeOpplyst.JA, label: intlHelper(intl, 'ja') },
        { value: JaNeiIkkeOpplyst.NEI, label: intlHelper(intl, 'nei') },
        { value: JaNeiIkkeOpplyst.IKKE_OPPLYST, label: intlHelper(intl, 'ikkeOpplyst') },
    ];

    useEffect(() => {
        if (values.utenlandsopphold.length && values.metadata.utenlandsopphold !== 'ja') {
            setFieldValue('utenlandsopphold', []);
        }
        if (!values.utenlandsopphold.length && values.metadata.utenlandsopphold === 'ja') {
            setFieldValue('utenlandsopphold', [utenlandsoppholdInitialValue]);
        }
    }, [values.metadata.utenlandsopphold]);

    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="5">
                <FormattedMessage id="omsorgspenger.utbetaling.utenlandsopphold.tittel" />
            </Heading>

            <Box padding="4">
                <RadioPanelGruppeFormik
                    legend={intlHelper(intl, 'skjema.utenlandsopphold.label')}
                    name="metadata.utenlandsopphold"
                    options={options}
                />

                {values.metadata.utenlandsopphold === JaNeiIkkeOpplyst.JA && (
                    <FieldArray
                        name="utenlandsopphold"
                        render={(arrayHelpers) => (
                            <>
                                {values.utenlandsopphold?.map((_, index, array) => (
                                    <div key={index}>
                                        <VerticalSpacer thirtyTwoPx />

                                        <div className="fom-tom-rad">
                                            <DatoInputFormikNew
                                                label={intlHelper(
                                                    intl,
                                                    'omsorgspenger.utbetaling.utenlandsopphold.fom',
                                                )}
                                                name={`utenlandsopphold[${index}].periode.fom`}
                                            />

                                            <DatoInputFormikNew
                                                label={intlHelper(
                                                    intl,
                                                    'omsorgspenger.utbetaling.utenlandsopphold.tom',
                                                )}
                                                name={`utenlandsopphold[${index}].periode.tom`}
                                            />

                                            {array.length > 1 && (
                                                <Button
                                                    variant="tertiary"
                                                    size="small"
                                                    onClick={() => arrayHelpers.remove(index)}
                                                    style={{ float: 'right' }}
                                                    icon={<Delete />}
                                                >
                                                    <FormattedMessage id="omsorgspenger.utbetaling.utenlandsopphold.fjernPeriode.btn" />
                                                </Button>
                                            )}
                                        </div>

                                        <VerticalSpacer sixteenPx />

                                        <div style={{ maxWidth: '25%' }}>
                                            <Field name={`utenlandsopphold[${index}].land`}>
                                                {({ field }: FieldProps<string>) => (
                                                    <CountrySelect
                                                        label
                                                        selectedcountry={field.value}
                                                        unselectedoption={intlHelper(
                                                            intl,
                                                            'omsorgspenger.utbetaling.utenlandsopphold.unselectedoption',
                                                        )}
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                    </div>
                                ))}

                                <VerticalSpacer sixteenPx />

                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={() => arrayHelpers.push(utenlandsoppholdInitialValue)}
                                    icon={<AddCircle />}
                                >
                                    <FormattedMessage id="omsorgspenger.utbetaling.utenlandsopphold.leggTilPeriode.btn" />
                                </Button>
                            </>
                        )}
                    />
                )}
            </Box>
        </Box>
    );
};

export default Utenlandsopphold;
