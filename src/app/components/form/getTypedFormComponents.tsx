import React, { ReactElement } from 'react';

import { FieldValues } from 'react-hook-form';

import {
    FormTextareaProps,
    FormTextFieldProps,
    FormSelectProps,
    FormFieldProps,
    FormDatePickerProps,
    FormRadioGroupProps,
} from './types';
import { PunsjFormProvider, PunsjFormProviderProps } from './FormProvider';
import { FormTextarea } from './FormTextarea';
import { FormTextField } from './FormTextField';
import { FormCheckbox } from './FormCheckbox';
import { FormSelect } from './FormSelect';
import { FormDatePicker } from './FormDatePicker';
import { FormRadioGroup } from './FormRadioGroup';

export interface TypedFormComponents<T extends FieldValues> {
    TypedFormProvider: (props: PunsjFormProviderProps<T>) => ReactElement;
    TypedFormTextarea: (props: FormTextareaProps<T>) => ReactElement;
    TypedFormTextField: (props: FormTextFieldProps<T>) => ReactElement;
    TypedFormCheckbox: (props: FormFieldProps<T>) => ReactElement;
    TypedFormSelect: (props: FormSelectProps<T>) => ReactElement;
    TypedFormDatePicker: (props: FormDatePickerProps<T>) => ReactElement;
    TypedFormRadioGroup: (props: FormRadioGroupProps<T>) => ReactElement;
}

export function getTypedFormComponents<T extends FieldValues>(): TypedFormComponents<T> {
    return {
        TypedFormProvider: (props: PunsjFormProviderProps<T>) => <PunsjFormProvider {...props} />,
        TypedFormTextarea: (props: FormTextareaProps<T>) => <FormTextarea<T> {...props} />,
        TypedFormTextField: (props: FormTextFieldProps<T>) => <FormTextField<T> {...props} />,
        TypedFormCheckbox: (props: FormFieldProps<T>) => <FormCheckbox<T> {...props} />,
        TypedFormSelect: (props: FormSelectProps<T>) => <FormSelect<T> {...props} />,
        TypedFormDatePicker: (props: FormDatePickerProps<T>) => <FormDatePicker<T> {...props} />,
        TypedFormRadioGroup: (props: FormRadioGroupProps<T>) => <FormRadioGroup<T> {...props} />,
    };
}
