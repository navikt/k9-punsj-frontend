import React from 'react';
import { DatePicker, HStack, useRangeDatepicker } from '@navikt/ds-react';
import { dateToISODateString } from 'app/utils/date-utils/src/format';
import { getDateRange } from 'app/utils/date-utils/src/range';
import { IPeriode } from 'app/models/types/Periode';

interface Props {
    periode?: IPeriode;
    onChange?: (periode: IPeriode) => void;
    onBlur?: (periode: IPeriode) => void;
}

const PeriodeInputV2: React.FC<Props> = ({ periode, onChange, onBlur }) => {
    const { fromDate, toDate } = getDateRange();

    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
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
        <DatePicker {...datepickerProps}>
            <HStack wrap gap="4" justify="center">
                <DatePicker.Input {...fromInputProps} label="Fra og med" onBlur={handleBlur} />
                <DatePicker.Input {...toInputProps} label="Til og med" onBlur={handleBlur} />
            </HStack>
        </DatePicker>
    );
};

export default PeriodeInputV2;
