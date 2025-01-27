import React from 'react';
import { Controller, useFormContext, ControllerRenderProps, FieldValues, Path } from 'react-hook-form';

interface FormFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>;
    rules?: Record<string, any>;
    errorMessage?: string;
    render: (field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>, error?: string) => React.ReactElement;
}

export const FormField = <TFieldValues extends FieldValues>({
    name,
    rules,
    errorMessage,
    render,
}: FormFieldProps<TFieldValues>): React.ReactElement => {
    const {
        control,
        formState: { errors },
    } = useFormContext<TFieldValues>();
    const error = errors[name];

    return (
        <Controller<TFieldValues>
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => render(field, error ? errorMessage || String(error.message) : undefined)}
        />
    );
};
