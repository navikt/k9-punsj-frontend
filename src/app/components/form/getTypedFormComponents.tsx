import React, { ReactElement } from 'react';

import { FieldValues } from 'react-hook-form';

import {
    FormTextareaProps,
    FormTextFieldProps,
    FormSelectProps,
    FormFieldProps,
    FormCheckboxGroupProps,
    FormRadioGroupProps,
    FormLegacyCheckboxGroupProps,
    FormLegacyRadioGroupProps,
} from './types';
import { PunsjFormProvider, PunsjFormProviderProps } from './FormProvider';
import { FormTextarea } from './FormTextarea';
import { FormTextField } from './FormTextField';
import { FormCheckbox } from './FormCheckbox';
import { FormCheckboxGroup } from './FormCheckboxGroup';
import { FormRadioGroup } from './FormRadioGroup';
import { FormSelect } from './FormSelect';
import { FormLegacyCheckboxGroup } from './FormLegacyCheckboxGroup';
import { FormLegacyRadioGroup } from './FormLegacyRadioGroup';

export interface TypedFormComponents<T extends FieldValues> {
    TypedFormProvider: (props: PunsjFormProviderProps<T>) => ReactElement;
    TypedFormTextarea: (props: FormTextareaProps<T>) => ReactElement;
    TypedFormTextField: (props: FormTextFieldProps<T>) => ReactElement;
    TypedFormCheckbox: (props: FormFieldProps<T>) => ReactElement;
    TypedFormCheckboxGroup: (props: FormCheckboxGroupProps<T>) => ReactElement;
    TypedFormRadioGroup: (props: FormRadioGroupProps<T>) => ReactElement;
    TypedFormSelect: (props: FormSelectProps<T>) => ReactElement;
    TypedFormLegacyCheckboxGroup: (props: FormLegacyCheckboxGroupProps<T>) => ReactElement;
    TypedFormLegacyRadioGroup: (props: FormLegacyRadioGroupProps<T>) => ReactElement;
}

export function getTypedFormComponents<T extends FieldValues>(): TypedFormComponents<T> {
    return {
        TypedFormProvider: (props: PunsjFormProviderProps<T>) => <PunsjFormProvider {...props} />,
        TypedFormTextarea: (props: FormTextareaProps<T>) => <FormTextarea<T> {...props} />,
        TypedFormTextField: (props: FormTextFieldProps<T>) => <FormTextField<T> {...props} />,
        TypedFormCheckbox: (props: FormFieldProps<T>) => <FormCheckbox<T> {...props} />,
        TypedFormCheckboxGroup: (props: FormCheckboxGroupProps<T>) => <FormCheckboxGroup<T> {...props} />,
        TypedFormRadioGroup: (props: FormRadioGroupProps<T>) => <FormRadioGroup<T> {...props} />,
        TypedFormSelect: (props: FormSelectProps<T>) => <FormSelect<T> {...props} />,
        TypedFormLegacyCheckboxGroup: (props: FormLegacyCheckboxGroupProps<T>) => (
            <FormLegacyCheckboxGroup<T> {...props} />
        ),
        TypedFormLegacyRadioGroup: (props: FormLegacyRadioGroupProps<T>) => <FormLegacyRadioGroup<T> {...props} />,
    };
}
