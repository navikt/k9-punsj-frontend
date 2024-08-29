import React from 'react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Box, DatePicker, DatePickerProps, HStack, useRangeDatepicker } from '@navikt/ds-react';

type Props = Omit<DatePickerProps, 'onChange' | 'onBlur' | 'fromDate' | 'toDate'> & {
    label: string;
    onChange: (value: string) => void;

    className?: string;
    description?: React.ReactNode;
    errorMessage?: React.ReactNode | string;
    id?: string;
    inputDisabled?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
    onBlur?: (value: string) => void;
    value?: string;
};

export const PeriodInputNew: React.FC<Props> = ({
    label,
    onChange,

    className,
    errorMessage,
    id,
    inputDisabled,
    inputRef,
    locale,
    onBlur,
    value,
}) => {
    const { datepickerProps, toInputProps, fromInputProps, selectedRange } = useRangeDatepicker({
        fromDate: new Date('Aug 23 2019'),
        onRangeChange: console.info,
    });

    return (
        <div className="min-h-96">
            <DatePicker {...datepickerProps}>
                <HStack wrap gap="4" justify="center">
                    <DatePicker.Input {...fromInputProps} label="Fra" />
                    <DatePicker.Input {...toInputProps} label="Til" />
                </HStack>
            </DatePicker>
            {selectedRange && (
                <Box paddingBlock="4 0">
                    <div>{selectedRange?.from && format(selectedRange.from, 'dd.MM.yyyy', { locale: nb })}</div>
                    <div>{selectedRange?.to && format(selectedRange.to, 'dd.MM.yyyy', { locale: nb })}</div>
                </Box>
            )}
        </div>
    );
};
