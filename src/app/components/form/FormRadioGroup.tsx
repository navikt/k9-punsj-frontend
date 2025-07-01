import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { FormRadioGroupProps } from './types';

// Helper for deeply nested properties
const get = (obj: any, path: string) =>
    path
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split('.')
        .reduce((acc, part) => acc && acc[part], obj);

export function FormRadioGroup<T extends FieldValues>({
    name,
    legend,
    options,
    validate,
    className,
    disabled,
    readOnly,
    size,
    description,
    layout = 'vertical',
    horizontalSpacing = 4,
    'data-testid': dataTestId,
}: FormRadioGroupProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    const rules = {
        ...(validate || {}),
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field }) => {
                const error = get(errors, name);
                return (
                    <RadioGroup
                        {...field}
                        legend={legend}
                        className={className}
                        data-testid={dataTestId}
                        error={error?.message as string}
                        disabled={disabled}
                        readOnly={readOnly}
                        size={size}
                        description={description}
                    >
                        <div
                            className={layout === 'horizontal' ? 'flex items-center' : ''}
                            style={layout === 'horizontal' ? { gap: `${horizontalSpacing}rem` } : undefined}
                        >
                            {options.map((option) => (
                                <Radio key={String(option.value)} value={option.value}>
                                    {option.label}
                                </Radio>
                            ))}
                        </div>
                    </RadioGroup>
                );
            }}
        />
    );
}
