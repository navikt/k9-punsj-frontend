import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import {Input, SkjemaGruppe} from 'nav-frontend-skjema';
import * as React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {IntlShape} from 'react-intl';
import {IPeriodeMedTimerMinutter} from "../../models/types/PeriodeV2";
import VerticalSpacer from "../VerticalSpacer";
import './oppholdInput.less'

export interface IOppholdInputProps {
    periodeMedTimerMinutter: IPeriodeMedTimerMinutter;
    intl: IntlShape;
    onChange: (periode: IPeriodeMedTimerMinutter) => void;
    onBlur: (periode: IPeriodeMedTimerMinutter) => void;
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

export const OppholdInput: React.FunctionComponent<IOppholdInputProps> = (props: IOppholdInputProps) => {
    const {periodeMedTimerMinutter, intl, onChange, onBlur, onFocus, disabled} = props;
    return <SkjemaGruppe feil={props.errorMessage} className={classNames('opphold-input', props.className)}>
        <Container className={"opphold"}>
            <Row noGutters={true}>
                <div className={"input-row"}>
                    <Input
                        id={props.inputIdFom}
                        bredde={"M"}
                        type="date"
                        label={intlHelper(intl, 'skjema.perioder.fom')}
                        className="bold-label"
                        value={periodeMedTimerMinutter.periode?.fom || ''}
                        onChange={event => onChange({
                            periode: {
                                fom: event.target.value,
                                tom: periodeMedTimerMinutter.periode?.tom
                            }
                        })}
                        onBlur={event => onBlur({
                            periode: {
                                fom: event.target.value,
                                tom: periodeMedTimerMinutter.periode?.tom
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
                        value={periodeMedTimerMinutter.periode?.tom || ''}
                        onChange={event => onChange({
                            periode: {
                                fom: periodeMedTimerMinutter.periode?.fom,
                                tom: event.target.value
                            }, timer: periodeMedTimerMinutter.timer,
                                minutter: periodeMedTimerMinutter.minutter
                        })}
                        onBlur={event => onBlur({
                            periode: {fom: periodeMedTimerMinutter.periode?.fom, tom: event.target.value},
                            timer: periodeMedTimerMinutter.timer,
                            minutter: periodeMedTimerMinutter.minutter
                        })}
                        onFocus={onFocus}
                        feil={props.errorMessageTom}
                        disabled={disabled || props.disabledTom}
                    />
                </div>
            </Row>
            <VerticalSpacer eightPx={true}/>
            <Row noGutters={true}>
                <p>{intlHelper(intl, "skjema.omsorgstilbud.gjennomsnittlig")}</p>
                <div className={"input-row"}>
                <Input
                    label={intlHelper(intl, 'skjema.perioder.timer')}
                    value={periodeMedTimerMinutter.timer}
                    bredde={"XS"}
                    className="timer"
                    onChange={event => onChange({
                        periode: {
                            fom: periodeMedTimerMinutter.periode?.fom,
                            tom: periodeMedTimerMinutter.periode?.tom
                        }, timer: event.target.value,
                        minutter: periodeMedTimerMinutter.minutter
                    })}
                    onBlur={event => onChange({
                        periode: {
                            fom: periodeMedTimerMinutter.periode?.fom,
                            tom: periodeMedTimerMinutter.periode?.tom
                        }, timer: event.target.value,
                        minutter: periodeMedTimerMinutter.minutter
                    })}
                    onFocus={onFocus}
                    feil={props.errorMessageTimer}
                />
                <Input
                    label={intlHelper(intl, 'skjema.perioder.minutter')}
                    value={periodeMedTimerMinutter.timer}
                    bredde={"XS"}
                    className="right"
                    onChange={event => onChange({
                        periode: {
                            fom: periodeMedTimerMinutter.periode?.fom,
                            tom: periodeMedTimerMinutter.periode?.tom
                        }, timer: periodeMedTimerMinutter.timer,
                        minutter: event.target.value
                    })}
                    onBlur={event => onChange({
                        periode: {
                            fom: periodeMedTimerMinutter.periode?.fom,
                            tom: periodeMedTimerMinutter.periode?.tom
                        }, timer: periodeMedTimerMinutter.timer,
                        minutter: event.target.value
                    })}
                    onFocus={onFocus}
                    feil={props.errorMessageTimer}
                />
                </div>
            </Row>
        </Container>
    </SkjemaGruppe>;
};
