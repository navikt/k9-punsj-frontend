import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { FormRadioGroupProps } from './types';

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
            render={({ field }) => (
                <RadioGroup
                    {...field}
                    legend={legend}
                    className={className}
                    data-testid={dataTestId}
                    error={errors[name]?.message as string}
                    disabled={disabled}
                    readOnly={readOnly}
                    size={size}
                    description={description}
                >
                    <div className={layout === 'horizontal' ? 'flex items-center' : ''}>
                        {options.map((option, index) => (
                            <Radio
                                key={String(option.value)}
                                value={option.value}
                                className={layout === 'horizontal' && index > 0 ? `ml-${horizontalSpacing}` : ''}
                            >
                                {option.label}
                            </Radio>
                        ))}
                    </div>
                </RadioGroup>
            )}
        />
    );
}
