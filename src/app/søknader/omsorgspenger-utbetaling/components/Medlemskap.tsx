import React, { useEffect } from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { TrashIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading, VStack } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import LegacyJaNeiIkkeOpplystRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeOpplystRadioGroupFormik';
import PeriodevelgerFormik from 'app/components/period-input/PeriodevelgerFormik';
import intlHelper from 'app/utils/intlUtils';
import { utenlandsoppholdInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';

const Medlemskap: React.FC = () => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<IOMPUTSoknad>();

    useEffect(() => {
        if (values.bosteder.length && values.metadata.medlemskap !== 'ja') {
            setFieldValue('bosteder', []);
        }

        if (!values.bosteder.length && values.metadata.medlemskap === 'ja') {
            setFieldValue('bosteder', [utenlandsoppholdInitialValue]);
        }
    }, [values.metadata.medlemskap]);

    return (
        <Box padding="space-16" borderWidth="1" borderRadius="8">
            <Heading size="small" level="5">
                <FormattedMessage id="omsorgspenger.utbetaling.medlemskap.tittel" />
            </Heading>
            <VerticalSpacer twentyPx />
            <LegacyJaNeiIkkeOpplystRadioGroupFormik
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                name="metadata.medlemskap"
            />
            <VerticalSpacer twentyPx />
            {values.metadata.medlemskap === JaNeiIkkeOpplyst.JA && (
                <FieldArray
                    name="bosteder"
                    render={(arrayHelpers) => (
                        <VStack gap="space-16">
                            {values.bosteder?.map((_, bostedIndex, array) => (
                                <Box key={bostedIndex} padding="space-16" borderRadius="8" background="neutral-soft">
                                    <PeriodevelgerFormik
                                        name={`bosteder[${bostedIndex}].periode`}
                                        action={
                                            array.length > 1 ? (
                                                <Button
                                                    variant="tertiary"
                                                    className="slett-knapp-med-icon-for-input"
                                                    onClick={() => arrayHelpers.remove(bostedIndex)}
                                                    icon={<TrashIcon title="slett periode" />}
                                                >
                                                    <FormattedMessage id="omsorgspenger.utbetaling.medlemskap.fjernPeriode.btn" />
                                                </Button>
                                            ) : undefined
                                        }
                                    />

                                    <VerticalSpacer sixteenPx />

                                    <div style={{ maxWidth: '25%' }}>
                                        <Field name={`bosteder[${bostedIndex}].land`}>
                                            {({ field }: FieldProps<string>) => (
                                                <CountrySelect
                                                    label
                                                    selectedcountry={field.value}
                                                    unselectedoption={intlHelper(
                                                        intl,
                                                        'omsorgspenger.utbetaling.medlemskap.unselectedoption',
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
                                icon={<PlusCircleIcon />}
                            >
                                <FormattedMessage id="omsorgspenger.utbetaling.medlemskap.leggTilPeriode.btn" />
                            </Button>
                        </VStack>
                    )}
                />
            )}
        </Box>
    );
};

export default Medlemskap;
