import {Sakstype}                                            from 'app/models/enums';
import {IFordelingState, IPleiepengerPunchState}             from 'app/models/types';
import {omfordel as omfordelAction, setSakstypeAction}       from 'app/state/actions';
import {RootStateType}                                       from 'app/state/RootState';
import intlHelper                                            from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess}                 from 'nav-frontend-alertstriper';
import {Knapp}                                               from 'nav-frontend-knapper';
import Panel                                                 from 'nav-frontend-paneler';
import {Radio, RadioGruppe, RadioPanel}                      from 'nav-frontend-skjema';
import NavFrontendSpinner                                    from 'nav-frontend-spinner';
import React, {useMemo, useState}                            from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {connect}                                             from 'react-redux';
import PdfVisning                                            from '../../components/pdf/PdfVisning';
import {ISakstypeDefault, ISakstypePunch}                    from '../../models/Sakstype';
import {Sakstyper}                                           from '../../sakstype/SakstypeImpls';
import {setHash}                                             from '../../utils';
import './fordeling.less';

export interface IFordelingStateProps {
    punchState: IPleiepengerPunchState;
    fordelingState: IFordelingState;
    journalpostId: string;
}

export interface IFordelingDispatchProps {
    setSakstypeAction:  typeof setSakstypeAction;
    omfordel:           typeof omfordelAction;
}

type IFordelingProps = WrappedComponentProps &
                       IFordelingStateProps &
                       IFordelingDispatchProps;

type BehandlingsknappProps = Pick<IFordelingProps, 'omfordel' | 'punchState'> & {
    sakstypeConfig?: ISakstypeDefault
}

const Behandlingsknapp: React.FunctionComponent<BehandlingsknappProps> = ({ sakstypeConfig, omfordel, punchState }) => {
    if (!sakstypeConfig) {
        return null;
    }

    if ((sakstypeConfig as ISakstypePunch).punchPath) {
        const punchConfig = sakstypeConfig as ISakstypePunch;

        return (
            <Knapp onClick={() => setHash(punchConfig.punchPath)}>
                <FormattedMessage id="fordeling.knapp.punsj" />
            </Knapp>
        )
    }

    return (
        <Knapp onClick={() => omfordel(punchState.journalpost!.journalpostId, sakstypeConfig.navn)}>
            <FormattedMessage id="fordeling.knapp.omfordel" />
        </Knapp>
    );
};

const FordelingComponent: React.FunctionComponent<IFordelingProps> = (props: IFordelingProps) => {
    const {intl, fordelingState, omfordel, punchState} = props;
    const {sakstype} = fordelingState;
    const sakstyper: ISakstypeDefault[] = useMemo(() =>
        [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
        []
    );
    const konfigForValgtSakstype = useMemo(() => sakstyper.find(st => st.navn === sakstype), [sakstype]);

    const [omsorgspengerValgt, setOmsorgspengerValgt] = useState<boolean>(false);

    if (fordelingState.isAwaitingOmfordelingResponse) {
        return <NavFrontendSpinner/>;
    }

    if (fordelingState.omfordelingDone) {
        return <AlertStripeSuksess>{intlHelper(intl, 'fordeling.omfordeling.utfort')}</AlertStripeSuksess>;
    }

    return (
        <div className="fordeling-container">
            <Panel border={true} className="panel-form">
                <div className="fordeling-page">
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
                                                            checked={Sakstype[sakstypenavn] === konfigForValgtSakstype?.navn}
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
                                    checked={konfigForValgtSakstype?.navn === key}
                                />
                            );
                        })}
                    </RadioGruppe>
                    <Behandlingsknapp
                        sakstypeConfig={konfigForValgtSakstype}
                        omfordel={omfordel}
                        punchState={punchState}
                    />
                </div>
            </Panel>
            <PdfVisning
                dokumenter={punchState.journalpost!.dokumenter}
                journalpostId={punchState.journalpost!.journalpostId}
            />
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    punchState: state.punchState,
    fordelingState: state.fordelingState
});

const mapDispatchToProps = (dispatch: any) => ({
    setSakstypeAction:  (sakstype: Sakstype)    => dispatch(setSakstypeAction(sakstype)),
    omfordel:           (journalpostid: string,
                         sakstype: Sakstype)    => dispatch(omfordelAction(journalpostid, sakstype))
});

const Fordeling = injectIntl(connect(mapStateToProps, mapDispatchToProps)(FordelingComponent));

export {Fordeling, FordelingComponent};
