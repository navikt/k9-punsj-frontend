import React from 'react';
import { RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import { useField } from 'formik';
import RadioFormik from './RadioFormik';

interface OwnProps extends Omit<RadioGroupProps, 'children'> {
    name: string;
    options: { label: string; value: string }[];
}

const RadioGroupFormik = ({ name, options, legend, ...props }: OwnProps) => {
    const [field, meta] = useField(name);
    return (
        <RadioGroup legend={legend} error={meta.touched && meta.error} {...field} {...props}>
            {options.map((option) => (
                <RadioFormik name={field.name} value={option.value}>
                    {option.label}
                </RadioFormik>
            ))}
        </RadioGroup>
    );
};

export default RadioGroupFormik;
