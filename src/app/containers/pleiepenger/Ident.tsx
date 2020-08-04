import {IPunchPageComponentState}                                        from 'app/containers/pleiepenger/PunchPage';
import {JaNei, PunchStep}                       from 'app/models/enums';
import {IPleiepengerPunchState, ISignaturState} from 'app/models/types';
import {IdentRules}                             from 'app/rules';
import {setSignaturAction, setStepAction, usignert, usignertResetAction} from 'app/state/actions';
import {RootStateType}                                                   from 'app/state/RootState';
import {setHash}                                                         from 'app/utils';
import intlHelper                                                        from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess}                             from 'nav-frontend-alertstriper';
import {Knapp}                                                           from 'nav-frontend-knapper';
import {RadioPanelGruppe}                                                from 'nav-frontend-skjema';
import NavFrontendSpinner                                                from 'nav-frontend-spinner';
import * as React                                                        from 'react';
import {Col, Container, Row}                                             from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}                               from 'react-intl';
import {connect}                                                         from 'react-redux';

export interface IIdentStateProps {
    punchState:     IPleiepengerPunchState,
    signaturState:  ISignaturState
}

export interface IIdentDispatchProps {
    setStepAction:          typeof setStepAction;
    setSignaturAction:      typeof setSignaturAction;
    usignert:               typeof usignert;
    usignertResetAction:    typeof usignertResetAction;
}

export interface IIdentComponentProps {
    identInput:         (disabled: boolean) => React.ReactElement;
    identInputValues:   Pick<IPunchPageComponentState, 'ident1' | 'ident2'>;
    findSoknader:       () => void;
    getPunchPath:       (step: PunchStep) => string;
}

type IIdentProps = IIdentStateProps & IIdentDispatchProps & IIdentComponentProps & WrappedComponentProps;

export const IdentComponent: React.FunctionComponent<IIdentProps> = (props: IIdentProps) => {

    const {intl, signaturState, punchState, identInputValues} = props;
    const {signert} = signaturState;

    React.useEffect(() => {props.setStepAction(PunchStep.IDENT)}, []);

    if (signaturState.usignertRequestError) {
        return <div className="ident-page">
            <AlertStripeFeil>{intlHelper(intl, 'ident.usignert.feil.melding')}</AlertStripeFeil>
            <Knapp className="knapp-tilbake" onClick={props.usignertResetAction}>{intlHelper(intl, 'ident.usignert.feil.tilbake')}</Knapp>
        </div>;
    }

    if (signaturState.isAwaitingUsignertRequestResponse) {
        return <Container style={{height: '100%'}} className="ident-page">
            <Row className="justify-content-center align-items-center" style={{height: '100%'}}>
                <Col xs={'auto'}><NavFrontendSpinner/></Col>
            </Row>
        </Container>;
    }

    if (signaturState.usignertRequestSuccess) {
        return <div className="ident-page">
            <AlertStripeSuksess>{intlHelper(intl, 'ident.usignert.sendt')}</AlertStripeSuksess>
        </div>;
    }

    return <div className="ident-page">
        <h2>{intlHelper(intl, 'ident.signatur.overskrift')}</h2>
        <RadioPanelGruppe
            className="horizontalRadios"
            radios={Object.values(JaNei).map(jn => ({label: intlHelper(intl, jn), value: jn}))}
            name="signatur"
            legend={intlHelper(intl, 'ident.signatur.etikett')}
            checked={signert || undefined}
            onChange={event => props.setSignaturAction((event.target as HTMLInputElement).value as JaNei || null)}
        />
        {signert === JaNei.NEI && <Knapp
            className="knapp-usignert"
            onClick={() => props.usignert(punchState.journalpost!.journalpostId)}
        >{intlHelper(intl, 'ident.knapp.usignert')}</Knapp>}
        <h2>{intlHelper(intl, 'ident.identifikasjon.overskrift')}</h2>
        {props.identInput(signert !== JaNei.JA)}
        <div className="knapperad">
            <Knapp
                onClick={() => setHash('/')}
                className="knapp knapp1"
            >{intlHelper(intl, 'ident.knapp.forrigesteg')}</Knapp>
            <Knapp
                onClick={props.findSoknader}
                className="knapp knapp2"
                disabled={signert !== JaNei.JA || !IdentRules.areIdentsValid(identInputValues.ident1, identInputValues.ident2)}
            >{intlHelper(intl, 'ident.knapp.nestesteg')}</Knapp>
        </div>
    </div>;
};

const mapStateToProps = (state: RootStateType) => ({
    punchState:     state.punchState,
    signaturState:  state.signaturState
});

const mapDispatchToProps = (dispatch: any) => ({
    setStepAction:          (step: number)          => dispatch(setStepAction(step)),
    setSignaturAction:      (signert: JaNei | null) => dispatch(setSignaturAction(signert)),
    usignert:               (journalpostid: string) => dispatch(usignert(journalpostid)),
    usignertResetAction:    ()                      => dispatch(usignertResetAction())
});

export const Ident = injectIntl(connect(mapStateToProps, mapDispatchToProps)(IdentComponent));
