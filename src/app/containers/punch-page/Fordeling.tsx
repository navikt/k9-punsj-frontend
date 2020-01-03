import {PunchStep, Sakstype}                        from 'app/models/enums';
import {IFordelingState, IPunchState}               from 'app/models/types';
import {omfordel, setSakstypeAction, setStepAction} from 'app/state/actions';
import {RootStateType}                              from 'app/state/RootState';
import {setHash}                                    from 'app/utils';
import intlHelper                                   from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess}        from 'nav-frontend-alertstriper';
import {Knapp}                                      from 'nav-frontend-knapper';
import {RadioPanelGruppe}                           from 'nav-frontend-skjema';
import NavFrontendSpinner                           from 'nav-frontend-spinner';
import React, {useEffect}                           from 'react';
import {injectIntl, WrappedComponentProps}          from 'react-intl';
import {connect}                                    from 'react-redux';

interface IFordelingStateProps {
    punchState: IPunchState;
    fordelingState: IFordelingState;
}

interface IFordelingDispatchProps {
    setStepAction:      typeof setStepAction;
    setSakstypeAction:  typeof setSakstypeAction;
    omfordel:           typeof omfordel;
}

interface IFordelingComponentProps {
    getPunchPath: (step: PunchStep) => string;
}

type IFordelingProps = WrappedComponentProps &
                       IFordelingStateProps &
                       IFordelingDispatchProps &
                       IFordelingComponentProps;

const FordelingComponent: React.FunctionComponent<IFordelingProps> = (props: IFordelingProps) => {

    const {intl, fordelingState} = props;
    const {sakstype} = fordelingState;

    const punch = () => setHash(props.getPunchPath(PunchStep.IDENT));

    useEffect(() => {props.setStepAction(PunchStep.FORDELING);}, []);

    if (fordelingState.isAwaitingOmfordelingResponse) {
        return <NavFrontendSpinner/>;
    }

    if (fordelingState.omfordelingDone) {
        return <AlertStripeSuksess>Journalposten er omfordelt.</AlertStripeSuksess>;
    }

    return <>
        {!!fordelingState.omfordelingError && <AlertStripeFeil>Det oppsto en feil. Prøv igjen senere.</AlertStripeFeil>}
        <RadioPanelGruppe
            name="fordeling"
            legend={intlHelper(intl, 'fordeling.overskrift')}
            radios={Object.keys(Sakstype).map(key => ({
                label: intlHelper(intl, `fordeling.sakstype.${Sakstype[key]}`),
                value: Sakstype[key]
            }))}
            onChange={event => props.setSakstypeAction((event.target as HTMLInputElement).value as Sakstype)}
            checked={sakstype}
        />
        {sakstype === Sakstype.PLEIEPENGER_SYKT_BARN
            ? <Knapp onClick={punch}>{intlHelper(intl, 'fordeling.knapp.punsj')}</Knapp>
            : <Knapp onClick={() => props.omfordel(props.punchState.journalpost!.journalpost_id, sakstype)}>{intlHelper(intl, 'fordeling.knapp.omfordel')}</Knapp>}
    </>;
};

const mapStateToProps = (state: RootStateType) => ({
    punchState: state.punchState,
    fordelingState: state.fordelingState
});

const mapDispatchToProps = (dispatch: any) => ({
    setStepAction:      (step: PunchStep)       => dispatch(setStepAction(step)),
    setSakstypeAction:  (sakstype: Sakstype)    => dispatch(setSakstypeAction(sakstype)),
    omfordel:           (journalpostid: string,
                         sakstype: Sakstype)    => dispatch(omfordel(journalpostid, sakstype))
});

const Fordeling = injectIntl(connect(mapStateToProps, mapDispatchToProps)(FordelingComponent));

export {Fordeling, FordelingComponent};