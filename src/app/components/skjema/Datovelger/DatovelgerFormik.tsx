import React, { useEffect, useRef, useState } from 'react';
import { DateInputProps, DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { cloneDeep, set } from 'lodash';
import {
    dateToISODateString,
    InputDateStringToISODateString,
    INVALID_DATE_VALUE,
    isISODateString,
    ISODateStringToUTCDate,
} from 'app/utils/date/dateFormat';
import { offsetDateByYears } from 'app/utils/date/dateUtils';

type Props = Pick<DatePickerProps, 'defaultMonth' | 'fromDate' | 'toDate' | 'disabled'> &
    Pick<DateInputProps, 'hideLabel' | 'size' | 'label' | 'id'> & {
        name: string;
        className?: string;
        dataTestId?: string;
        inputRef?: React.Ref<HTMLInputElement>;
        visFeilmelding?: boolean;
        errorAriaDescribedBy?: string;
        onErrorMessageChange?: (message?: string) => void;
        onValueBlur?: (value: string, nextValues: FormikValues) => void;
    };

const DatovelgerFormik = ({
    name,
    label,
    toDate,
    fromDate,
    hideLabel,
    defaultMonth,
    className,
    id,
    disabled,
    size = 'medium',
    visFeilmelding = true,
    inputRef,
    dataTestId,
    errorAriaDescribedBy,
    onErrorMessageChange,
    onValueBlur,
}: Props) => {
    const [field, meta, helper] = useField(name);
    const { values, submitCount } = useFormikContext<FormikValues>();
    const [isInvalidDate, setIsInvalidDate] = useState(false);
    const [showLocalError, setShowLocalError] = useState(false);
    const previousValueRef = useRef<string | undefined>(undefined);
    const isInternalUpdateRef = useRef(false);
    const lastPropagatedDateRef = useRef<string | undefined>(undefined);

    const value = typeof field.value === 'string' ? field.value : '';
    const localErrorMessage = isInvalidDate && showLocalError ? 'Dato har ikke gyldig format' : undefined;
    const formikErrorMessage = meta.touched || submitCount > 0 ? meta.error : undefined;
    const error = localErrorMessage
        ? visFeilmelding
            ? localErrorMessage
            : true
        : visFeilmelding
          ? formikErrorMessage
          : !!formikErrorMessage;

    const inputDisabled = typeof disabled === 'boolean' ? disabled : undefined;
    const disabledDates = disabled !== undefined && typeof disabled !== 'boolean' ? disabled : undefined;
    const fromDateDefault = offsetDateByYears(new Date(), -5);
    const toDateDefault = offsetDateByYears(new Date(), 5);

    useEffect(() => {
        onErrorMessageChange?.(localErrorMessage);
    }, [localErrorMessage, onErrorMessageChange]);

    const onDateChange = (date?: Date) => {
        const hasSyncedExternalValue = previousValueRef.current !== undefined;
        const lastKnownValue = hasSyncedExternalValue ? previousValueRef.current : value;
        const isoDateString = date ? dateToISODateString(date) : '';
        const shouldPropagateDateChange =
            isoDateString !== lastKnownValue &&
            isoDateString !== lastPropagatedDateRef.current &&
            (isoDateString || hasSyncedExternalValue);

        if (shouldPropagateDateChange) {
            if (hasSyncedExternalValue) {
                isInternalUpdateRef.current = true;
            }
            lastPropagatedDateRef.current = isoDateString;
            previousValueRef.current = isoDateString;
            helper.setValue(isoDateString);
        }
    };

    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        defaultMonth,
        onDateChange,
        onValidate: (validation) => {
            setIsInvalidDate(!validation.isValidDate && !validation.isEmpty);
        },
    });

    useEffect(() => {
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            previousValueRef.current = value;
            setShowLocalError(false);
            return;
        }

        if (previousValueRef.current !== value) {
            lastPropagatedDateRef.current = undefined;
            if (isISODateString(value)) {
                setSelected(ISODateStringToUTCDate(value));
            } else {
                setSelected(undefined);
            }
            previousValueRef.current = value;
            setShowLocalError(false);
        }
    }, [value, setSelected]);

    const commitBlurValue = (nextValue: string) => {
        helper.setTouched(true, true);
        helper.setValue(nextValue);

        if (onValueBlur) {
            const nextValues = set(cloneDeep(values), name, nextValue);
            onValueBlur(nextValue, nextValues);
        }
    };

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const isoDateString = event.target.value ? InputDateStringToISODateString(event.target.value) : '';
        const hasInvalidDate = isoDateString === INVALID_DATE_VALUE;

        setShowLocalError(hasInvalidDate);

        if (!hasInvalidDate) {
            if (isISODateString(isoDateString)) {
                setSelected(ISODateStringToUTCDate(isoDateString));
            } else {
                setSelected(undefined);
            }
            commitBlurValue(isoDateString);
            return;
        }

        helper.setTouched(true, true);
    };

    const handleSelect = (date?: Date) => {
        const isoDateString = date ? dateToISODateString(date) : '';
        setShowLocalError(false);
        if (isoDateString !== value) {
            commitBlurValue(isoDateString);
            return;
        }

        helper.setTouched(true, true);
    };

    return (
        <div className={className}>
            <DatePicker
                {...(datepickerProps as any)}
                showWeekNumber={true}
                onSelect={handleSelect}
                mode="single"
                inputDisabled={inputDisabled}
                dropdownCaption={true}
                fromDate={fromDate || fromDateDefault}
                toDate={toDate || toDateDefault}
                disabled={disabledDates}
                size={size}
            >
                <DatePicker.Input
                    {...inputProps}
                    hideLabel={hideLabel}
                    id={id}
                    label={label}
                    error={error}
                    disabled={inputDisabled}
                    onBlur={handleInputBlur}
                    onChange={(event) => {
                        setShowLocalError(false);
                        inputProps.onChange?.(event);
                    }}
                    ref={inputRef}
                    data-testid={dataTestId || name}
                    size={size}
                    aria-describedby={errorAriaDescribedBy}
                />
            </DatePicker>
        </div>
    );
};

export default DatovelgerFormik;
