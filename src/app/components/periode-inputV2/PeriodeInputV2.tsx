import React, { useEffect, useRef } from 'react';
import { DatePicker, HStack, useRangeDatepicker, DatePickerProps } from '@navikt/ds-react';
import { dateToISODateString } from 'app/utils/date-utils/src/format';
import { getDateRange } from 'app/utils/date-utils/src/range';
import { IPeriode } from 'app/models/types/Periode';

interface Props extends Omit<DatePickerProps, 'onChange' | 'onBlur' | 'fromDate' | 'toDate' | 'defaultSelected'> {
    periode?: IPeriode;
    onChange: (periode: IPeriode) => void;
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
    const prevPeriodeRef = useRef<IPeriode | undefined>(periode);

    const {
        datepickerProps,
        toInputProps: defaultToInputProps,
        fromInputProps: defaultFromInputProps,
        setSelected,
    } = useRangeDatepicker({
        fromDate,
        toDate,
        onRangeChange: (range) => {
            const newPeriode = {
                fom: range?.from ? dateToISODateString(range.from) : null,
                tom: range?.to ? dateToISODateString(range.to) : null,
            };

            if (newPeriode.fom !== periode?.fom || newPeriode.tom !== periode?.tom) {
                onChange(newPeriode);
            }
        },
        defaultSelected: periode
            ? {
                  from: periode.fom ? new Date(periode.fom) : undefined,
                  to: periode.tom ? new Date(periode.tom) : undefined,
              }
            : undefined,
    });

    useEffect(() => {
        if (periode && (periode.fom !== prevPeriodeRef.current?.fom || periode.tom !== prevPeriodeRef.current?.tom)) {
            setSelected({
                from: periode.fom ? new Date(periode.fom) : undefined,
                to: periode.tom ? new Date(periode.tom) : undefined,
            });
            prevPeriodeRef.current = periode;
        }
    }, [periode, setSelected]);

    const handleBlur = () => {
        if (onBlur) {
            onBlur({
                fom: periode?.fom || null,
                tom: periode?.tom || null,
            });
        }
    };

    return (
        <DatePicker {...(datepickerProps as any)} {...datePickerProps} mode="range" dropdownCaption={true}>
            <HStack wrap gap="4" justify="center">
                <div style={{ minHeight: '4rem' }}>
                    <DatePicker.Input
                        {...defaultFromInputProps}
                        {...fromInputProps}
                        label="Fra og med"
                        onBlur={handleBlur}
                    />
                </div>
                <div style={{ minHeight: '4rem' }}>
                    <DatePicker.Input
                        {...defaultToInputProps}
                        {...toInputProps}
                        label="Til og med"
                        onBlur={handleBlur}
                    />
                </div>
            </HStack>
        </DatePicker>
    );
};

export default PeriodeInputV2;
