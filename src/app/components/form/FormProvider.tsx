import React from 'react';
import { FieldValues, FormProvider, UseFormProps, UseFormReturn, useForm } from 'react-hook-form';

export interface PunsjFormProviderProps<TFieldValues extends FieldValues> {
    children: ((methods: UseFormReturn<TFieldValues>) => React.ReactNode) | React.ReactNode;
    formProps?: UseFormProps<TFieldValues>;
    form?: UseFormReturn<TFieldValues>;
    onSubmit?: (data: TFieldValues) => void;
}

type FormWithMethodsProps<TFieldValues extends FieldValues> = Omit<PunsjFormProviderProps<TFieldValues>, 'form'> & {
    form: UseFormReturn<TFieldValues>;
};

function FormWithMethods<TFieldValues extends FieldValues>({
    children,
    form,
    onSubmit,
}: FormWithMethodsProps<TFieldValues>) {
    return (
        <FormProvider {...form}>
            <form onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
                {typeof children === 'function' ? children(form) : children}
            </form>
        </FormProvider>
    );
}

function FormWithInternalMethods<TFieldValues extends FieldValues>({
    formProps,
    ...props
}: Omit<PunsjFormProviderProps<TFieldValues>, 'form'>) {
    const form = useForm<TFieldValues>(formProps);
    return <FormWithMethods {...props} form={form} />;
}

export function PunsjFormProvider<TFieldValues extends FieldValues>({
    form,
    ...props
}: PunsjFormProviderProps<TFieldValues>) {
    return form ? <FormWithMethods {...props} form={form} /> : <FormWithInternalMethods {...props} />;
}
