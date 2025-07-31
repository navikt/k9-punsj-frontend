import React from 'react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { set } from 'lodash';
import { DatePickerProps } from '@navikt/ds-react';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';

interface OwnProps extends Omit<DatePickerProps, 'value' | 'onChange' | 'disabled'> {
    label: string;
    name: string;
    hideLabel?: boolean;
    disabled?: boolean;
    handleBlur?: (callback: () => void, values: any) => void;
}

const DatoInputFormikNew = ({ label, name, handleBlur, hideLabel, ...props }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    const { values } = useFormikContext<FormikValues>();
    return (
        <NewDateInput
            label={label}
            hideLabel={hideLabel}
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
                    helper.setTouched(true, true);
                    field.onBlur(selectedDate);
                }
            }}
            errorMessage={meta.touched && meta.error}
        />
    );
};

export default DatoInputFormikNew;
