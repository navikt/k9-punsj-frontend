import React from 'react';
import { DatePicker, ErrorMessage } from '@navikt/ds-react';
import { FieldValues, Path, useController, useFormContext } from 'react-hook-form';

import { IPeriode } from 'app/models/types/Periode';
import { isISODateString, ISODateStringToUTCDate } from 'app/utils/date/dateFormat';

import { useFormDateInput } from './internal/useFormDateInput';
import { FormPeriodInputProps } from './types';

const normalizePeriodValue = (value: unknown): Required<IPeriode> => {
    if (!value || typeof value !== 'object') {
        return { fom: '', tom: '' };
    }

    const period = value as IPeriode;

    return {
        fom: typeof period.fom === 'string' ? period.fom : '',
        tom: typeof period.tom === 'string' ? period.tom : '',
    };
};

const assignRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
    if (!ref) {
        return;
    }

    if (typeof ref === 'function') {
        ref(value);
        return;
    }

    ref.current = value;
};

export function FormPeriodInput<T extends FieldValues>({
    name,
    validate,
    className,
    disabled,
    size = 'medium',
    defaultMonth,
    fromDate,
    toDate,
    disabledDates,
    fomId,
    tomId,
    fomInputRef,
    tomInputRef,
    action,
    fromLabel = 'Fra og med',
    toLabel = 'Til og med',
    fomDataTestId = 'fom',
    tomDataTestId = 'tom',
}: FormPeriodInputProps<T>) {
    const {
        control,
        formState: { submitCount },
    } = useFormContext<T>();
    const { field: periodField, fieldState: periodFieldState } = useController({
        name,
        control,
        rules: validate,
    });
    const periodValue = normalizePeriodValue(periodField.value);
    const fomName = `${name}.fom` as Path<T>;
    const tomName = `${name}.tom` as Path<T>;
    const fomToDate = isISODateString(periodValue.tom) ? ISODateStringToUTCDate(periodValue.tom) : toDate;
    const tomFromDate = isISODateString(periodValue.fom) ? ISODateStringToUTCDate(periodValue.fom) : fromDate;
    const tomDefaultMonth = isISODateString(periodValue.fom) ? ISODateStringToUTCDate(periodValue.fom) : defaultMonth;
    const groupErrorMessage = typeof periodFieldState.error?.message === 'string' ? periodFieldState.error.message : undefined;
    const fomErrorId = `${fomId || `${String(name)}-fom`}-error`;
    const tomErrorId = `${tomId || `${String(name)}-tom`}-error`;
    const groupErrorId = `${fomId || tomId || String(name)}-error`;

    const fromField = useFormDateInput({
        name: fomName,
        defaultMonth,
    });
    const toField = useFormDateInput({
        name: tomName,
        defaultMonth: tomDefaultMonth,
    });

    const rootClassName = className ? `flex flex-col gap-2 ${className}` : 'flex flex-col gap-2';
    const fromErrorMessage = typeof fromField.error === 'string' ? fromField.error : undefined;
    const toErrorMessage = typeof toField.error === 'string' ? toField.error : undefined;

    return (
        <div className={rootClassName}>
            <div className="flex items-end gap-4 flex-wrap">
                <div className="flex gap-4 flex-wrap">
                    {/* Vi beholder to separate kalendere her fordi saksbehandlere opplevde felles range-picker som mindre praktisk i Punsj. */}
                    <DatePicker
                        {...(fromField.datepickerProps as any)}
                        showWeekNumber={true}
                        mode="single"
                        inputDisabled={disabled}
                        dropdownCaption={true}
                        fromDate={fromDate || fromField.fromDateDefault}
                        toDate={fomToDate || fromField.toDateDefault}
                        disabled={disabledDates}
                        onSelect={(date) => {
                            fromField.handleSelect(date);
                            periodField.onBlur();
                        }}
                        size={size}
                    >
                        <DatePicker.Input
                            {...fromField.inputProps}
                            id={fomId}
                            label={fromLabel}
                            disabled={disabled}
                            size={size}
                            ref={(node) => {
                                periodField.ref(node);
                                assignRef(fromField.fieldRef, node);
                                assignRef(fomInputRef, node);
                            }}
                            error={!!fromErrorMessage}
                            data-testid={fomDataTestId}
                            aria-describedby={[fromErrorMessage ? fomErrorId : undefined, groupErrorMessage ? groupErrorId : undefined]
                                .filter(Boolean)
                                .join(' ')}
                            onChange={fromField.handleInputChange}
                            onBlur={(event) => {
                                fromField.handleInputBlur(event);
                                periodField.onBlur();
                            }}
                        />
                    </DatePicker>
                    <DatePicker
                        {...(toField.datepickerProps as any)}
                        showWeekNumber={true}
                        mode="single"
                        inputDisabled={disabled}
                        dropdownCaption={true}
                        fromDate={tomFromDate || toField.fromDateDefault}
                        toDate={toDate || toField.toDateDefault}
                        disabled={disabledDates}
                        onSelect={(date) => {
                            toField.handleSelect(date);
                            periodField.onBlur();
                        }}
                        size={size}
                    >
                        <DatePicker.Input
                            {...toField.inputProps}
                            id={tomId}
                            label={toLabel}
                            disabled={disabled}
                            size={size}
                            ref={(node) => {
                                assignRef(toField.fieldRef, node);
                                assignRef(tomInputRef, node);
                            }}
                            error={!!toErrorMessage}
                            data-testid={tomDataTestId}
                            aria-describedby={[toErrorMessage ? tomErrorId : undefined, groupErrorMessage ? groupErrorId : undefined]
                                .filter(Boolean)
                                .join(' ')}
                            onChange={toField.handleInputChange}
                            onBlur={(event) => {
                                toField.handleInputBlur(event);
                                periodField.onBlur();
                            }}
                        />
                    </DatePicker>
                </div>
                {action && <div className="flex self-stretch items-end">{action}</div>}
            </div>
            <div>
                {fromErrorMessage && (
                    <ErrorMessage id={fomErrorId} aria-describedby={fomId} showIcon>
                        {fromLabel}: {fromErrorMessage}
                    </ErrorMessage>
                )}
                {toErrorMessage && (
                    <ErrorMessage id={tomErrorId} aria-describedby={tomId} showIcon>
                        {toLabel}: {toErrorMessage}
                    </ErrorMessage>
                )}
                {groupErrorMessage && (periodFieldState.isTouched || submitCount > 0) && (
                    <ErrorMessage id={groupErrorId} aria-describedby={fomId || tomId} showIcon>
                        {groupErrorMessage}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
}
