import classNames from 'classnames';
import React from 'react';
import { IntlShape } from 'react-intl';

import { Fieldset } from '@navikt/ds-react';

import intlHelper from 'app/utils/intlUtils';

import { IPeriode } from '../../models/types/Periode';
import DateInput, { DateInputProps } from '../skjema/DateInput';
import './periodInput.less';

export interface IPeriodInputProps extends Partial<Omit<DateInputProps, 'onChange' | 'onBlur'>> {
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
        limitations,
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

    return (
        <Fieldset error={errorMessage} className={classNames('periodInput', className)} legend={undefined}>
            <div className="flex flex-wrap">
                <DateInput
                    className="periodInput__fom-container"
                    value={periode.fom || initialValues?.fom || ''}
                    onChange={(selectedDate) => handleOnChange(selectedDate, true)}
                    onBlur={(selectedDate) => handleOnBlur(selectedDate, true)}
                    id={inputIdFom}
                    disabled={disabled || disabledFom}
                    errorMessage={errorMessageFom}
                    label={intlHelper(intl, 'skjema.perioder.fom')}
                    inputRef={fomInputRef}
                    limitations={limitations}
                />
                <div className="periodInput__tom-container">
                    <DateInput
                        value={periode.tom || initialValues?.tom || ''}
                        onChange={(selectedDate) => handleOnChange(selectedDate, false)}
                        onBlur={(selectedDate) => handleOnBlur(selectedDate, false)}
                        id={inputIdTom}
                        disabled={disabled || disabledTom}
                        errorMessage={errorMessageTom}
                        limitations={limitations}
                        label={intlHelper(intl, 'skjema.perioder.tom')}
                    />
                </div>
            </div>
        </Fieldset>
    );
};
