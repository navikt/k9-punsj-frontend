import classNames from 'classnames';
import * as React from 'react';
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

    const renderDato = (property: string) => {
        if (periode?.[property] && periode?.[property].length) return periode?.[property];
        if (typeof initialValues !== 'undefined' && typeof initialValues[property] !== 'undefined')
            return initialValues?.[property];
        return '';
    };

    return (
        <Fieldset feil={errorMessage} className={classNames('periodInput', className)}>
            <div className="flex flex-wrap">
                <DateInput
                    className="periodInput__fom-container"
                    value={renderDato('fom')}
                    onChange={(selectedDate) => {
                        onChange({ fom: selectedDate, tom: periode?.tom || '' });
                        if (onBlur) {
                            onBlur({ fom: selectedDate, tom: periode?.tom || '' });
                        }
                    }}
                    id={inputIdFom}
                    disabled={disabled || disabledFom}
                    errorMessage={errorMessageFom}
                    label={intlHelper(intl, 'skjema.perioder.fom')}
                    inputRef={fomInputRef}
                    limitations={limitations}
                />
                <div className="periodInput__tom-container">
                    <DateInput
                        value={renderDato('tom')}
                        onChange={(selectedDate) => {
                            onChange({ fom: periode?.fom || '', tom: selectedDate });
                            if (onBlur) {
                                onBlur({ fom: periode?.fom || '', tom: selectedDate });
                            }
                        }}
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
