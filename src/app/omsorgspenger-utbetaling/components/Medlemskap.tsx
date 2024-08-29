import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { AddCircle, Delete } from '@navikt/ds-icons';
import { Box, Button, Heading, Panel } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import intlHelper from 'app/utils/intlUtils';

import { utenlandsoppholdInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

const options = [
    { value: 'ja', label: 'Ja' },
    { value: 'nei', label: 'Nei' },
    { value: 'ikke opplyst', label: 'Ikke opplyst' },
];

const Medlemskap = () => {
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
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="5">
                Medlemskap
            </Heading>

            <RadioPanelGruppeFormik
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                name="metadata.medlemskap"
                options={options}
            />
            {values.metadata.medlemskap === 'ja' && (
                <FieldArray
                    name="bosteder"
                    render={(arrayHelpers) => (
                        <>
                            {values.bosteder?.map((_, bostedIndex, array) => (
                                <div key={bostedIndex}>
                                    <VerticalSpacer thirtyTwoPx />
                                    <div className="fom-tom-rad">
                                        <DatoInputFormikNew
                                            label="Fra og med"
                                            name={`bosteder[${bostedIndex}].periode.fom`}
                                        />
                                        <DatoInputFormikNew
                                            label="Til og med"
                                            name={`bosteder[${bostedIndex}].periode.tom`}
                                        />
                                        {array.length > 1 && (
                                            <Button
                                                variant="tertiary"
                                                size="small"
                                                onClick={() => arrayHelpers.remove(bostedIndex)}
                                                style={{ float: 'right' }}
                                                icon={<Delete />}
                                            >
                                                Fjern periode
                                            </Button>
                                        )}
                                    </div>
                                    <VerticalSpacer sixteenPx />
                                    <div style={{ maxWidth: '25%' }}>
                                        <Field name={`bosteder[${bostedIndex}].land`}>
                                            {({ field, meta }: FieldProps<string>) => (
                                                <CountrySelect
                                                    label={undefined}
                                                    selectedcountry={field.value}
                                                    unselectedoption="Velg land"
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
                                Legg til periode
                            </Button>
                        </>
                    )}
                />
            )}
        </Box>
    );
};

export default Medlemskap;
