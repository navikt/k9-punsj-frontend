import {PunchStep, TimeFormat} from 'app/models/enums';
import {
    IEksisterendeSoknaderState,
    IPleiepengerPunchState,
} from 'app/models/types';
import {IdentRules} from 'app/rules';
import {
    chooseEksisterendeSoknadAction, closeEksisterendeSoknadAction, createSoknad,
    findEksisterendeSoknader, openEksisterendeSoknadAction,

    resetPunchAction, resetSoknadidAction,
    setIdentAction,
    setStepAction,
    undoSearchForEksisterendeSoknaderAction,
} from 'app/state/actions';
import {RootStateType} from 'app/state/RootState';
import {datetime, setHash} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeInfo} from 'nav-frontend-alertstriper';
import {Knapp} from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {connect} from 'react-redux';
import {IPSBSoknad, PSBSoknad} from "../../models/types/PSBSoknad";
import {generateDateString} from "../../components/skjema/skjemaUtils";
import ErDuSikkerModal from "./ErDuSikkerModal";


export interface IEksisterendeSoknaderStateProps {
    punchState: IPleiepengerPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
}

export interface IEksisterendeSoknaderDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    findEksisterendeSoknader: typeof findEksisterendeSoknader;
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    openEksisterendeSoknadAction: typeof openEksisterendeSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeSoknadAction;
    createSoknad: typeof createSoknad;
    resetSoknadidAction: typeof resetSoknadidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IEksisterendeSoknaderComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

type IEksisterendeSoknaderProps = WrappedComponentProps &
    IEksisterendeSoknaderComponentProps &
    IEksisterendeSoknaderStateProps &
    IEksisterendeSoknaderDispatchProps;

export const EksisterendeSoknaderComponent: React.FunctionComponent<IEksisterendeSoknaderProps> = (
    props: IEksisterendeSoknaderProps
) => {
    const {
        intl,
        punchState,
        eksisterendeSoknaderState,
        getPunchPath,
        ident1,
        ident2,
    } = props;

    const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;

    React.useEffect(() => {
        if (IdentRules.areIdentsValid(ident1, ident2)) {
            props.setIdentAction(ident1, ident2);
            props.findEksisterendeSoknader(ident1, null);
            props.setStepAction(PunchStep.CHOOSE_SOKNAD);
        } else {
            props.resetPunchAction();
            setHash('/');
        }
    }, [ident1, ident2]);

    React.useEffect(() => {
        if (
            !!eksisterendeSoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeSoknaderState.isSoknadCreated
        ) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {id: eksisterendeSoknaderState.soknadid})
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeSoknaderState.soknadid]);

    if (!ident1 || ident1 === '') {
        return null;
    }

    if (
        eksisterendeSoknaderState.eksisterendeSoknaderRequestError
    ) {
        return (
            <>
                <AlertStripeFeil>
                    Det oppsto en feil i henting av mapper.
                </AlertStripeFeil>
            </>
        );
    }

    if (
        punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        eksisterendeSoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeSoknaderState.isAwaitingSoknadCreation
    ) {
        return (
            <div>
                <NavFrontendSpinner/>
            </div>
        );
    }

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return (
            <>
                <AlertStripeFeil>
                    Det oppsto en feil under opprettelse av søknad.
                </AlertStripeFeil>
            </>
        );
    }

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const chooseSoknad = (soknad: IPSBSoknad) => {
        props.chooseEksisterendeSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, {id: soknad.soeknadId}));
    };

    function showSoknader() {
        const modaler = [];
        const rows = [];

        for (const soknadInfo of soknader!) {
            const søknad = new PSBSoknad(soknadInfo)
            const soknadId = søknad.soeknadId;
            const {chosenSoknad} = props.eksisterendeSoknaderState;
            const rowContent = [
                !!søknad.mottattDato
                    ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato)
                    : '',
                (!!søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato &&
                    datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                '',
                Array.from(søknad.journalposter).join(", "),
                generateDateString(søknad.soeknadsperiode),
                <Knapp
                    key={soknadId}
                    mini={true}
                    onClick={() => props.openEksisterendeSoknadAction(soknadInfo)}
                >{intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Knapp>
            ];
            rows.push(
                <tr key={soknadId}>
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
                    onRequestClose={props.closeEksisterendeSoknadAction}
                    contentLabel={soknadId}
                    isOpen={!!chosenSoknad && soknadId === chosenSoknad.soeknadId}
                    closeButton={false}
                >
                    <ErDuSikkerModal
                        melding={'modal.erdusikker.info'}
                        onSubmit={() => chooseSoknad(soknadInfo)}
                        onClose={() => props.closeEksisterendeSoknadAction()}
                        submitKnappText={'mappe.lesemodus.knapp.velg'}
                    />
                </ModalWrapper>
            );
        }

        return (
            <>
                <h2>{intlHelper(intl, 'tabell.overskrift')}</h2>
                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                    <tr>
                        <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                        <th>{intlHelper(intl, 'tabell.barnetsfnrellerfdato')}</th>
                        <th>{intlHelper(intl, 'tabell.journalpostid')}</th>
                        <th>{intlHelper(intl, 'skjema.periode')}</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
                {modaler}
            </>
        );
    }

    if (soknader && soknader.length) {
        return (
            <>
                {technicalError}
                <AlertStripeInfo>
                    {intlHelper(intl, 'mapper.infoboks', {
                        antallSokere: ident2 ? '2' : '1',
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
                {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                    antallSokere: ident2 ? '2' : '1',
                })}
            </AlertStripeInfo>
        </>
    );
};

const mapStateToProps = (
    state: RootStateType
): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) =>
        dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    findEksisterendeSoknader: (ident1: string, ident2: string | null) =>
        dispatch(findEksisterendeSoknader(ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    openEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(openEksisterendeSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(chooseEksisterendeSoknadAction(info)),
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createSoknad(journalpostid, ident1, ident2)),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendeSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeSoknaderComponent)
);
