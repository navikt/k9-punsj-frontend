import { useField } from 'formik';
import React from 'react';

import { Checkbox, CheckboxProps } from '@navikt/ds-react';

interface OwnProps extends CheckboxProps {
    name: string;
}

const CheckboxFormik = ({ children, name, value, ...props }: OwnProps) => {
    const [field] = useField({ name, type: 'checkbox', value });
    return (
        <Checkbox {...props} {...field}>
            {children}
        </Checkbox>
    );
};

export default CheckboxFormik;
