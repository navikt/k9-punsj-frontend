import React from 'react';
import { FieldValues, useController, useFormContext } from 'react-hook-form';

import { LegacyCheckboxGroup } from 'app/components/legacy-form-compat/checkbox';

import { FormLegacyCheckboxGroupProps } from './types';

export function FormLegacyCheckboxGroup<T extends FieldValues>({
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
}: FormLegacyCheckboxGroupProps<T>) {
    const { control } = useFormContext<T>();
    const { field, fieldState } = useController({
        name,
        control,
        rules: validate,
    });

    const checkedValues = Array.isArray(field.value) ? (field.value as string[]) : [];
    const checkboxes = options.map((option) => ({
        ...option,
        disabled: option.disabled || disabled,
    }));

    return (
        <LegacyCheckboxGroup
            name={field.name}
            legend={legend}
            description={description}
            checkboxes={checkboxes}
            checked={checkedValues}
            className={className}
            feil={fieldState.error?.message}
            disabled={disabled}
            readOnly={readOnly}
            size={size}
            hideLegend={hideLegend}
            data-testid={dataTestId}
            onBlur={field.onBlur}
            onChange={(event, value, nextCheckedValues) => {
                field.onChange(nextCheckedValues);
                onChange?.(event, value, nextCheckedValues);
            }}
        />
    );
}
