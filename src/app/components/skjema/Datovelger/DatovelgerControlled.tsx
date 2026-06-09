import React from 'react';
import { DateInputProps, DatePickerProps } from '@navikt/ds-react';
import DatovelgerBase from './DatovelgerBase';

export type DatovelgerControlledProps = Pick<DatePickerProps, 'defaultMonth' | 'fromDate' | 'toDate' | 'className'> &
    Pick<DateInputProps, 'hideLabel' | 'size' | 'label' | 'description' | 'id'> & {
        onChange: (value: string) => void;
        errorMessage?: React.ReactNode | string | boolean;
        selectedDay?: string;
        disabled?: boolean;
        disabledDates?: DatePickerProps['disabled'];
        onBlur?: (value: string) => void;
        value: string;
        inputRef?: React.Ref<HTMLInputElement>;
        dataTestId?: string;
        noValidateTomtFelt?: boolean;
        renderInlineErrorMessage?: boolean;
        errorAriaDescribedBy?: string;
        onInlineValidationMessageChange?: (message?: string) => void;
    };

const DatovelgerControlled = ({
    label,
    description,
    onChange,
    hideLabel,
    className,
    errorMessage,
    selectedDay,
    disabled,
    disabledDates,
    onBlur,
    value,
    fromDate,
    toDate,
    defaultMonth,
    size = 'medium',
    id,
    inputRef,
    dataTestId,
    noValidateTomtFelt,
    renderInlineErrorMessage,
    errorAriaDescribedBy,
    onInlineValidationMessageChange,
}: DatovelgerControlledProps) => {
    return (
        <DatovelgerBase
            label={label}
            description={description}
            onChange={onChange}
            onCommit={onBlur}
            hideLabel={hideLabel}
            className={className}
            errorMessage={errorMessage}
            value={value || selectedDay || ''}
            inputDisabled={disabled}
            disabledDates={disabledDates}
            fromDate={fromDate}
            toDate={toDate}
            defaultMonth={defaultMonth}
            size={size}
            id={id}
            inputRef={inputRef}
            dataTestId={dataTestId}
            noValidateTomtFelt={noValidateTomtFelt}
            renderInlineErrorMessage={renderInlineErrorMessage}
            errorAriaDescribedBy={errorAriaDescribedBy}
            onInlineValidationMessageChange={onInlineValidationMessageChange}
        />
    );
};

export default DatovelgerControlled;
