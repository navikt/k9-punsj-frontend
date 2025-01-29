import React from 'react';
import { FieldValues, FormProvider as RHFFormProvider, UseFormProps, UseFormReturn, useForm } from 'react-hook-form';

interface FormProviderProps<TFieldValues extends FieldValues> {
    children: ((methods: UseFormReturn<TFieldValues>) => React.ReactNode) | React.ReactNode;
    formProps?: UseFormProps<TFieldValues>;
    form?: UseFormReturn<TFieldValues>;
    onSubmit?: (data: TFieldValues) => void;
}

export function FormProvider<TFieldValues extends FieldValues>({
    children,
    formProps,
    form,
    onSubmit,
}: FormProviderProps<TFieldValues>) {
    const methods = form || useForm<TFieldValues>(formProps);

    return (
        <RHFFormProvider {...methods}>
            <form onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : undefined}>
                {typeof children === 'function' ? children(methods) : children}
            </form>
        </RHFFormProvider>
    );
}
