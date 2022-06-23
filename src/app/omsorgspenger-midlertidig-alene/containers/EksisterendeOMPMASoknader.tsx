import { PunchStep, TimeFormat } from 'app/models/enums';
import { IPunchState } from 'app/models/types';
import { IdentRules } from 'app/rules';
import {
    resetPunchAction,
    setIdentAction,
    setStepAction,
    undoSearchForEksisterendeSoknaderAction,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { datetime, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import {
    chooseEksisterendeOMPMASoknadAction,
    closeEksisterendeOMPMASoknadAction,
    createOMPMASoknad,
    findEksisterendeOMPMASoknader,
    openEksisterendeOMPMASoknadAction,
    resetOMPMASoknadidAction,
} from '../state/actions/EksisterendeOMPMASoknaderActions';
import { IOMPMASoknad, OMPMASoknad } from '../types/OMPMASoknad';
import { IEksisterendeOMPMASoknaderState } from '../types/EksisterendeOMPMASoknaderState';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';

export interface IEksisterendeOMPMASoknaderStateProps {
    punchState: IPunchState;
    eksisterendeOMPMASoknaderState: IEksisterendeOMPMASoknaderState;
}

export interface IEksisterendeOMPMASoknaderDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    findEksisterendeSoknader: typeof findEksisterendeOMPMASoknader;
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    openEksisterendeSoknadAction: typeof openEksisterendeOMPMASoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeOMPMASoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeOMPMASoknadAction;
    createSoknad: typeof createOMPMASoknad;
    resetSoknadidAction: typeof resetOMPMASoknadidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IEksisterendeOMPMASoknaderComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

type IEksisterendeOMPMASoknaderProps = WrappedComponentProps &
    IEksisterendeOMPMASoknaderComponentProps &
    IEksisterendeOMPMASoknaderStateProps &
    IEksisterendeOMPMASoknaderDispatchProps;

export const EksisterendeOMPMASoknaderComponent: React.FunctionComponent<IEksisterendeOMPMASoknaderProps> = (
    props: IEksisterendeOMPMASoknaderProps
) => {
    const { intl, punchState, eksisterendeOMPMASoknaderState, getPunchPath, ident1, ident2 } = props;

    const soknader = eksisterendeOMPMASoknaderState.eksisterendeSoknaderSvar.søknader;

    React.useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(ident1, ident2)) {
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
            !!eksisterendeOMPMASoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeOMPMASoknaderState.isSoknadCreated
        ) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: eksisterendeOMPMASoknaderState.soknadid,
                })
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeOMPMASoknaderState.soknadid]);

    if (!ident1) {
        return null;
    }

    if (eksisterendeOMPMASoknaderState.eksisterendeSoknaderRequestError) {
        return <AlertStripeFeil>Det oppsto en feil i henting av mapper.</AlertStripeFeil>;
    }

    if (
        punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        eksisterendeOMPMASoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeOMPMASoknaderState.isAwaitingSoknadCreation
    ) {
        return <NavFrontendSpinner />;
    }

    if (eksisterendeOMPMASoknaderState.createSoknadRequestError) {
        return <AlertStripeFeil>Det oppsto en feil under opprettelse av søknad.</AlertStripeFeil>;
    }

    const technicalError =
        eksisterendeOMPMASoknaderState.isSoknadCreated && !eksisterendeOMPMASoknaderState.soknadid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const chooseSoknad = (soknad: IOMPMASoknad) => {
        props.chooseEksisterendeSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo) => {
            const søknad = new OMPMASoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const { chosenSoknad } = props.eksisterendeOMPMASoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.barn?.map((barn) => barn.norskIdent).join(', '),
                Array.from(søknad.journalposter).join(', '),

                <Knapp key={soknadId} mini onClick={() => props.openEksisterendeSoknadAction(soknadInfo)}>
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Knapp>,
            ];
            rows.push(
                <tr key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        // eslint-disable-next-line react/no-array-index-key
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
                        melding="modal.erdusikker.info"
                        onSubmit={() => chooseSoknad(soknadInfo)}
                        onClose={() => props.closeEksisterendeSoknadAction()}
                        submitKnappText="mappe.lesemodus.knapp.velg"
                    />
                </ModalWrapper>
            );
        });

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
                            <th aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
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

const mapStateToProps = (state: RootStateType): IEksisterendeOMPMASoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchState,
    eksisterendeOMPMASoknaderState: state.eksisterendeOMPMASoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    findEksisterendeSoknader: (ident1: string, ident2: string | null) =>
        dispatch(findEksisterendeOMPMASoknader(ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    openEksisterendeSoknadAction: (info: IOMPMASoknad) => dispatch(openEksisterendeOMPMASoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeOMPMASoknadAction()),
    chooseEksisterendeSoknadAction: (info: IOMPMASoknad) => dispatch(chooseEksisterendeOMPMASoknadAction(info)),
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createOMPMASoknad(journalpostid, ident1, ident2)),
    resetSoknadidAction: () => dispatch(resetOMPMASoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendeOMPMASoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeOMPMASoknaderComponent)
);
