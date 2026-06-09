import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from 'react';
import { DateValidationT, useDatepicker } from '@navikt/ds-react';
import { FieldValues, Path, RegisterOptions, useController, useFormContext } from 'react-hook-form';

import {
    dateToISODateString,
    InputDateStringToISODateString,
    INVALID_DATE_VALUE,
    isISODateString,
    ISODateStringToUTCDate,
} from 'app/utils/date/dateFormat';
import { offsetDateByYears } from 'app/utils/date/dateUtils';

interface UseFormDateInputProps<T extends FieldValues> {
    name: Path<T>;
    validate?: RegisterOptions<T>;
    defaultMonth?: Date;
}

export function useFormDateInput<T extends FieldValues>({
    name,
    validate,
    defaultMonth,
}: UseFormDateInputProps<T>) {
    const { control } = useFormContext<T>();
    const { field, fieldState } = useController({
        name,
        control,
        rules: validate,
    });

    const value = typeof field.value === 'string' ? field.value : '';
    const [showValidationError, setShowValidationError] = useState(false);
    const [validationState, setValidationState] = useState<DateValidationT | undefined>(undefined);
    const previousValueRef = useRef<string>(value);
    const isInternalUpdateRef = useRef(false);
    const lastPropagatedDateRef = useRef<string | undefined>(undefined);
    const lastCommittedDateRef = useRef<string | undefined>(value);

    const getValidationMessage = (validation?: DateValidationT) => {
        if (!validation || validation.isEmpty || validation.isValidDate) {
            return undefined;
        }

        if (validation.isBefore || validation.isAfter || validation.isDisabled || validation.isWeekend) {
            return 'Datoen er ikke tillatt';
        }

        return validation.isInvalid ? 'Dato har ikke gyldig format' : undefined;
    };

    const commitIsoDateValue = (nextValue: string | typeof INVALID_DATE_VALUE) => {
        if (nextValue === INVALID_DATE_VALUE) {
            field.onBlur();
            return;
        }

        if (lastCommittedDateRef.current !== nextValue) {
            lastCommittedDateRef.current = nextValue;
            field.onChange(nextValue);
        }

        field.onBlur();
    };

    const onDateChange = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';

        if (isoDateString !== value && isoDateString !== lastPropagatedDateRef.current) {
            isInternalUpdateRef.current = true;
            lastPropagatedDateRef.current = isoDateString;
            previousValueRef.current = isoDateString;
            field.onChange(isoDateString);
        }
    };

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        defaultMonth,
        defaultSelected: isISODateString(value) ? ISODateStringToUTCDate(value) : undefined,
        onDateChange,
        onValidate: (validation) => {
            setValidationState(validation);

            if (validation.isValidDate || validation.isEmpty) {
                setShowValidationError(false);
            }
        },
    });

    useEffect(() => {
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            previousValueRef.current = value;
            return;
        }

        if (previousValueRef.current !== value) {
            if (isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else {
                setSelected(undefined);
            }
            previousValueRef.current = value;
            lastPropagatedDateRef.current = undefined;
            lastCommittedDateRef.current = value;
        }
    }, [setSelected, value]);

    return {
        datepickerProps,
        inputProps,
        fieldRef: field.ref,
        error: (showValidationError ? getValidationMessage(validationState) : undefined) || fieldState.error?.message,
        fromDateDefault: offsetDateByYears(new Date(), -5),
        toDateDefault: offsetDateByYears(new Date(), 5),
        handleSelect: (date?: Date) => {
            const isoDateString = date ? dateToISODateString(date) : '';
            setShowValidationError(false);
            commitIsoDateValue(isoDateString);
        },
        handleInputChange: (event: ChangeEvent<HTMLInputElement>) => {
            setShowValidationError(false);
            inputProps.onChange?.(event);
        },
        handleInputBlur: (event: FocusEvent<HTMLInputElement>) => {
            const nextValue = event.target.value ? InputDateStringToISODateString(event.target.value) : '';
            setShowValidationError(nextValue === INVALID_DATE_VALUE || !!getValidationMessage(validationState));
            commitIsoDateValue(nextValue);
            inputProps.onBlur?.(event);
        },
    };
}
