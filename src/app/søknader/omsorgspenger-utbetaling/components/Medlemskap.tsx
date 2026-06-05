import React, { useEffect } from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { TrashIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import LegacyJaNeiIkkeOpplystRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeOpplystRadioGroupFormik';
import PeriodevelgerFormik from 'app/components/skjema/Datovelger/PeriodevelgerFormik';
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
                        <>
                            {values.bosteder?.map((_, bostedIndex, array) => (
                                <Box
                                    key={bostedIndex}
                                    padding="space-16"
                                    borderRadius="8"
                                    background="neutral-soft"
                                    className={bostedIndex > 0 ? 'mt-4' : undefined}
                                >
                                    <div>
                                        <PeriodevelgerFormik
                                            name={`bosteder[${bostedIndex}].periode`}
                                            action={
                                                array.length > 1 ? (
                                                    <Button
                                                        variant="tertiary"
                                                        className="slett-knapp-med-icon-for-input"
                                                        type="button"
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
                                    </div>
                                </Box>
                            ))}

                            <div className="mt-4 flex flex-wrap">
                                <Button
                                    variant="tertiary"
                                    type="button"
                                    onClick={() => arrayHelpers.push(utenlandsoppholdInitialValue)}
                                    icon={<PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />}
                                >
                                    <FormattedMessage id="omsorgspenger.utbetaling.medlemskap.leggTilPeriode.btn" />
                                </Button>
                            </div>
                        </>
                    )}
                />
            )}
        </Box>
    );
};

export default Medlemskap;
