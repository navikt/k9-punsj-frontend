import React from 'react';
import { ErrorMessage } from '@navikt/ds-react';

import intlHelper from 'app/utils/intlUtils';
import { IntlShape } from 'react-intl';

import { IPeriode } from '../../models/types/Periode';
import DatovelgerControlled from '../skjema/Datovelger/DatovelgerControlled';

export interface PeriodevelgerControlledProps {
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
}

export const PeriodevelgerControlled: React.FunctionComponent<PeriodevelgerControlledProps> = (
    props: PeriodevelgerControlledProps,
) => {
    const {
        intl,
        periode,
        onChange,
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

        // limitations,
    } = props;

    const normalizedPeriode = {
        fom: typeof periode?.fom === 'string' ? periode.fom : initialValues?.fom || '',
        tom: typeof periode?.tom === 'string' ? periode.tom : initialValues?.tom || '',
    };
    const isValidFromDate = normalizedPeriode.fom && new Date(normalizedPeriode.fom).toString() !== 'Invalid Date';
    const fromDateValue = isValidFromDate ? new Date(normalizedPeriode.fom) : undefined;
    const rootClassName = className ? `flex flex-col gap-2 ${className}` : 'flex flex-col gap-2';
    const sharedErrorMessage = errorMessage || (typeof errorMessageFom === 'string' ? errorMessageFom : undefined) || (typeof errorMessageTom === 'string' ? errorMessageTom : undefined);

    return (
        <div className={rootClassName}>
            <div className="flex items-end gap-4 flex-wrap">
                <div className="flex gap-4 flex-wrap">
                    {/* Vi beholder to separate kalendere her fordi saksbehandlere opplevde felles range-picker som mindre praktisk i Punsj. */}
                    <div data-testid="datePickerInputFom">
                        <DatovelgerControlled
                            value={normalizedPeriode.fom}
                            onChange={(selectedDate) => onChange({ fom: selectedDate, tom: normalizedPeriode.tom || '' })}
                            onBlur={(selectedDate) => onBlur?.({ fom: selectedDate, tom: normalizedPeriode.tom || '' })}
                            id={inputIdFom}
                            disabled={disabled || disabledFom}
                            errorMessage={!!errorMessageFom}
                            label={intlHelper(intl, 'skjema.perioder.fom')}
                            inputRef={fomInputRef}
                            dataTestId="fom"
                            size={size}
                        />
                    </div>
                    <div data-testid="datePickerInputTom">
                        <DatovelgerControlled
                            value={normalizedPeriode.tom}
                            onChange={(selectedDate) => onChange({ fom: normalizedPeriode.fom || '', tom: selectedDate })}
                            onBlur={(selectedDate) => onBlur?.({ fom: normalizedPeriode.fom || '', tom: selectedDate })}
                            id={inputIdTom}
                            disabled={disabled || disabledTom}
                            errorMessage={!!errorMessageTom}
                            inputRef={tomInputRef}
                            label={intlHelper(intl, 'skjema.perioder.tom')}
                            dataTestId="tom"
                            fromDate={fromDateValue}
                            defaultMonth={fromDateValue}
                            size={size}
                        />
                    </div>
                </div>
                {action && <div className="flex self-stretch items-end">{action}</div>}
            </div>
            <div>
                {sharedErrorMessage && typeof sharedErrorMessage !== 'boolean' && (
                    <ErrorMessage aria-describedby={inputIdFom || inputIdTom} showIcon>
                        {sharedErrorMessage}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};
