import { DatePickerProps, ErrorMessage } from '@navikt/ds-react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { isISODateString } from 'app/utils/date/dateFormat';
import React from 'react';
import DatovelgerFormik from '../skjema/Datovelger/DatovelgerFormik';

interface PeriodevelgerFormikProps {
    name: string;
    fromDate?: Date;
    toDate?: Date;
    disabled?: DatePickerProps['disabled'];
    disabledFom?: DatePickerProps['disabled'];
    disabledTom?: DatePickerProps['disabled'];
    inputIdFom?: string;
    inputIdTom?: string;
    fomInputRef?: React.Ref<HTMLInputElement>;
    tomInputRef?: React.Ref<HTMLInputElement>;
    size?: 'small' | 'medium';
    action?: React.ReactNode;
    onValueBlurFom?: (value: string, nextValues: FormikValues) => void;
    onValueBlurTom?: (value: string, nextValues: FormikValues) => void;
    labelFom?: string;
    labelTom?: string;
}

const PERIOD_RANGE_ERROR_MESSAGE = 'Startdato må være før sluttdato.';

const PeriodevelgerFormik = ({
    name,
    fromDate,
    toDate,
    disabled,
    disabledFom,
    disabledTom,
    inputIdFom,
    inputIdTom,
    fomInputRef,
    tomInputRef,
    size,
    action,
    onValueBlurFom,
    onValueBlurTom,
    labelFom,
    labelTom,
}: PeriodevelgerFormikProps) => {
    const fomFieldName = `${name}.fom`;
    const tomFieldName = `${name}.tom`;
    const { submitCount } = useFormikContext();
    const [, periodeFieldMeta] = useField(name);
    const [, fomFieldMeta] = useField(fomFieldName);
    const [, tomFieldMeta] = useField(tomFieldName);
    const showFomError = fomFieldMeta.touched || submitCount > 0;
    const showTomError = tomFieldMeta.touched || submitCount > 0;
    const showPeriodError = showFomError || showTomError;
    const [fomLocalError, setFomLocalError] = React.useState<string | undefined>(undefined);
    const [tomLocalError, setTomLocalError] = React.useState<string | undefined>(undefined);
    const fomErrorId = `${inputIdFom || fomFieldName}-error`;
    const tomErrorId = `${inputIdTom || tomFieldName}-error`;
    const groupErrorId = `${inputIdFom || inputIdTom || name}-error`;
    const fomValue = typeof fomFieldMeta.value === 'string' ? fomFieldMeta.value : '';
    const tomValue = typeof tomFieldMeta.value === 'string' ? tomFieldMeta.value : '';
    const hasRangeError = isISODateString(fomValue) && isISODateString(tomValue) && tomValue < fomValue;
    const effectiveToDate = isISODateString(tomValue)
        ? toDate && toDate < new Date(tomValue)
            ? toDate
            : new Date(tomValue)
        : toDate;
    const effectiveFromDate = isISODateString(fomValue)
        ? fromDate && fromDate > new Date(fomValue)
            ? fromDate
            : new Date(fomValue)
        : fromDate;
    const fomErrorMessage =
        fomLocalError || (showFomError && typeof fomFieldMeta.error === 'string' ? fomFieldMeta.error : undefined);
    const tomErrorMessage =
        tomLocalError || (showTomError && typeof tomFieldMeta.error === 'string' ? tomFieldMeta.error : undefined);
    const groupErrorMessage =
        (showPeriodError && typeof periodeFieldMeta.error === 'string' ? periodeFieldMeta.error : undefined) ||
        (hasRangeError ? PERIOD_RANGE_ERROR_MESSAGE : undefined);
    const resolvedLabelFom = labelFom || 'Fra og med';
    const resolvedLabelTom = labelTom || 'Til og med';

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end gap-4 flex-wrap">
                <div className="flex gap-4 flex-wrap">
                    <DatovelgerFormik
                        id={inputIdFom || fomFieldName}
                        name={fomFieldName}
                        label={resolvedLabelFom}
                        fromDate={fromDate}
                        toDate={effectiveToDate}
                        visFeilmelding={false}
                        disabled={disabledFom ?? disabled}
                        inputRef={fomInputRef}
                        dataTestId="fom"
                        size={size}
                        onValueBlur={onValueBlurFom}
                        errorAriaDescribedBy={[
                            fomErrorMessage ? fomErrorId : undefined,
                            groupErrorMessage ? groupErrorId : undefined,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onErrorMessageChange={setFomLocalError}
                    />
                    <DatovelgerFormik
                        id={inputIdTom || tomFieldName}
                        name={tomFieldName}
                        label={resolvedLabelTom}
                        defaultMonth={isISODateString(fomValue) ? new Date(fomValue) : undefined}
                        fromDate={effectiveFromDate}
                        toDate={toDate}
                        visFeilmelding={false}
                        disabled={disabledTom ?? disabled}
                        inputRef={tomInputRef}
                        dataTestId="tom"
                        size={size}
                        onValueBlur={onValueBlurTom}
                        errorAriaDescribedBy={[
                            tomErrorMessage ? tomErrorId : undefined,
                            groupErrorMessage ? groupErrorId : undefined,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onErrorMessageChange={setTomLocalError}
                    />
                </div>
                {action && <div className="flex self-stretch items-end">{action}</div>}
            </div>
            <div className="min-h-[1.5rem]" aria-live="polite">
                {fomErrorMessage && (
                    <ErrorMessage id={fomErrorId} aria-describedby={inputIdFom || fomFieldName} showIcon>
                        {resolvedLabelFom}: {fomErrorMessage}
                    </ErrorMessage>
                )}
                {tomErrorMessage && (
                    <ErrorMessage id={tomErrorId} aria-describedby={inputIdTom || tomFieldName} showIcon>
                        {resolvedLabelTom}: {tomErrorMessage}
                    </ErrorMessage>
                )}
                {groupErrorMessage && (
                    <ErrorMessage id={groupErrorId} aria-describedby={inputIdFom || name} showIcon={true}>
                        {groupErrorMessage}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};

export default PeriodevelgerFormik;
