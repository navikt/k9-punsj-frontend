import {PunchStep, Sakstype}                        from 'app/models/enums';
import {IFordelingState, IPunchState}               from 'app/models/types';
import {omfordel, setSakstypeAction, setStepAction} from 'app/state/actions';
import {RootStateType}                              from 'app/state/RootState';
import {setHash}                                    from 'app/utils';
import intlHelper                                   from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess}        from 'nav-frontend-alertstriper';
import {Knapp}                          from 'nav-frontend-knapper';
import {Radio, RadioGruppe, RadioPanel} from 'nav-frontend-skjema';
import NavFrontendSpinner               from 'nav-frontend-spinner';
import React, {useEffect, useState}        from 'react';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {connect}                                    from 'react-redux';

export interface IFordelingStateProps {
    punchState: IPunchState;
    fordelingState: IFordelingState;
}

export interface IFordelingDispatchProps {
    setStepAction:      typeof setStepAction;
    setSakstypeAction:  typeof setSakstypeAction;
    omfordel:           typeof omfordel;
}

export interface IFordelingComponentProps {
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

    const [omsorgspengerValgt, setOmsorgspengerValgt] = useState<boolean>(false);

    if (fordelingState.isAwaitingOmfordelingResponse) {
        return <NavFrontendSpinner/>;
    }

    if (fordelingState.omfordelingDone) {
        return <AlertStripeSuksess>{intlHelper(intl, 'fordeling.omfordeling.utfort')}</AlertStripeSuksess>;
    }

    return <div className="fordeling-page">
        {!!fordelingState.omfordelingError &&
        <AlertStripeFeil>{intlHelper(intl, 'fordeling.omfordeling.feil')}</AlertStripeFeil>
        }
        <RadioGruppe
            legend={intlHelper(intl, 'fordeling.overskrift')}
            className="fordeling-page__options"
        >
            {Object.keys(Sakstype).filter(key => !key.includes(`${Sakstype.OMSORGSPENGER}_`)).map(key => {
                if (key === Sakstype.OMSORGSPENGER) {
                    const radioOmsorgspenger = (
                        <RadioPanel
                            key={key}
                            label={intlHelper(intl, `fordeling.sakstype.${Sakstype[key]}`)}
                            value={Sakstype[key]}
                            onChange={() => {
                                setOmsorgspengerValgt(true);
                                props.setSakstypeAction(undefined);
                            }}
                            checked={omsorgspengerValgt}
                        />
                    );
                    if (omsorgspengerValgt) {
                        return (
                            <React.Fragment key={key}>
                                {radioOmsorgspenger}
                                <RadioGruppe className="omsorgspenger-radios">
                                    {Object.keys(Sakstype)
                                        .filter(sakstypenavn => sakstypenavn.includes(`${Sakstype.OMSORGSPENGER}_`))
                                        .map(sakstypenavn => (
                                            <Radio
                                                key={sakstypenavn}
                                                label={intlHelper(intl, `fordeling.sakstype.${Sakstype[sakstypenavn]}`)}
                                                value={Sakstype[sakstypenavn]}
                                                onChange={() => props.setSakstypeAction(Sakstype[sakstypenavn])}
                                                name="sakstype"
                                                checked={Sakstype[sakstypenavn] === sakstype}
                                            />
                                        ))
                                    }
                                </RadioGruppe>
                            </React.Fragment>
                        );
                    }
                    return radioOmsorgspenger;
                }
                return (
                    <RadioPanel
                        key={key}
                        label={intlHelper(intl, `fordeling.sakstype.${Sakstype[key]}`)}
                        value={Sakstype[key]}
                        onChange={() => {
                            props.setSakstypeAction(Sakstype[key]);
                            setOmsorgspengerValgt(false);
                        }}
                        checked={sakstype === key}
                    />
                );
            })}
        </RadioGruppe>
        {sakstype === Sakstype.PLEIEPENGER_SYKT_BARN
            ? <Knapp onClick={punch}>{intlHelper(intl, 'fordeling.knapp.punsj')}</Knapp>
            : (
                <Knapp onClick={() => props.omfordel(props.punchState.journalpost!.journalpostId, sakstype)}>
                    {intlHelper(intl, 'fordeling.knapp.omfordel')}
                </Knapp>
            )
        }
    </div>;
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
