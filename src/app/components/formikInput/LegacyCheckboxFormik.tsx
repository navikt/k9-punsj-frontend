import { useField } from 'formik';
import React from 'react';
import { LegacyCheckbox, LegacyCheckboxProps } from 'app/components/legacy-form-compat/checkbox';

interface OwnProps extends Omit<LegacyCheckboxProps, 'checked'> {
    name: string;
    type?: string;
    value?: string;
    valueIsBoolean?: boolean;
}

const LegacyCheckboxFormik = ({ name, type, value, valueIsBoolean, ...props }: OwnProps) => {
    const [field, , helpers] = useField({ name, type, value });

    const booleanToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
        void helpers.setValue(e.target.checked);
    };

    return (
        <LegacyCheckbox
            checked={!!field.value}
            {...field}
            {...props}
            onChange={valueIsBoolean ? booleanToggle : field.onChange}
        />
    );
};

export default LegacyCheckboxFormik;
