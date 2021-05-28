import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import {Input, SkjemaGruppe} from 'nav-frontend-skjema';
import * as React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {IntlShape} from 'react-intl';
import './arbeidstidInput.less';
import {IArbeidstidPeriodeMedTimer} from "../../models/types/PeriodeV2";

export interface IArbeidstidInputProps {
    periodeMedTimer: IArbeidstidPeriodeMedTimer;
    intl: IntlShape;
    onChange: (periode: IArbeidstidPeriodeMedTimer) => void;
    onBlur: (periode: IArbeidstidPeriodeMedTimer) => void;
    onFocus?: () => any;
    errorMessage?: React.ReactNode | boolean;
    errorMessageFom?: React.ReactNode | boolean;
    errorMessageTom?: React.ReactNode | boolean;
    errorMessageTimer?: React.ReactNode | boolean;
    disabled?: boolean;
    disabledFom?: boolean;
    disabledTom?: boolean;
    inputIdFom?: string;
    inputIdTom?: string;
    className?: string;
}

export const ArbeidstidInput: React.FunctionComponent<IArbeidstidInputProps> = (props: IArbeidstidInputProps) => {
    const {periodeMedTimer, intl, onChange, onBlur, onFocus, disabled} = props;
    return <SkjemaGruppe feil={props.errorMessage} className={classNames('arbeidstid-input', props.className)}>
        <Container>
            <Row>
                <div className={"input-row"}>
                    <Input
                        id={props.inputIdFom}
                        bredde={"M"}
                        type="date"
                        label={intlHelper(intl, 'skjema.perioder.fom')}
                        className="bold-label"
                        value={periodeMedTimer.periode?.fom || ''}
                        onChange={event => onChange({
                            periode: {
                                fom: event.target.value,
                                tom: periodeMedTimer.periode?.tom
                            }
                        })}
                        onBlur={event => onBlur({
                            periode: {
                                fom: event.target.value,
                                tom: periodeMedTimer.periode?.tom
                            }
                        })}
                        onFocus={onFocus}
                        feil={props.errorMessageFom}
                        disabled={disabled || props.disabledFom}
                    />
                    <Input
                        id={props.inputIdTom}
                        bredde={"M"}
                        type="date"
                        label={intlHelper(intl, 'skjema.perioder.tom')}
                        className="right"
                        value={periodeMedTimer.periode?.tom || ''}
                        onChange={event => onChange({
                            periode: {
                                fom: periodeMedTimer.periode?.fom,
                                tom: event.target.value
                            }, faktiskArbeidTimerPerDag: periodeMedTimer.faktiskArbeidTimerPerDag
                        })}
                        onBlur={event => onBlur({
                            periode: {fom: periodeMedTimer.periode?.fom, tom: event.target.value},
                            faktiskArbeidTimerPerDag: periodeMedTimer.faktiskArbeidTimerPerDag
                        })}
                        onFocus={onFocus}
                        feil={props.errorMessageTom}
                        disabled={disabled || props.disabledTom}
                    />
                </div>

            </Row>
            <Row>
                <Input
                    label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerfaktisk')}
                    value={periodeMedTimer.faktiskArbeidTimerPerDag}
                    bredde={"XS"}
                    className="timer"
                    onChange={event => onChange({
                        periode: {
                            fom: periodeMedTimer.periode?.fom,
                            tom: periodeMedTimer.periode?.tom
                        }, faktiskArbeidTimerPerDag: event.target.value
                    })}
                    onBlur={event => onChange({
                        periode: {
                            fom: periodeMedTimer.periode?.fom,
                            tom: periodeMedTimer.periode?.tom
                        }, faktiskArbeidTimerPerDag: event.target.value
                    })}
                    onFocus={onFocus}
                    feil={props.errorMessageTimer}
                />
            </Row>
        </Container>
    </SkjemaGruppe>;
};
