import React from 'react';
import { useField } from 'formik';
import DateInput, { DateInputProps } from '../skjema/DateInput';

interface OwnProps extends Partial<DateInputProps> {
    label: string;
    name: string;
}

const DatoInputFormik = ({ label, name, ...props }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    return (
        <DateInput
            label={label}
            {...field}
            {...props}
            onChange={(selectedDate: string) => {
                helper.setValue(selectedDate);
            }}
            errorMessage={meta.touched && meta.error}
        />
    );
};

export default DatoInputFormik;
