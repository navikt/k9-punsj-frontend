import {PunchStep, Sakstype}              from 'app/models/enums';
import {IFordelingState, IPunchState}     from 'app/models/types';
import {setSakstypeAction, setStepAction} from 'app/state/actions';
import {RootStateType}                    from 'app/state/RootState';
import {changePath}                       from 'app/utils';
import intlHelper                         from 'app/utils/intlUtils';
import {Knapp}                            from 'nav-frontend-knapper';
import {RadioPanelGruppe}                 from 'nav-frontend-skjema';
import React, {useEffect}                 from 'react';
import {InjectedIntlProps, injectIntl}    from 'react-intl';
import {connect}                          from 'react-redux';

interface IFordelingStateProps {
    punchState:     IPunchState;
    fordelingState: IFordelingState;
}

interface IFordelingDispatchProps {
    setStepAction:      typeof setStepAction;
    setSakstypeAction:  typeof setSakstypeAction;
}

interface IFordelingComponentProps {
    getPunchPath: (step: PunchStep) => string;
}

type IFordelingProps = InjectedIntlProps &
                       IFordelingStateProps &
                       IFordelingDispatchProps
                       & IFordelingComponentProps;

const Fordeling: React.FunctionComponent<IFordelingProps> = (props: IFordelingProps) => {

    const {intl} = props;
    const {sakstype} = props.fordelingState;

    const punch = () => changePath(props.getPunchPath(PunchStep.IDENT));

    useEffect(() => {props.setStepAction(PunchStep.FORDELING)}, []);

    return <>
        <RadioPanelGruppe
            name="fordeling"
            legend={intlHelper(intl, 'fordeling.overskrift')}
            radios={Object.keys(Sakstype).map(key => ({
                label: intlHelper(intl,`fordeling.sakstype.${Sakstype[key]}`),
                value: Sakstype[key]
            }))}
            onChange={event => props.setSakstypeAction((event.target as HTMLInputElement).value as Sakstype)}
            checked={sakstype}
        />
        {sakstype === Sakstype.PPSB
            ? <Knapp onClick={punch}>Pønsj søknad</Knapp>
            : <Knapp>Omfordel</Knapp>}
    </>;
};

const mapStateToProps = (state: RootStateType) => ({
    punchState:     state.punchState,
    fordelingState: state.fordelingState
});

const mapDispatchToProps = (dispatch: any) => ({
    setStepAction:      (step: PunchStep)       => dispatch(setStepAction(step)),
    setSakstypeAction:  (sakstype: Sakstype)    => dispatch(setSakstypeAction(sakstype))
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Fordeling));