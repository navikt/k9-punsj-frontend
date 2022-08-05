import { AddCircle, Delete } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { Collapse } from 'react-collapse';
import { useIntl } from 'react-intl';
import { utenlandsoppholdInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

const options = [
    { value: 'ja', label: 'Ja' },
    { value: 'nei', label: 'Nei' },
    { value: 'ikke opplyst', label: 'Ikke opplyst' },
];

const Medlemsskap = () => {
    const intl = useIntl();
    const { values, setFieldValue } = useFormikContext<IOMPUTSoknad>();

    useEffect(() => {
        if (values.bosteder.length && values.metadata.medlemsskap !== 'ja') {
            setFieldValue('bosteder', []);
        }
        if (!values.bosteder.length && values.metadata.medlemsskap === 'ja') {
            setFieldValue('bosteder', [utenlandsoppholdInitialValue]);
        }
    }, [values.metadata.medlemsskap]);

    return (
        <Panel border>
            <Heading size="small" level="5">
                Medlemsskap
            </Heading>
            <RadioPanelGruppeFormik
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                name="metadata.medlemsskap"
                options={options}
            />
            <Collapse isOpened={values.metadata.medlemsskap === 'ja'}>
                <FieldArray
                    name="bosteder"
                    render={(arrayHelpers) => (
                        <>
                            {values.bosteder?.map((_, bostedIndex, array) => (
                                <div>
                                    <VerticalSpacer thirtyTwoPx />
                                    <div className="fom-tom-rad">
                                        <DatoInputFormik
                                            label="Fra og med"
                                            name={`bosteder[${bostedIndex}].periode.fom`}
                                        />
                                        <DatoInputFormik
                                            label="Til og med"
                                            name={`bosteder[${bostedIndex}].periode.tom`}
                                        />
                                        {array.length > 1 && (
                                            <Button
                                                variant="tertiary"
                                                size="small"
                                                onClick={() => arrayHelpers.remove(bostedIndex)}
                                                style={{ float: 'right' }}
                                            >
                                                <Delete />
                                                Fjern periode
                                            </Button>
                                        )}
                                    </div>
                                    <VerticalSpacer sixteenPx />
                                    <div style={{ maxWidth: '25%' }}>
                                        <Field name={`bosteder[${bostedIndex}].land`}>
                                            {({ field }: FieldProps<string>) => (
                                                <CountrySelect
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
                            >
                                <AddCircle />
                                Legg til periode
                            </Button>
                        </>
                    )}
                />
            </Collapse>
        </Panel>
    );
};

export default Medlemsskap;
