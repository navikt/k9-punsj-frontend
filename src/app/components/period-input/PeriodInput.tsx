import React from 'react';

import { Fieldset, HStack } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';
import { IntlShape } from 'react-intl';

import { IPeriode } from '../../models/types/Periode';
import NewDateInput from '../skjema/NewDateInput/NewDateInput';

export interface IPeriodInputProps {
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
}

export const PeriodInput: React.FunctionComponent<IPeriodInputProps> = (props: IPeriodInputProps) => {
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

        // limitations,
    } = props;

    const handleOnChange = (selectedDate: string, isFom: boolean) => {
        const newPeriod = isFom
            ? { fom: selectedDate, tom: periode?.tom || '' }
            : { fom: periode?.fom || '', tom: selectedDate };
        onChange(newPeriod);
    };

    const handleOnBlur = (selectedDate: string, isFom: boolean) => {
        if (onBlur) {
            const newPeriod = isFom
                ? { fom: selectedDate, tom: periode?.tom || '' }
                : { fom: periode?.fom || '', tom: selectedDate };
            onBlur(newPeriod);
        }
    };

    // Vi sjekker om fom er en gyldig dato
    const isValidFromDate = periode.fom && new Date(periode.fom).toString() !== 'Invalid Date';
    const fromDateValue = isValidFromDate ? new Date(periode.fom!) : undefined;

    return (
        <Fieldset error={errorMessage} className={className} legend={undefined}>
            <HStack wrap gap="4" justify="center">
                <div data-testid="datePickerInputFom">
                    <NewDateInput
                        value={periode.fom || initialValues?.fom || ''}
                        onChange={(selectedDate) => handleOnChange(selectedDate, true)}
                        onBlur={(selectedDate) => handleOnBlur(selectedDate, true)}
                        id={inputIdFom}
                        inputDisabled={disabled || disabledFom}
                        errorMessage={errorMessageFom}
                        label={intlHelper(intl, 'skjema.perioder.fom')}
                        inputRef={fomInputRef}
                        // limitations={limitations}
                        dataTestId="fom"
                    />
                </div>

                <div data-testid="datePickerInputTom">
                    <NewDateInput
                        value={periode.tom || initialValues?.tom || ''}
                        onChange={(selectedDate) => handleOnChange(selectedDate, false)}
                        onBlur={(selectedDate) => handleOnBlur(selectedDate, false)}
                        id={inputIdTom}
                        inputDisabled={disabled || disabledTom}
                        errorMessage={errorMessageTom}
                        inputRef={tomInputRef}
                        // limitations={limitations}
                        label={intlHelper(intl, 'skjema.perioder.tom')}
                        dataTestId="tom"
                        fromDate={fromDateValue}
                        defaultMonth={fromDateValue}
                    />
                </div>
            </HStack>
        </Fieldset>
    );
};
