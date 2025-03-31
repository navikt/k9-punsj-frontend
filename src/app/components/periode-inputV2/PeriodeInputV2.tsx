import React from 'react';
import { DatePicker, HStack, useRangeDatepicker, DatePickerProps } from '@navikt/ds-react';
import { dateToISODateString } from 'app/utils/date-utils/src/format';
import { getDateRange } from 'app/utils/date-utils/src/range';
import { IPeriode } from 'app/models/types/Periode';

interface Props extends Omit<DatePickerProps, 'onChange' | 'onBlur' | 'fromDate' | 'toDate' | 'defaultSelected'> {
    periode?: IPeriode;
    onChange?: (periode: IPeriode) => void;
    onBlur?: (periode: IPeriode) => void;
    fromInputProps?: {
        className?: string;
        description?: React.ReactNode;
        error?: React.ReactNode | string;
        id?: string;
        disabled?: boolean;
        hideLabel?: boolean;
        dataTestId?: string;
    };
    toInputProps?: {
        className?: string;
        description?: React.ReactNode;
        error?: React.ReactNode | string;
        id?: string;
        disabled?: boolean;
        hideLabel?: boolean;
        dataTestId?: string;
    };
}

const PeriodeInputV2: React.FC<Props> = ({
    periode,
    onChange,
    onBlur,
    fromInputProps,
    toInputProps,
    ...datePickerProps
}) => {
    const { fromDate, toDate } = getDateRange();

    const {
        datepickerProps,
        toInputProps: defaultToInputProps,
        fromInputProps: defaultFromInputProps,
    } = useRangeDatepicker({
        fromDate,
        toDate,
        onRangeChange: (range) => {
            if (onChange) {
                onChange({
                    fom: range?.from ? dateToISODateString(range.from) : null,
                    tom: range?.to ? dateToISODateString(range.to) : null,
                });
            }
        },
        defaultSelected: periode
            ? {
                  from: periode.fom ? new Date(periode.fom) : undefined,
                  to: periode.tom ? new Date(periode.tom) : undefined,
              }
            : undefined,
    });

    const handleBlur = () => {
        if (onBlur) {
            onBlur({
                fom: periode?.fom || null,
                tom: periode?.tom || null,
            });
        }
    };

    return (
        <DatePicker {...(datepickerProps as any)} {...datePickerProps} mode="range">
            <HStack wrap gap="4" justify="center">
                <DatePicker.Input
                    {...defaultFromInputProps}
                    {...fromInputProps}
                    label="Fra og med"
                    onBlur={handleBlur}
                />
                <DatePicker.Input {...defaultToInputProps} {...toInputProps} label="Til og med" onBlur={handleBlur} />
            </HStack>
        </DatePicker>
    );
};

export default PeriodeInputV2;
