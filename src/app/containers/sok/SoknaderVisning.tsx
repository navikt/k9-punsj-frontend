import SoknadReadMode from 'app/containers/pleiepenger/SoknadReadMode';
import { PunchStep, TimeFormat } from 'app/models/enums';
import {
    ISoknaderSokState, IPath, ISoknad,
} from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { datetime, setHash, getPath } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import {connect} from 'react-redux';
import {ISoknaderVisningState} from "../../models/types/SoknaderVisningState";
import {setIdentSokAction, setStepSokAction} from "../../state/actions/SoknaderSokActions";
import {ISoknadPeriode} from "../../models/types/HentSoknad";
import {SoknaderVisningStep} from "../../models/enums/SoknaderVisningStep";
import {
    chooseSoknadAction,
    closeSoknadAction,
    openSoknadAction,
    resetSoknadidAction,

    sokPsbSoknader
} from "../../state/actions/SoknaderVisningActions";
import {
    closeFagsakAction,
    resetPunchAction,
    setIdentAction,
    undoSearchForSoknaderAction
} from "../../state/actions";
import {SoknadType} from "../../models/enums/SoknadType";
import {ISoknadInfo} from "../../models/types/SoknadSvar";

export interface ISoknaderSokStateProps {
    visningState: ISoknaderVisningState;
    soknaderSokState: ISoknaderSokState;
}

