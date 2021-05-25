import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import {Input, SkjemaGruppe} from 'nav-frontend-skjema';
import * as React from 'react';
import {Container, Row} from 'react-bootstrap';
import {IntlShape} from 'react-intl';
import './periodInput.less';
import {IPeriodeV2} from "../../models/types/PeriodeV2";

export interface IPeriodInputProps {
    periode: IPeriodeV2;
    intl: IntlShape;
    onChange: (periode: IPeriodeV2) => void;
    onBlur: (periode: IPeriodeV2) => void;
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
}

export const PeriodInput: React.FunctionComponent<IPeriodInputProps> = (props: IPeriodInputProps) => {
    const {periode, intl, onChange, onBlur, onFocus, disabled} = props;
    return <SkjemaGruppe feil={props.errorMessage} className={classNames('period-input', props.className)}>
        <Container>
            <Row noGutters={true}>
                <Input
                    id={props.inputIdFom}
                    bredde={"M"}
                    type="date"
                    label={intlHelper(intl, 'skjema.perioder.fom')}
                    className="bold-label"
                    value={periode?.fom || ''}
                    onChange={event => onChange({fom: event.target.value, tom: periode.tom})}
                    onBlur={event => onBlur({fom: event.target.value, tom: periode.tom})}
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
                    value={periode?.tom || ''}
                    onChange={event => onChange({fom: periode.fom, tom: event.target.value})}
                    onBlur={event => onBlur({fom: periode.fom, tom: event.target.value})}
                    onFocus={onFocus}
                    feil={props.errorMessageTom}
                    disabled={disabled || props.disabledTom}
                />
            </Row>
        </Container>
    </SkjemaGruppe>;
};
