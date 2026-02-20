import { useField } from 'formik';
import React from 'react';

import {
    LegacyCheckboxGroup,
    LegacyCheckboxGroupOption,
    LegacyCheckboxGroupProps,
} from 'app/components/legacy-form-compat/checkbox';

interface OwnProps extends Omit<LegacyCheckboxGroupProps, 'checked' | 'defaultChecked' | 'feil'> {
    name: string;
    checkboxes: LegacyCheckboxGroupOption[];
}

// Formik adapter for legacy-compatible checkboxes during migration to Aksel.
const LegacyCheckboxGroupFormik = ({ name, checkboxes, onChange, ...props }: OwnProps) => {
    const [field, meta, helpers] = useField<string[]>({ name });
    return (
        <LegacyCheckboxGroup
            {...props}
            name={name}
            checkboxes={checkboxes}
            checked={Array.isArray(field.value) ? field.value : []}
            feil={meta.error ?? undefined}
            onChange={(event, value, checkedValues) => {
                helpers.setValue(checkedValues);
                onChange?.(event, value, checkedValues);
            }}
        />
    );
};

export default LegacyCheckboxGroupFormik;
