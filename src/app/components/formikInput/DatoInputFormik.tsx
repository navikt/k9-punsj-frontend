import React from 'react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { set } from 'lodash';
import DateInput, { DateInputProps } from '../skjema/DateInput';

interface OwnProps extends Omit<DateInputProps, 'value' | 'onChange'> {
    label: string;
    name: string;
    handleBlur?: (callback: () => void, values: any) => void;
}

const DatoInputFormik = ({ label, name, handleBlur, ...props }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    const { values } = useFormikContext<FormikValues>();
    return (
        <DateInput
            label={label}
            {...field}
            {...props}
            onChange={(selectedDate: string) => {
                helper.setValue(selectedDate);
                helper.setTouched(true, true);
            }}
            onBlur={(selectedDate) => {
                if (handleBlur) {
                    handleBlur(() => helper.setTouched(true, true), set({ ...values }, name, selectedDate));
                } else {
                    helper.setValue(selectedDate);
                    field.onBlur(selectedDate);
                }
            }}
            errorMessage={meta.touched && meta.error}
        />
    );
};

export default DatoInputFormik;
