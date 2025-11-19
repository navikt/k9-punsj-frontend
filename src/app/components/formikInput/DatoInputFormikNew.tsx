import React from 'react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { set } from 'lodash';
import { DatePickerProps } from '@navikt/ds-react';
import Datovelger from 'app/components/skjema/Datovelger/Datovelger';

interface OwnProps extends Omit<DatePickerProps, 'value' | 'onChange' | 'disabled'> {
    label: string;
    name: string;
    hideLabel?: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium';
    handleBlur?: (callback: () => void, values: any) => void;
}

const DatoInputFormikNew = ({ label, name, size, handleBlur, hideLabel, ...props }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    const { values } = useFormikContext<FormikValues>();
    return (
        <Datovelger
            label={label}
            hideLabel={hideLabel}
            value={field.value}
            selectedDay={field.value}
            {...props}
            onChange={(selectedDate: string) => {
                helper.setValue(selectedDate);
                helper.setTouched(true, true);
            }}
            onBlur={() => {
                if (handleBlur) {
                    handleBlur(() => helper.setTouched(true, true), set({ ...values }, name, field.value));
                } else {
                    helper.setTouched(true, true);
                }
            }}
            errorMessage={meta.touched && meta.error}
            size={size}
        />
    );
};

export default DatoInputFormikNew;
