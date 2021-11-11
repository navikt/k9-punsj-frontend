import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import * as React from 'react';
import { Container, Row } from 'react-bootstrap';
import { IntlShape } from 'react-intl';
import { IPeriode } from '../../models/types/Periode';
import DateInput from '../skjema/DateInput';
import './periodInput.less';

export interface IPeriodInputProps {
    periode: IPeriode;
    intl: IntlShape;
    onChange: (periode: IPeriode) => void;
    onBlur?: (periode: IPeriode) => void;
    onFocus?: () => any;
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
        periode,
        intl,
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
    } = props;

    const renderDato = (property: string) => {
        if (periode?.[property] && periode?.[property].length) return periode?.[property];
        if (typeof initialValues !== 'undefined' && typeof initialValues[property] !== 'undefined')
            return initialValues?.[property];
        return '';
    };

    return (
        <SkjemaGruppe feil={errorMessage} className={classNames('periodInput', className)}>
            <Container>
                <Row noGutters>
                    <DateInput
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
                            label={intlHelper(intl, 'skjema.perioder.tom')}
                        />
                    </div>
                </Row>
            </Container>
        </SkjemaGruppe>
    );
};
