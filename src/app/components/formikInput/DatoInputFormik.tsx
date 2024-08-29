import { FormikValues, useField, useFormikContext } from 'formik';
import { set } from 'lodash';
import React from 'react';
import { DateInputNew } from '../skjema/DateInputNew';

interface OwnProps {
    label: string;
    name: string;
    className?: string;
    handleBlur?: (callback: () => void, values: any) => void;
}

const DatoInputFormik = ({ label, name, handleBlur, ...props }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    const { values } = useFormikContext<FormikValues>();
    return (
        <DateInputNew
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
