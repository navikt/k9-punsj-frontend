import React from 'react';

import { useField } from 'formik';
import { CheckboksPanel, CheckboksPanelProps } from 'nav-frontend-skjema';

interface OwnProps extends CheckboksPanelProps {
    name: string;
    valueIsBoolean?: boolean;
}

const CheckboksPanelFormik = ({ name, type, value, valueIsBoolean, ...props }: OwnProps) => {
    const [field, meta, helpers] = useField({ name, type, value });

    const booleanToggle = (e: React.ChangeEvent<HTMLInputElement>): void => helpers.setValue(e.target.checked);

    return (
        <CheckboksPanel
            checked={field.value}
            {...field}
            {...props}
            onChange={valueIsBoolean ? booleanToggle : field.onChange}
        />
    );
};

export default CheckboksPanelFormik;
