import React from 'react';
import { FieldValues, useController, useFormContext } from 'react-hook-form';

import { Checkbox, CheckboxGroup } from '@navikt/ds-react';

import { FormCheckboxGroupProps } from './types';

export function FormCheckboxGroup<T extends FieldValues>({
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
}: FormCheckboxGroupProps<T>) {
    const { control } = useFormContext<T>();
    const { field, fieldState } = useController({
        name,
        control,
        rules: validate,
    });

    const checkedValues = Array.isArray(field.value) ? (field.value as string[]) : [];

    return (
        <CheckboxGroup
            legend={legend}
            description={description}
            value={checkedValues}
            error={fieldState.error?.message}
            className={className}
            disabled={disabled}
            size={size}
            hideLegend={hideLegend}
            data-testid={dataTestId}
            onChange={(nextCheckedValues) => {
                field.onChange(nextCheckedValues);
                onChange?.(nextCheckedValues as string[]);
            }}
        >
            {options.map((option) => (
                <Checkbox
                    key={`${field.name}-${option.value}`}
                    value={option.value}
                    disabled={option.disabled || disabled}
                    readOnly={readOnly}
                    description={option.description}
                    onBlur={field.onBlur}
                >
                    {option.label}
                </Checkbox>
            ))}
        </CheckboxGroup>
    );
}
