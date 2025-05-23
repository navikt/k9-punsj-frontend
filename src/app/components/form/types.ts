import { ReactNode, ChangeEvent } from 'react';
import { FieldValues, Path, RegisterOptions } from 'react-hook-form';

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
