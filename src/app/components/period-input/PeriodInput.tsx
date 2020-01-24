import {IPeriode}            from 'app/models/types';
import intlHelper            from 'app/utils/intlUtils';
import classNames            from 'classnames';
import {Input, SkjemaGruppe} from 'nav-frontend-skjema';
import {SkjemaelementFeil}   from 'nav-frontend-skjema/lib/skjemaelement-feilmelding';
import * as React            from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {IntlShape}           from 'react-intl';
import './periodInput.less';

export interface IPeriodInputProps {
    periode: IPeriode;
    intl: IntlShape;
    onChange: (periode: IPeriode) => void;
    onBlur: (periode: IPeriode) => void;
    onFocus?: () => any;
    errorMessage?: SkjemaelementFeil;
    errorMessageFom?: SkjemaelementFeil;
    errorMessageTom?: SkjemaelementFeil;
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
            <Row>
                <Col>
                    <Input
                        id={props.inputIdFom}
                        type="date"
                        label={intlHelper(intl, 'skjema.perioder.fom')}
                        className="bold-label"
                        value={periode?.fraOgMed || ''}
                        onChange={event => onChange({fraOgMed: event.target.value, tilOgMed: periode.tilOgMed})}
                        onBlur={event => onBlur({fraOgMed: event.target.value, tilOgMed: periode.tilOgMed})}
                        onFocus={onFocus}
                        feil={props.errorMessageFom}
                        disabled={disabled || props.disabledFom}
                    />
                </Col>
                <Col>
                    <Input
                        id={props.inputIdTom}
                        type="date"
                        label={intlHelper(intl, 'skjema.perioder.tom')}
                        className="bold-label"
                        value={periode?.tilOgMed || ''}
                        onChange={event => onChange({fraOgMed: periode.fraOgMed, tilOgMed: event.target.value})}
                        onBlur={event => onBlur({fraOgMed: periode.fraOgMed, tilOgMed: event.target.value})}
                        onFocus={onFocus}
                        feil={props.errorMessageTom}
                        disabled={disabled || props.disabledTom}
                    />
                </Col>
            </Row>
        </Container>
    </SkjemaGruppe>;
};