import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { Radio, RadioGroup, HStack } from '@navikt/ds-react';
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
                    {layout === 'horizontal' ? (
                        <HStack gap="4" align="start" wrap={false}>
                            {options.map((option) => (
                                <Radio key={String(option.value)} value={option.value}>
                                    {option.label}
                                </Radio>
                            ))}
                        </HStack>
                    ) : (
                        options.map((option) => (
                            <Radio key={String(option.value)} value={option.value}>
                                {option.label}
                            </Radio>
                        ))
                    )}
                </RadioGroup>
            )}
        />
    );
}
