import React from 'react';
import { FieldValues, FormProvider as RHFFormProvider, UseFormProps, UseFormReturn, useForm } from 'react-hook-form';

interface FormProviderProps<TFieldValues extends FieldValues> {
    children: (methods: UseFormReturn<TFieldValues>) => React.ReactNode;
    formProps: UseFormProps<TFieldValues>;
    onSubmit?: (data: TFieldValues) => void;
}

export const FormProvider = <TFieldValues extends FieldValues>({
    children,
    formProps,
    onSubmit,
}: FormProviderProps<TFieldValues>) => {
    const methods = useForm<TFieldValues>(formProps);

    return (
        <RHFFormProvider {...methods}>
            <form onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : undefined}>{children(methods)}</form>
        </RHFFormProvider>
    );
};
