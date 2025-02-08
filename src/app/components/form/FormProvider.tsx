import React from 'react';
import { FieldValues, FormProvider, UseFormProps, UseFormReturn, useForm } from 'react-hook-form';

export interface PunsjFormProviderProps<TFieldValues extends FieldValues> {
    children: ((methods: UseFormReturn<TFieldValues>) => React.ReactNode) | React.ReactNode;
    formProps?: UseFormProps<TFieldValues>;
    form?: UseFormReturn<TFieldValues>;
    onSubmit?: (data: TFieldValues) => void;
}

export function PunsjFormProvider<TFieldValues extends FieldValues>({
    children,
    formProps,
    form,
    onSubmit,
}: PunsjFormProviderProps<TFieldValues>) {
    const methods = form || useForm<TFieldValues>(formProps);

    return (
        <FormProvider {...methods}>
            <form onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : undefined}>
                {typeof children === 'function' ? children(methods) : children}
            </form>
        </FormProvider>
    );
}
