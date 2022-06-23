import React from 'react';

import { Checkbox, CheckboxProps } from '@navikt/ds-react';
import { useField } from 'formik';

interface OwnProps extends CheckboxProps {
    name: string;
}

const CheckboxFormik = ({ children, name, type, value, ...props }: OwnProps) => {
    const [field] = useField({ name, type, value });
    return (
        <Checkbox {...props} {...field}>
            {children}
        </Checkbox>
    );
};

export default CheckboxFormik;
