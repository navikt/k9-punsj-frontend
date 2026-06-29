import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from 'react';
import { DatePickerProps, DateValidationT, useDatepicker } from '@navikt/ds-react';
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
    fromDate?: Date;
    toDate?: Date;
    disabledDates?: DatePickerProps['disabled'];
}

export function useFormDateInput<T extends FieldValues>({
    name,
    validate,
    defaultMonth,
    fromDate,
    toDate,
    disabledDates,
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
    const validationStateRef = useRef<DateValidationT | undefined>(undefined);
    const inputValueRef = useRef<string>('');
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
        if (nextValue === INVALID_DATE_VALUE || getValidationMessage(validationStateRef.current)) {
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
        const shouldPropagateEmptyValue = inputValueRef.current === '';

        if (!isoDateString && !shouldPropagateEmptyValue) {
            return;
        }

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
        fromDate,
        toDate,
        disabled: disabledDates,
        onDateChange,
        onValidate: (validation) => {
            validationStateRef.current = validation;
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

        inputValueRef.current = value;
    }, [setSelected, value]);

    return {
        datepickerProps,
        inputProps,
        fieldRef: field.ref,
        inlineValidationMessage: showValidationError ? getValidationMessage(validationState) : undefined,
        fieldErrorMessage: fieldState.error?.message,
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
            inputValueRef.current = event.target.value;
            inputProps.onChange?.(event);
        },
        handleInputBlur: (event: FocusEvent<HTMLInputElement>) => {
            const nextValue = event.target.value ? InputDateStringToISODateString(event.target.value) : '';
            const validationMessage = getValidationMessage(validationStateRef.current);
            setShowValidationError(
                nextValue === INVALID_DATE_VALUE || !!validationMessage,
            );
            commitIsoDateValue(nextValue);
            inputProps.onBlur?.(event);
        },
    };
}
