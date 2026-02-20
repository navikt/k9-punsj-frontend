import React from 'react';
import { FieldValues, useController, useFormContext } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

import { FormRadioGroupProps } from './types';

export function FormRadioGroup<T extends FieldValues>({
    name,
    legend,
    options,
    description,
    validate,
    className,
    disabled,
    readOnly,
    size,
    hideLegend,
    'data-testid': dataTestId,
    onChange,
}: FormRadioGroupProps<T>) {
    const { control } = useFormContext<T>();
    const { field, fieldState } = useController({
        name,
        control,
        rules: validate,
    });

    const selectedValue = typeof field.value === 'string' ? field.value : '';

    return (
        <RadioGroup
            name={field.name}
            legend={legend}
            description={description}
            value={selectedValue}
            error={fieldState.error?.message}
            className={className}
            disabled={disabled}
            size={size}
            hideLegend={hideLegend}
            data-testid={dataTestId}
            onChange={(value) => {
                field.onChange(value);
                onChange?.(value);
            }}
        >
            {options.map((option) => (
                <Radio
                    key={`${field.name}-${option.value}`}
                    value={option.value}
                    disabled={option.disabled || disabled}
                    readOnly={readOnly}
                    onBlur={field.onBlur}
                >
                    {option.label}
                </Radio>
            ))}
        </RadioGroup>
    );
}
