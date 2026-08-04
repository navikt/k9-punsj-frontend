import React from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Box, Button, ErrorMessage, VStack } from '@navikt/ds-react';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import { LegacyJaNeiIkkeOpplystRadioGroup } from 'app/components/legacy-form-compat/radio';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { IUtenlandsOpphold, Periode, UtenlandsOpphold } from 'app/models/types';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import intlHelper from 'app/utils/intlUtils';
import PeriodevelgerFormik from 'app/components/period-input/PeriodevelgerFormik';

const initialUtenlandsopphold: IUtenlandsOpphold = new UtenlandsOpphold({
    land: '',
    periode: new Periode({ fom: '', tom: '' }),
});

const Bosteder: React.FC = () => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<OLPSoknad>();

    return (
        <Box padding="space-16" borderRadius="8">
            <LegacyJaNeiIkkeOpplystRadioGroup
                className="horizontalRadios"
                name="metadata.harBoddIUtlandet"
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                onChange={(_, value) => {
                    setFieldValue('metadata.harBoddIUtlandet', value);

                    if (value === JaNeiIkkeOpplyst.JA && values.bosteder.length === 0) {
                        setFieldValue('bosteder', [initialUtenlandsopphold]);
                    }

                    if (value !== JaNeiIkkeOpplyst.JA) {
                        setFieldValue('bosteder', []);
                    }
                }}
                checked={values.metadata.harBoddIUtlandet}
            />
            {values.metadata.harBoddIUtlandet === JaNeiIkkeOpplyst.JA && (
                <div className="mt-4">
                    <FieldArray
                        name="bosteder"
                        render={(arrayHelpers) => (
                            <VStack gap="space-16">
                                {values.bosteder?.map((_, index, array) => (
                                    <Box key={index} padding="space-16" borderRadius="8" background="neutral-soft">
                                        <div className="fom-tom-rad">
                                            <PeriodevelgerFormik
                                                name={`bosteder[${index}].periode`}
                                                size="small"
                                                action={
                                                    array.length > 1 ? (
                                                        <Button
                                                            variant="tertiary"
                                                            size="small"
                                                            className="slett-knapp-med-icon-for-input"
                                                            onClick={() => arrayHelpers.remove(index)}
                                                            icon={<TrashIcon title="slett periode" />}
                                                            data-color="danger"
                                                        >
                                                            Fjern periode
                                                        </Button>
                                                    ) : undefined
                                                }
                                            />
                                        </div>

                                        <div style={{ maxWidth: '50%' }}>
                                            <Field name={`bosteder[${index}].land`}>
                                                {({ field, meta: bostederMeta }: FieldProps<string>) => (
                                                    <>
                                                        <CountrySelect
                                                            label
                                                            size="small"
                                                            selectedcountry={field.value}
                                                            unselectedoption="Velg land"
                                                            {...field}
                                                        />
                                                        {bostederMeta.touched && bostederMeta.error && (
                                                            <ErrorMessage role="alert" showIcon>
                                                                {bostederMeta.error}
                                                            </ErrorMessage>
                                                        )}
                                                    </>
                                                )}
                                            </Field>
                                        </div>
                                    </Box>
                                ))}

                                <div className="flex flex-wrap">
                                    <Button
                                        variant="tertiary"
                                        size="small"
                                        onClick={() => arrayHelpers.push(initialUtenlandsopphold)}
                                        icon={<PlusCircleIcon title="legg til periode" />}
                                    >
                                        Legg til ny periode
                                    </Button>
                                </div>
                            </VStack>
                        )}
                    />
                </div>
            )}
        </Box>
    );
};

export default Bosteder;
