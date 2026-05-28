import React from 'react';
import { DateInputProps, DatePickerProps } from '@navikt/ds-react';
import DatovelgerBase from './DatovelgerBase';

export type DatovelgerProps = Pick<DatePickerProps, 'defaultMonth' | 'fromDate' | 'toDate' | 'className'> &
    Pick<DateInputProps, 'hideLabel' | 'size' | 'label' | 'description' | 'id'> & {
        onChange: (value: string) => void;
        errorMessage?: React.ReactNode | string;
        selectedDay: string;
        inputDisabled?: boolean;
        disabled?: boolean;
        disabledDates?: DatePickerProps['disabled'];
        onBlur: () => void;
        value: string;
        dataTestId?: string;
    };

const Datovelger = ({
    label,
    description,
    onChange,
    hideLabel,
    className,
    errorMessage,
    selectedDay,
    inputDisabled,
    disabled,
    disabledDates,
    onBlur,
    value,
    fromDate,
    toDate,
    defaultMonth,
    size = 'small',
    id,
    dataTestId,
}: DatovelgerProps) => {
    return (
        <DatovelgerBase
            label={label}
            description={description}
            onChange={onChange}
            onCommit={() => onBlur()}
            hideLabel={hideLabel}
            className={className}
            errorMessage={errorMessage}
            value={value || selectedDay || ''}
            inputDisabled={inputDisabled || disabled}
            disabledDates={disabledDates}
            fromDate={fromDate}
            toDate={toDate}
            defaultMonth={defaultMonth}
            size={size}
            id={id}
            dataTestId={dataTestId}
        />
    );
};

export default Datovelger;
