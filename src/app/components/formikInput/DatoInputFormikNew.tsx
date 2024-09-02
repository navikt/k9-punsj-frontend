import React from 'react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { set } from 'lodash';

import { DateInputNew } from '../skjema/DateInputNew';
import { DatePickerProps } from '@navikt/ds-react';

interface OwnProps extends Omit<DatePickerProps, 'value' | 'onChange' | 'disabled'> {
    label: string;
    name: string;
    disabled?: boolean;
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
            onBlur={(selectedDate: string) => {
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
