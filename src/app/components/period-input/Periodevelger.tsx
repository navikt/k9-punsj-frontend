import React from 'react';
import { ErrorMessage } from '@navikt/ds-react';
import { isISODateString } from 'app/utils/date/dateFormat';
import intlHelper from 'app/utils/intlUtils';
import { IntlShape } from 'react-intl';

import { IPeriode } from '../../models/types/Periode';
import Datovelger from '../skjema/Datovelger/Datovelger';

export interface PeriodevelgerProps {
    intl: IntlShape;
    periode: IPeriode;
    onChange: (periode: IPeriode) => void;
    onBlur?: (periode: IPeriode) => void;
    errorMessage?: React.ReactNode | boolean;
    errorMessageFom?: React.ReactNode | boolean;
    errorMessageTom?: React.ReactNode | boolean;
    disabled?: boolean;
    disabledFom?: boolean;
    disabledTom?: boolean;
    inputIdFom?: string;
    inputIdTom?: string;
    className?: string;
    initialValues?: {
        fom: string | undefined;
        tom: string | undefined;
    };
    fomInputRef?: React.Ref<HTMLInputElement>;
    tomInputRef?: React.Ref<HTMLInputElement>;
    size?: 'small' | 'medium';
    action?: React.ReactNode;
    labelFom?: string;
    labelTom?: string;
}

const PERIOD_RANGE_ERROR_MESSAGE = 'Startdato må være før sluttdato.';

const Periodevelger: React.FC<PeriodevelgerProps> = ({
    intl,
    periode,
    onChange,
    fromDate,
    toDate,
    disabled,
    initialValues,
    errorMessage,
    className,
    inputIdFom,
    inputIdTom,
    disabledFom,
    disabledTom,
    errorMessageFom,
    errorMessageTom,
    onBlur,
    fomInputRef,
    tomInputRef,
    size,
    action,
    labelFom,
    labelTom,
}) => {
    const normalizedPeriode = {
        fom: typeof periode?.fom === 'string' ? periode.fom : initialValues?.fom || '',
        tom: typeof periode?.tom === 'string' ? periode.tom : initialValues?.tom || '',
    };
    const rootClassName = className ? `flex flex-col gap-2 ${className}` : 'flex flex-col gap-2';
    const [fomLocalError, setFomLocalError] = React.useState<string | undefined>(undefined);
    const [tomLocalError, setTomLocalError] = React.useState<string | undefined>(undefined);
    const fomErrorId = `${inputIdFom || 'fom'}-error`;
    const tomErrorId = `${inputIdTom || 'tom'}-error`;
    const groupErrorId = `${inputIdFom || inputIdTom || 'periode'}-error`;
    const hasRangeError =
        isISODateString(normalizedPeriode.fom) &&
        isISODateString(normalizedPeriode.tom) &&
        normalizedPeriode.tom < normalizedPeriode.fom;
    const effectiveToDate = isISODateString(normalizedPeriode.tom)
        ? toDate && toDate < new Date(normalizedPeriode.tom)
            ? toDate
            : new Date(normalizedPeriode.tom)
        : toDate;
    const effectiveFromDate = isISODateString(normalizedPeriode.fom)
        ? fromDate && fromDate > new Date(normalizedPeriode.fom)
            ? fromDate
            : new Date(normalizedPeriode.fom)
        : fromDate;
    const fomErrorMessage = fomLocalError || (typeof errorMessageFom === 'string' ? errorMessageFom : undefined);
    const tomErrorMessage = tomLocalError || (typeof errorMessageTom === 'string' ? errorMessageTom : undefined);
    const groupErrorMessage =
        typeof errorMessage === 'string' ? errorMessage : hasRangeError ? PERIOD_RANGE_ERROR_MESSAGE : undefined;
    const resolvedLabelFom = labelFom || intlHelper(intl, 'skjema.perioder.fom');
    const resolvedLabelTom = labelTom || intlHelper(intl, 'skjema.perioder.tom');

    const handleOnChange = (selectedDate: string, isFom: boolean) => {
        const newPeriod = isFom
            ? { fom: selectedDate, tom: normalizedPeriode.tom || '' }
            : { fom: normalizedPeriode.fom || '', tom: selectedDate };
        onChange(newPeriod);
    };

    const handleOnBlur = (selectedDate: string, isFom: boolean) => {
        if (onBlur) {
            const newPeriod = isFom
                ? { fom: selectedDate, tom: normalizedPeriode.tom || '' }
                : { fom: normalizedPeriode.fom || '', tom: selectedDate };
            onBlur(newPeriod);
        }
    };

    return (
        <div className={rootClassName}>
            <div className="flex items-end gap-4 flex-wrap">
                <div className="flex gap-4 flex-wrap">
                    {/* Vi beholder to separate kalendere her fordi saksbehandlere opplevde felles range-picker som mindre praktisk i Punsj. */}
                    <Datovelger
                        value={normalizedPeriode.fom}
                        onChange={(selectedDate) => handleOnChange(selectedDate, true)}
                        onBlur={(selectedDate) => handleOnBlur(selectedDate, true)}
                        id={inputIdFom}
                        disabled={disabled || disabledFom}
                        fromDate={fromDate}
                        toDate={effectiveToDate}
                        errorMessage={!!fomErrorMessage}
                        label={resolvedLabelFom}
                        inputRef={fomInputRef}
                        dataTestId="fom"
                        size={size}
                        visFeilmelding={false}
                        errorAriaDescribedBy={[
                            fomErrorMessage ? fomErrorId : undefined,
                            groupErrorMessage ? groupErrorId : undefined,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onErrorMessageChange={setFomLocalError}
                    />
                    <Datovelger
                        value={normalizedPeriode.tom}
                        onChange={(selectedDate) => handleOnChange(selectedDate, false)}
                        onBlur={(selectedDate) => handleOnBlur(selectedDate, false)}
                        id={inputIdTom}
                        disabled={disabled || disabledTom}
                        fromDate={effectiveFromDate}
                        toDate={toDate}
                        errorMessage={!!tomErrorMessage}
                        inputRef={tomInputRef}
                        label={resolvedLabelTom}
                        dataTestId="tom"
                        defaultMonth={
                            isISODateString(normalizedPeriode.fom) ? new Date(normalizedPeriode.fom) : undefined
                        }
                        size={size}
                        visFeilmelding={false}
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
                    <ErrorMessage id={fomErrorId} aria-describedby={inputIdFom} showIcon>
                        {resolvedLabelFom}: {fomErrorMessage}
                    </ErrorMessage>
                )}
                {tomErrorMessage && (
                    <ErrorMessage id={tomErrorId} aria-describedby={inputIdTom} showIcon>
                        {resolvedLabelTom}: {tomErrorMessage}
                    </ErrorMessage>
                )}
                {groupErrorMessage && (
                    <ErrorMessage id={groupErrorId} aria-describedby={inputIdFom || inputIdTom} showIcon>
                        {groupErrorMessage}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};

export default Periodevelger;
