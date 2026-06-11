import React from 'react';
import { DatePicker, ErrorMessage } from '@navikt/ds-react';
import { FieldValues } from 'react-hook-form';

import { useFormDateRangeInput } from './internal/useFormDateRangeInput';
import { FormPeriodInputProps } from './types';

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
        datepickerProps,
        fromInputProps,
        toInputProps,
        fromLabel: effectiveFromLabel,
        toLabel: effectiveToLabel,
        mergedFomRef,
        mergedTomRef,
        visualErrors,
    } = useFormDateRangeInput({
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
    });

    const rootClassName = className ? `flex flex-col gap-2 ${className}` : 'flex flex-col gap-2';

    return (
        <div className={rootClassName}>
            <div className="flex items-end gap-4 flex-wrap">
                <DatePicker {...(datepickerProps as any)} size={size}>
                    <div className="flex gap-4 flex-wrap">
                        <DatePicker.Input
                            {...fromInputProps}
                            id={fomId}
                            label={effectiveFromLabel}
                            disabled={disabled}
                            size={size}
                            ref={mergedFomRef}
                            error={visualErrors.showFromError}
                            data-testid={fomDataTestId}
                        />
                        <DatePicker.Input
                            {...toInputProps}
                            id={tomId}
                            label={effectiveToLabel}
                            disabled={disabled}
                            size={size}
                            ref={mergedTomRef}
                            error={visualErrors.showToError}
                            data-testid={tomDataTestId}
                        />
                    </div>
                </DatePicker>
                {action && <div className="flex self-stretch items-end">{action}</div>}
            </div>
            <div>
                {visualErrors.showFromError && (
                    <ErrorMessage aria-describedby={fomId} showIcon>
                        {effectiveFromLabel}: {visualErrors.fromErrorMessage}
                    </ErrorMessage>
                )}
                {visualErrors.showToError && (
                    <ErrorMessage aria-describedby={tomId} showIcon>
                        {effectiveToLabel}: {visualErrors.toErrorMessage}
                    </ErrorMessage>
                )}
                {visualErrors.showGroupError && (
                    <ErrorMessage aria-describedby={fomId || tomId} showIcon>
                        {visualErrors.groupErrorMessage}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
}
