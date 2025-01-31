import { ReactNode, ChangeEvent } from 'react';
import { FieldValues, Path, RegisterOptions } from 'react-hook-form';

export interface FormFieldProps<T extends FieldValues> {
    name: Path<T>;
    label: ReactNode;
    validate?: RegisterOptions<T>['validate'];
    required?: string | boolean;
    className?: string;
    disabled?: boolean;
    onChange?: () => void;
}

export interface FormTextFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'onChange'> {
    type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';
    inputMode?: 'text' | 'numeric';
    pattern?: string;
    maxLength?: number;
    autoComplete?: string;
    readOnly?: boolean;
    htmlSize?: number;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface FormSelectProps<T extends FieldValues> extends FormFieldProps<T> {
    readOnly?: boolean;
    children: ReactNode;
}

export interface FormCheckboxProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'className'> {
    size?: 'small' | 'medium';
}

export interface FormTextareaProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'onChange'> {
    readOnly?: boolean;
    maxLength?: number;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}
