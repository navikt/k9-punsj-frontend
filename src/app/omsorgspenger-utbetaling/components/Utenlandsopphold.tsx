import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { AddCircle, Delete } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import intlHelper from 'app/utils/intlUtils';

import { utenlandsoppholdInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

const options = [
    { value: 'ja', label: 'Ja' },
    { value: 'nei', label: 'Nei' },
    { value: 'ikke opplyst', label: 'Ikke opplyst' },
];

const Utenlandsopphold = () => {
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
        <Panel border>
            <Heading size="small" level="5">
                Utenlandsopphold
            </Heading>
            <RadioPanelGruppeFormik
                legend={intlHelper(intl, 'skjema.utenlandsopphold.label')}
                name="metadata.utenlandsopphold"
                options={options}
            />
            {values.metadata.utenlandsopphold === 'ja' && (
                <FieldArray
                    name="utenlandsopphold"
                    render={(arrayHelpers) => (
                        <>
                            {values.utenlandsopphold?.map((_, index, array) => (
                                <div key={index}>
                                    <VerticalSpacer thirtyTwoPx />
                                    <div className="fom-tom-rad">
                                        <DatoInputFormik
                                            label="Fra og med"
                                            name={`utenlandsopphold[${index}].periode.fom`}
                                        />
                                        <DatoInputFormik
                                            label="Til og med"
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
                                                Fjern periode
                                            </Button>
                                        )}
                                    </div>
                                    <VerticalSpacer sixteenPx />
                                    <div style={{ maxWidth: '25%' }}>
                                        <Field name={`utenlandsopphold[${index}].land`}>
                                            {({ field, meta }: FieldProps<string>) => (
                                                <CountrySelect
                                                    selectedcountry={field.value}
                                                    unselectedoption="Velg land"
                                                    feil={meta.touched && meta.error}
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
        </Panel>
    );
};

export default Utenlandsopphold;
