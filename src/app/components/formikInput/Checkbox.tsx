import React from 'react';

import { Checkbox as NavCheckbox, CheckboxProps } from '@navikt/ds-react';
import { Field, useField } from 'formik';

interface OwnProps extends CheckboxProps {
    name: string;
}

const Checkbox = ({ children, name }: OwnProps) => {
    const [field, meta] = useField(name);

    return <NavCheckbox {...field}>{children}</NavCheckbox>;
};

export default Checkbox;
