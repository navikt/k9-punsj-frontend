import React, { useEffect } from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { TrashIcon, PersonPlusIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading, VStack } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import LegacyJaNeiIkkeOpplystRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeOpplystRadioGroupFormik';
import PeriodevelgerFormik from 'app/components/period-input/PeriodevelgerFormik';
import intlHelper from 'app/utils/intlUtils';
import { utenlandsoppholdInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';

const Utenlandsopphold: React.FC = () => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<IOMPUTSoknad>();

    useEffect(() => {
        if (values.utenlandsopphold.length && values.metadata.utenlandsopphold !== 'ja') {
            setFieldValue('utenlandsopphold', []);
        }
        if (!values.utenlandsopphold.length && values.metadata.utenlandsopphold === 'ja') {
            setFieldValue('utenlandsopphold', [utenlandsoppholdInitialValue]);
        }
    }, [values.metadata.utenlandsopphold]);

    return (
        <Box padding="space-16" borderWidth="1" borderRadius="8">
            <Heading size="small" level="5">
                <FormattedMessage id="omsorgspenger.utbetaling.utenlandsopphold.tittel" />
            </Heading>
            <VerticalSpacer twentyPx />
            <LegacyJaNeiIkkeOpplystRadioGroupFormik
                legend={intlHelper(intl, 'skjema.utenlandsopphold.label')}
                name="metadata.utenlandsopphold"
            />
            <VerticalSpacer twentyPx />
            {values.metadata.utenlandsopphold === JaNeiIkkeOpplyst.JA && (
                <FieldArray
                    name="utenlandsopphold"
                    render={(arrayHelpers) => (
                        <VStack gap="space-16">
                            {values.utenlandsopphold?.map((_, index, array) => (
                                <Box key={index} padding="space-16" borderRadius="8" background="neutral-soft">
                                    <PeriodevelgerFormik
                                        name={`utenlandsopphold[${index}].periode`}
                                        action={
                                            array.length > 1 ? (
                                                <Button
                                                    variant="tertiary"
                                                    onClick={() => arrayHelpers.remove(index)}
                                                    className="slett-knapp-med-icon-for-input"
                                                    icon={<TrashIcon title="slett periode" />}
                                                    data-color="danger"
                                                >
                                                    <FormattedMessage id="skjema.perioder.fjern" />
                                                </Button>
                                            ) : undefined
                                        }
                                    />

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
                                </Box>
                            ))}

                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => arrayHelpers.push(utenlandsoppholdInitialValue)}
                                icon={<PersonPlusIcon title="legg til utenlandsopphold" />}
                            >
                                <FormattedMessage id="omsorgspenger.utbetaling.utenlandsopphold.leggTilPeriode.btn" />
                            </Button>
                        </VStack>
                    )}
                />
            )}
        </Box>
    );
};

export default Utenlandsopphold;
