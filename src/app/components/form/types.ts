import { ReactNode, ChangeEvent } from 'react';
import { FieldValues, Path, RegisterOptions } from 'react-hook-form';

import { LegacyCheckboxGroupOption } from 'app/components/legacy-form-compat/checkbox';
import { LegacyRadioGroupOption } from 'app/components/legacy-form-compat/radio';

export interface FormFieldProps<T extends FieldValues> {
    name: Path<T>;
    label: ReactNode;
    validate?: RegisterOptions<T>;
    className?: string;
    disabled?: boolean;
    size?: 'small' | 'medium';
    readOnly?: boolean;
    'data-testid'?: string;
    onChange?: () => void;
}

export interface FormTextFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'onChange'> {
    type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';
    inputMode?: 'text' | 'numeric';
    pattern?: string;
    maxLength?: number;
    autoComplete?: string;
    htmlSize?: number;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface FormSelectProps<T extends FieldValues> extends FormFieldProps<T> {
    children: ReactNode;
}

export interface FormTextareaProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'onChange'> {
    maxLength?: number;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface FormLegacyRadioGroupProps<T extends FieldValues>
    extends Omit<FormFieldProps<T>, 'label' | 'onChange'> {
    legend: ReactNode;
    options: LegacyRadioGroupOption[];
    description?: ReactNode;
    retning?: 'horisontal' | 'vertikal';
    onChange?: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
}

export interface FormLegacyCheckboxGroupProps<T extends FieldValues>
    extends Omit<FormFieldProps<T>, 'label' | 'onChange'> {
    legend: ReactNode;
    options: LegacyCheckboxGroupOption[];
    description?: ReactNode;
    hideLegend?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>, value: string, checkedValues: string[]) => void;
}
