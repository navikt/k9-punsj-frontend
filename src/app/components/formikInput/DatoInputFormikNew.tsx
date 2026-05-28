import React from 'react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { cloneDeep, set } from 'lodash';
import { DatePickerProps } from '@navikt/ds-react';
import DatovelgerControlled from 'app/components/skjema/Datovelger/DatovelgerControlled';

interface OwnProps extends Omit<DatePickerProps, 'value' | 'onChange' | 'disabled'> {
    label: string;
    name: string;
    hideLabel?: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium';
    error?: React.ReactNode | string;
    handleBlur?: (callback: () => void, values: any) => void;
}

const DatoInputFormikNew = ({ label, name, size, handleBlur, hideLabel, error, ...props }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    const { values } = useFormikContext<FormikValues>();
    return (
        <DatovelgerControlled
            label={label}
            hideLabel={hideLabel}
            value={field.value || ''}
            {...props}
            onChange={(selectedDate: string) => {
                helper.setValue(selectedDate);
                helper.setTouched(true, true);
            }}
            onBlur={(selectedDate: string) => {
                if (handleBlur) {
                    handleBlur(() => helper.setTouched(true, true), set(cloneDeep(values), name, selectedDate));
                } else {
                    helper.setValue(selectedDate);
                    helper.setTouched(true, true);
                    field.onBlur(selectedDate);
                }
            }}
            errorMessage={(meta.touched && meta.error) || error}
            size={size}
        />
    );
};

export default DatoInputFormikNew;
