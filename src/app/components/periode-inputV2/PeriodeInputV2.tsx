import React from 'react';
import { DatePicker, HStack, useRangeDatepicker } from '@navikt/ds-react';
import { dateToISODateString } from 'app/utils/date-utils/src/format';

interface PeriodeInputV2Props {
    value?: {
        fom: string | null;
        tom: string | null;
    };
    onChange?: (periode: { fom: string | null; tom: string | null }) => void;
}

const PeriodeInputV2: React.FC<PeriodeInputV2Props> = ({ value, onChange }) => {
    const today = new Date();
    const fourYearsAgo = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate());
    const fourYearsAhead = new Date(today.getFullYear() + 4, today.getMonth(), today.getDate());

    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
        fromDate: fourYearsAgo,
        toDate: fourYearsAhead,
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

    return (
        <DatePicker {...datepickerProps}>
            <HStack wrap gap="4" justify="center">
                <DatePicker.Input {...fromInputProps} label="Fra og med" />
                <DatePicker.Input {...toInputProps} label="Til og med" />
            </HStack>
        </DatePicker>
    );
};

export default PeriodeInputV2;
