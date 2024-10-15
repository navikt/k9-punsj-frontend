import { Field, FieldProps } from 'formik';
import React from 'react';

import { Panel } from '@navikt/ds-react';

import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import { Periode } from 'app/models/types';

interface OwnProps {
    eksisterendePerioder: Periode[];
}

export default function NySoeknadEllerKorrigering({ eksisterendePerioder }: OwnProps) {
    if (eksisterendePerioder.length) {
        return (
            <Panel border>
                <Field name="erKorrigering">
                    {({ field, form }: FieldProps<boolean>) => (
                        <RadioPanelGruppeFormik
                            legend="Er dette en ny søknad eller en korrigering?"
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
            </Panel>
        );
    }
    return null;
}
