import { ChangeEvent, FocusEvent, ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RangeValidationT, UseRangeDatepickerOptions, useRangeDatepicker } from '@navikt/ds-react';
import { FieldValues, Path, RegisterOptions, useController, useFormContext } from 'react-hook-form';

import { IPeriode } from 'app/models/types/Periode';
import { dateToISODateString, isISODateString, ISODateStringToUTCDate } from 'app/utils/date/dateFormat';

interface UseFormDateRangeInputProps<T extends FieldValues> {
    name: Path<T>;
    validate?: RegisterOptions<T>;
    defaultMonth?: Date;
    fromDate?: Date;
    toDate?: Date;
    disabledDates?: UseRangeDatepickerOptions['disabled'];
    fromLabel: ReactNode;
    toLabel: ReactNode;
    fomInputRef?: Ref<HTMLInputElement>;
    tomInputRef?: Ref<HTMLInputElement>;
}

type DateRangeValue = ReturnType<typeof useRangeDatepicker>['selectedRange'];

const EMPTY_PERIOD: Required<IPeriode> = { fom: '', tom: '' };

const normalizePeriodValue = (value: unknown): Required<IPeriode> => {
    if (!value || typeof value !== 'object') {
        return EMPTY_PERIOD;
    }

    const period = value as IPeriode;

    return {
        fom: typeof period.fom === 'string' ? period.fom : '',
        tom: typeof period.tom === 'string' ? period.tom : '',
    };
};

const periodKey = (value: Required<IPeriode>) => `${value.fom}::${value.tom}`;

const periodToRange = (value: Required<IPeriode>): DateRangeValue => {
    const from = isISODateString(value.fom) ? ISODateStringToUTCDate(value.fom) : undefined;
    const to = isISODateString(value.tom) ? ISODateStringToUTCDate(value.tom) : undefined;

    if (!from && !to) {
        return undefined;
    }

    return { from, to };
};

const rangeToPeriod = (value?: DateRangeValue): Required<IPeriode> => ({
    fom: value?.from ? dateToISODateString(value.from) : '',
    tom: value?.to ? dateToISODateString(value.to) : '',
});

const assignRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
    if (!ref) {
        return;
    }

    if (typeof ref === 'function') {
        ref(value);
        return;
    }

    ref.current = value;
};

const getInputErrorMessage = (validation: RangeValidationT['from'] | RangeValidationT['to']) => {
    if (validation.isEmpty || validation.isValidDate) {
        return undefined;
    }

    if ('isBeforeFrom' in validation && validation.isBeforeFrom) {
        return 'datoen kan ikke være før fra og med';
    }

    if (validation.isBefore || validation.isAfter || validation.isDisabled || validation.isWeekend) {
        return 'datoen er ikke tillatt';
    }

    return 'dato har ikke gyldig format';
};

export function useFormDateRangeInput<T extends FieldValues>({
    name,
    validate,
    defaultMonth,
    fromDate,
    toDate,
    disabledDates,
    fromLabel,
    toLabel,
    fomInputRef,
    tomInputRef,
}: UseFormDateRangeInputProps<T>) {
    const {
        control,
        formState: { submitCount },
    } = useFormContext<T>();
    const { field, fieldState } = useController({
        name,
        control,
        rules: validate,
    });

    const value = normalizePeriodValue(field.value);
    const valueKey = periodKey(value);
    const [validationState, setValidationState] = useState<RangeValidationT | undefined>(undefined);
    const [touchedState, setTouchedState] = useState({ from: false, to: false });
    const previousValueRef = useRef<string>(valueKey);
    const isInternalUpdateRef = useRef(false);
    const lastPropagatedRangeKeyRef = useRef<string | undefined>(undefined);

    const { datepickerProps, fromInputProps, toInputProps, setSelected } = useRangeDatepicker({
        defaultMonth,
        defaultSelected: periodToRange(value),
        fromDate,
        toDate,
        disabled: disabledDates,
        onRangeChange: (nextRange) => {
            const nextValue = rangeToPeriod(nextRange);
            const nextValueKey = periodKey(nextValue);

            if (nextValueKey !== valueKey && nextValueKey !== lastPropagatedRangeKeyRef.current) {
                isInternalUpdateRef.current = true;
                lastPropagatedRangeKeyRef.current = nextValueKey;
                previousValueRef.current = nextValueKey;
                field.onChange(nextValue);
            }
        },
        onValidate: setValidationState,
    });

    useEffect(() => {
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            previousValueRef.current = valueKey;
            return;
        }

        if (previousValueRef.current !== valueKey) {
            setSelected(periodToRange(value));
            previousValueRef.current = valueKey;
            lastPropagatedRangeKeyRef.current = undefined;
        }
    }, [setSelected, value, valueKey]);

    const markTouched = useCallback((fieldName: 'from' | 'to') => {
        setTouchedState((currentState) =>
            currentState[fieldName] ? currentState : { ...currentState, [fieldName]: true },
        );
    }, []);

    const handleRangeSelect = useCallback(
        (nextRange: DateRangeValue) => {
            (datepickerProps.onSelect as ((value?: DateRangeValue) => void) | undefined)?.(nextRange);

            if (nextRange?.from) {
                markTouched('from');
            }

            if (nextRange?.to) {
                markTouched('to');
            }

            field.onBlur();
        },
        [datepickerProps, field, markTouched],
    );

    const handleFromBlur = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            markTouched('from');
            fromInputProps.onBlur?.(event);
            field.onBlur();
        },
        [field, fromInputProps, markTouched],
    );

    const handleToBlur = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            markTouched('to');
            toInputProps.onBlur?.(event);
            field.onBlur();
        },
        [field, markTouched, toInputProps],
    );

    const fromErrorMessage = validationState ? getInputErrorMessage(validationState.from) : undefined;
    const toErrorMessage = validationState ? getInputErrorMessage(validationState.to) : undefined;
    const showFromError = !!fromErrorMessage && (touchedState.from || submitCount > 0);
    const showToError = !!toErrorMessage && (touchedState.to || submitCount > 0);
    const groupErrorMessage = typeof fieldState.error?.message === 'string' ? fieldState.error.message : undefined;
    const showGroupError = !!groupErrorMessage && (fieldState.isTouched || submitCount > 0);

    const mergedFomRef = useCallback(
        (node: HTMLInputElement | null) => {
            assignRef(field.ref, node);
            assignRef(fomInputRef, node);
        },
        [field.ref, fomInputRef],
    );

    const mergedTomRef = useCallback(
        (node: HTMLInputElement | null) => {
            assignRef(tomInputRef, node);
        },
        [tomInputRef],
    );

    const visualErrors = useMemo(
        () => ({
            showFromError,
            showToError,
            showGroupError,
            fromErrorMessage,
            toErrorMessage,
            groupErrorMessage,
        }),
        [fromErrorMessage, groupErrorMessage, showFromError, showGroupError, showToError, toErrorMessage],
    );

    return {
        datepickerProps: {
            ...datepickerProps,
            onSelect: handleRangeSelect,
        },
        fromInputProps: {
            ...fromInputProps,
            onChange: (event: ChangeEvent<HTMLInputElement>) => fromInputProps.onChange?.(event),
            onBlur: handleFromBlur,
        },
        toInputProps: {
            ...toInputProps,
            onChange: (event: ChangeEvent<HTMLInputElement>) => toInputProps.onChange?.(event),
            onBlur: handleToBlur,
        },
        fromLabel,
        toLabel,
        mergedFomRef,
        mergedTomRef,
        visualErrors,
    };
}
