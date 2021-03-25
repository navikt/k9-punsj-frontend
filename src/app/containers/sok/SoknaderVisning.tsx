import { PunchStep, TimeFormat } from 'app/models/enums';
import {
    ISoknaderSokState, IPath,
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
import {SoknadType} from "../../models/enums/SoknadType";
import {resetPunchAction, setIdentAction, undoSearchForSoknaderAction} from "../../state/actions";
import {ISoknadV2, SoknadV2} from "../../models/types/Soknadv2";
import SoknadReadModeV2 from "../pleiepenger/SoknadReadModeV2";

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
    } = props;
    const soknader = soknaderSokState.soknadSvar;

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
        props.findSoknader(ident);
        props.setStepAction(SoknaderVisningStep.CHOOSE_SOKNAD);
    }, [ident]);

    if (!ident) {
        return null;
    }

    const backButton = (
        <p>
            <Knapp onClick={undoSearchForSoknader}>Tilbake</Knapp>
        </p>
    );

    if (soknaderSokState.soknaderRequestError && soknaderSokState.soknaderRequestError!!.status === 403) {
        return (
            <>
                <AlertStripeFeil>
                    Du har ikke tilgang til å slå opp denne personen.
                </AlertStripeFeil>
            </>
        );
    }

    if (soknaderSokState.soknaderRequestError) {
        return (
            <>
                <AlertStripeFeil>
                    Det oppsto en feil i henting av mapper.
                </AlertStripeFeil>
            </>
        );
    }

    if (
        visningState.step !== SoknaderVisningStep.CHOOSE_SOKNAD ||
        soknaderSokState.isSoknaderLoading
    ) {
        return (
            <div>
                <NavFrontendSpinner/>
            </div>
        );
    }

    const technicalError =
        soknaderSokState.soknaderRequestError ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const chooseSoknad = (soknad: ISoknadV2) => {
        window.history.pushState("","", "/rediger");
        props.chooseSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const modaler = [];
        const rows = [];

        for (const s of soknader) {
            const søknad = new SoknadV2(s)
            const soknadId = s.soeknadId as string;
            const {chosenSoknad} = props.soknaderSokState;
            const fom = søknad.soeknadsperiode.fom;
            const tom = søknad.soeknadsperiode.tom;
            const rowContent = [
                !!søknad.mottattDato
                    ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato)
                    : '',
                SoknadType.PSB,
                (!!søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato &&
                    datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                '',
                !!fom ? datetime(intl, TimeFormat.DATE_SHORT, fom) : '', // Viser tidligste startdato
                !!tom ? datetime(intl, TimeFormat.DATE_SHORT, tom) : '', // Viser seneste sluttdato
            ];
            rows.push(
                <tr key={soknadId} onClick={() => props.openSoknadAction(s)}>
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
                    isOpen={!!chosenSoknad && soknadId === chosenSoknad.soeknadId}
                >
                    <div className="modal_content">
                        {chosenSoknad && (
                            <SoknadReadModeV2 soknad={new SoknadV2(chosenSoknad)}/>
                        )}
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1" onClick={() => chooseSoknad(s)}>
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
    findSoknader: (ident1: string) =>
        dispatch(sokPsbSoknader(ident1)),
    undoSearchForSoknaderAction: () => dispatch(undoSearchForSoknaderAction()),
    openSoknadAction: (soknad: ISoknadV2) => dispatch(openSoknadAction(soknad)),
    closeSoknadAction: () => dispatch(closeSoknadAction()),
    chooseSoknadAction: (soknad: ISoknadV2) => dispatch(chooseSoknadAction(soknad)),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const SoknaderVisning = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(SoknaderVisningComponent)
);