export interface ISoknaderSokDispatchProps {
    setIdentAction: typeof setIdentSokAction;
    setStepAction: typeof setStepSokAction;
    findSoknader: typeof sokPsbSoknader;
    undoSearchForSoknaderAction: typeof undoSearchForSoknaderAction;
    openSoknadAction: typeof openSoknadAction;
    closeSoknadAction: typeof closeSoknadAction;
    chooseSoknadAction: typeof chooseSoknadAction;
    resetSoknadidAction: typeof resetSoknadidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface ISoknaderVisningComponentProps {
    ident: string;
    periode: ISoknadPeriode;

}

type ISoknaderSokProps = WrappedComponentProps &
    ISoknaderVisningComponentProps &
    ISoknaderSokStateProps &
    ISoknaderSokDispatchProps;

export const SoknaderVisningComponent: React.FunctionComponent<ISoknaderSokProps> = (
    props: ISoknaderSokProps
) => {
    const {
        intl,
        soknaderSokState,
        visningState,
        ident,
        periode,
    } = props;
    const soknader = soknaderSokState.soknadSvar.søknader;

    const paths: IPath[] = [
        { step: PunchStep.IDENT, path: `/pleiepenger/ident` },
        {
            step: PunchStep.CHOOSE_SOKNAD,
            path: `/pleiepenger/hentsoknader`,
        },
        { step: PunchStep.FILL_FORM, path: `/pleiepenger/skjema/{id}` },
        { step: PunchStep.COMPLETED, path: `$/pleiepenger/fullfort` },
    ];

const getPunchPath = (step: PunchStep, values?: any) => {
        return getPath(
            paths,
            step,
            values,
           undefined
        );
};

    React.useEffect(() => {
        props.setIdentAction(ident);
        props.findSoknader(ident, periode);
        props.setStepAction(SoknaderVisningStep.CHOOSE_SOKNAD);
    }, [ident]);

    React.useEffect(() => {
        if (
            !!soknaderSokState.soknadid &&
            soknaderSokState.isMappeCreated
        ) {
            props.resetSoknadidAction();
        }
    }, [soknaderSokState.soknadid]);

    if (!ident) {
        return null;
    }

    const backButton = (
        <p>
            <Knapp onClick={undoSearchForSoknader}>Tilbake</Knapp>
        </p>
    );

    if (soknaderSokState.soknaderRequestError) {
        return (
            <>
                <AlertStripeFeil>
                    Det oppsto en feil i henting av mapper.
                </AlertStripeFeil>
                {backButton}
            </>
        );
    }

    if (
        visningState.step !== SoknaderVisningStep.CHOOSE_SOKNAD ||
        soknaderSokState.isSoknaderLoading ||
        soknaderSokState.isAwaitingMappeCreation
    ) {
        return (
            <div>
                <NavFrontendSpinner/>
            </div>
        );
    }

    const technicalError =
        soknaderSokState.isMappeCreated && !soknaderSokState.soknadid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const chooseSoknad = (soknad: ISoknadInfo) => {
        window.history.pushState("","", "/rediger");
        props.chooseSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.søknadId }));
    };

    function showSoknader() {
        const modaler = [];
        const rows = [];

        for (const soknadInfo of soknader) {
            const soknadId = soknadInfo.søknadId as string;
            const {chosenSoknad} = props.soknaderSokState;
            const fom = soknadInfo.søknad.getFom();
            const tom = soknadInfo.søknad.getTom();
            const rowContent = [
                !!soknadInfo.søknad.datoMottatt
                    ? datetime(intl, TimeFormat.DATE_SHORT, soknadInfo.søknad.datoMottatt)
                    : '',
                SoknadType[props.soknaderSokState.soknadSvar.fagsakKode],
                (!!soknadInfo.søknad.barn.norskIdent
                    ? soknadInfo.søknad.barn.norskIdent
                    : soknadInfo.søknad.barn.foedselsdato &&
                    datetime(intl, TimeFormat.DATE_SHORT, soknadInfo.søknad.barn.foedselsdato)) ||
                '',
                !!fom ? datetime(intl, TimeFormat.DATE_SHORT, fom) : '', // Viser tidligste startdato
                !!tom ? datetime(intl, TimeFormat.DATE_SHORT, tom) : '', // Viser seneste sluttdato
            ];
            rows.push(
                <tr key={soknadId} onClick={() => props.openSoknadAction(soknadInfo)}>
                    {rowContent.filter((v) => !!v).length ? (
                        rowContent.map((v, i) => <td key={`${soknadId}_${i}`}>{v}</td>)
                    ) : (
                        <td colSpan={4} className="punch_mappetabell_tom_soknad">
                            Tom søknad
                        </td>
                    )}
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    key={soknadId}
                    onRequestClose={props.closeSoknadAction}
                    contentLabel={soknadId}
                    isOpen={!!chosenSoknad && soknadId === chosenSoknad.søknadId}
                >
                    <div className="modal_content">
                        {chosenSoknad?.søknad && (
                            <SoknadReadMode soknad={chosenSoknad.søknad}/>
                        )}
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1" onClick={() => chooseSoknad(soknadInfo)}>
                                {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                            </Knapp>
                            <Knapp className="knapp2" onClick={props.closeSoknadAction}>
                                {intlHelper(intl, 'mappe.lesemodus.knapp.lukk')}
                            </Knapp>
                        </div>
                    </div>
                </ModalWrapper>
            );
        }

        return (
            <>
                <h2>{intlHelper(intl, 'mapper.tabell.overskrift')}</h2>
                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                    <tr>
                        <th>{intlHelper(intl, 'mapper.tabell.mottakelsesdato')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.søknadtype')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.fnrellerdato')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.fraogmed')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.tilogmed')}</th>
                    </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
                {modaler}
            </>
        );
    }


    function undoSearchForSoknader() {
        props.undoSearchForSoknaderAction();
    }

    if (soknader.length) {
        return (
            <>
                {technicalError}
                <AlertStripeInfo>
                    {intlHelper(intl, 'mapper.visning.infoboks', {
                        antallSokere: '1',
                    })}
                </AlertStripeInfo>
                {showSoknader()}
            </>
        );
    }

    return (
        <>
            {technicalError}
            <AlertStripeInfo>
                {intlHelper(intl, 'mapper.infoboks.ingentreff', {
                    antallSokere: '1',
                })}
            </AlertStripeInfo>
        </>
    );
};


const mapStateToProps = (
    state: RootStateType
): ISoknaderSokStateProps => ({
    visningState: state.SØK.visningState,
    soknaderSokState: state.SØK.soknaderSokState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) =>
        dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: SoknaderVisningStep) => dispatch(setStepSokAction(step)),
    findSoknader: (ident1: string, periode: ISoknadPeriode) =>
        dispatch(sokPsbSoknader(ident1, periode)),
    undoSearchForSoknaderAction: () => dispatch(undoSearchForSoknaderAction()),
    openSoknadAction: (soknad: ISoknadInfo) => dispatch(openSoknadAction(soknad)),
    closeSoknadAction: () => dispatch(closeSoknadAction()),
    closeFagsakAction: () => dispatch(closeFagsakAction()),
    chooseSoknadAction: (soknad: ISoknadInfo) => dispatch(chooseSoknadAction(soknad)),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const SoknaderVisning = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(SoknaderVisningComponent)
);
