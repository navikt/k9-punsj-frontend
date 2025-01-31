import React, { ReactElement } from 'react';

import { FieldValues } from 'react-hook-form';

import { FormCheckboxProps, FormTextareaProps, FormTextFieldProps, FormSelectProps } from './types';
import { PunsjFormProvider, PunsjFormProviderProps } from './FormProvider';
import { FormTextarea } from './FormTextarea';
import { FormTextField } from './FormTextField';
import { FormCheckbox } from './FormCheckbox';
import { FormSelect } from './FormSelect';

export interface TypedFormComponents<T extends FieldValues> {
    TypedFormProvider: (props: PunsjFormProviderProps<T>) => ReactElement;
    TypedFormTextarea: (props: FormTextareaProps<T>) => ReactElement;
    TypedFormTextField: (props: FormTextFieldProps<T>) => ReactElement;
    TypedFormCheckbox: (props: FormCheckboxProps<T>) => ReactElement;
    TypedFormSelect: (props: FormSelectProps<T>) => ReactElement;
}

export function getTypedFormComponents<T extends FieldValues>(): TypedFormComponents<T> {
    return {
        TypedFormProvider: (props: PunsjFormProviderProps<T>) => <PunsjFormProvider {...props} />,
        TypedFormTextarea: (props: FormTextareaProps<T>) => <FormTextarea<T> {...props} />,
        TypedFormTextField: (props: FormTextFieldProps<T>) => <FormTextField<T> {...props} />,
        TypedFormCheckbox: (props: FormCheckboxProps<T>) => <FormCheckbox<T> {...props} />,
        TypedFormSelect: (props: FormSelectProps<T>) => <FormSelect<T> {...props} />,
    };
}
