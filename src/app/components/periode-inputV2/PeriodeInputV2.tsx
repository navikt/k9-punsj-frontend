import React, { useEffect } from 'react';
import { DatePicker, HStack, useRangeDatepicker, DateInputProps } from '@navikt/ds-react';
import { dateToISODateString } from 'app/utils/date-utils/src/format';
import { getDateRange } from 'app/utils/date-utils/src/range';
import { IPeriode } from 'app/models/types/Periode';
import './PeriodeInputV2.less';

/**
 * PeriodeInputV2 - Komponent for å velge datointervall
 *
 * @component
 * @example
 * ```tsx
 * <PeriodeInputV2
 *   periode={{ fom: '2024-01-01', tom: '2024-12-31' }}
 *   onChange={(periode) => console.log(periode)}
 * />
 * ```
 */
interface Props {
    /** Valgt periode */
    periode?: IPeriode;
    /** Callback når perioden endres */
    onChange: (periode: IPeriode) => void;
    /** Callback når input mister fokus */
    onBlur?: (periode: IPeriode) => void;
    /** Props for "Fra og med" input */
    fomInputProps?: Partial<DateInputProps>;
    /** Props for "Til og med" input */
    tomInputProps?: Partial<DateInputProps>;
}

const PeriodeInputV2: React.FC<Props> = ({ periode, onChange, onBlur, fomInputProps, tomInputProps }) => {
    const { fromDate, toDate } = getDateRange();

    const sanitizedPeriode = {
        fom: periode?.fom || '',
        tom: periode?.tom || '',
    };

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
                fom: range?.from ? dateToISODateString(range.from) : '',
                tom: range?.to ? dateToISODateString(range.to) : '',
            };

            if (newPeriode.fom !== sanitizedPeriode.fom || newPeriode.tom !== sanitizedPeriode.tom) {
                onChange(newPeriode);
            }
        },
        defaultSelected:
            sanitizedPeriode.fom || sanitizedPeriode.tom
                ? {
                      from: sanitizedPeriode.fom ? new Date(sanitizedPeriode.fom) : undefined,
                      to: sanitizedPeriode.tom ? new Date(sanitizedPeriode.tom) : undefined,
                  }
                : undefined,
    });

    useEffect(() => {
        if (periode) {
            setSelected({
                from: periode.fom ? new Date(periode.fom) : undefined,
                to: periode.tom ? new Date(periode.tom) : undefined,
            });
        }
    }, [periode, setSelected]);

    const handleBlur = () => {
        if (onBlur) {
            onBlur({
                fom: sanitizedPeriode.fom,
                tom: sanitizedPeriode.tom,
            });
        }
    };

    return (
        <div className="periode-input">
            <DatePicker {...(datepickerProps as any)} mode="range" dropdownCaption={true}>
                <HStack wrap gap="4" justify="center">
                    <div className="periode-input__container">
                        <DatePicker.Input
                            {...defaultFromInputProps}
                            {...fomInputProps}
                            label="Fra og med"
                            onBlur={handleBlur}
                        />
                    </div>
                    <div className="periode-input__container">
                        <DatePicker.Input
                            {...defaultToInputProps}
                            {...tomInputProps}
                            label="Til og med"
                            onBlur={handleBlur}
                        />
                    </div>
                </HStack>
            </DatePicker>
        </div>
    );
};

export default PeriodeInputV2;
