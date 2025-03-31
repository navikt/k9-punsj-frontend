import React from 'react';
import { DatePicker, HStack, useRangeDatepicker } from '@navikt/ds-react';
import { dateToISODateString } from 'app/utils/date-utils/src/format';
import { getDateRange } from 'app/utils/date-utils/src/range';

interface PeriodeInputV2Props {
    value?: {
        fom: string | null;
        tom: string | null;
    };
    onChange?: (periode: { fom: string | null; tom: string | null }) => void;
    onBlur?: (periode: { fom: string | null; tom: string | null }) => void;
}

const PeriodeInputV2: React.FC<PeriodeInputV2Props> = ({ value, onChange, onBlur }) => {
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
        defaultSelected: value
            ? {
                  from: value.fom ? new Date(value.fom) : undefined,
                  to: value.tom ? new Date(value.tom) : undefined,
              }
            : undefined,
    });

    const handleBlur = () => {
        if (onBlur) {
            onBlur({
                fom: value?.fom || null,
                tom: value?.tom || null,
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
