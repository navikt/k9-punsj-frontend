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
    chooseEksisterendeOMPUTSoknadAction,
    closeEksisterendeOMPUTSoknadAction,
    createOMPUTSoknad,
    findEksisterendeOMPUTSoknader,
    openEksisterendeOMPUTSoknadAction,
    resetOMPUTSoknadidAction,
} from '../state/actions/EksisterendeOMPUTSoknaderActions';
import { IOMPUTSoknad, OMPUTSoknad } from '../types/OMPUTSoknad';
import { IEksisterendeOMPUTSoknaderState } from '../types/EksisterendeOMPUTSoknaderState';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';

export interface IEksisterendeOMPUTSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeOMPUTSoknaderState: IEksisterendeOMPUTSoknaderState;
}

export interface IEksisterendeOMPUTSoknaderDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    findEksisterendeSoknader: typeof findEksisterendeOMPUTSoknader;
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    openEksisterendeSoknadAction: typeof openEksisterendeOMPUTSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeOMPUTSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeOMPUTSoknadAction;
    createSoknad: typeof createOMPUTSoknad;
    resetSoknadidAction: typeof resetOMPUTSoknadidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IEksisterendeOMPUTSoknaderComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

type IEksisterendeOMPUTSoknaderProps = WrappedComponentProps &
    IEksisterendeOMPUTSoknaderComponentProps &
    IEksisterendeOMPUTSoknaderStateProps &
    IEksisterendeOMPUTSoknaderDispatchProps;

export const EksisterendeOMPUTSoknaderComponent: React.FunctionComponent<IEksisterendeOMPUTSoknaderProps> = (
    props: IEksisterendeOMPUTSoknaderProps
) => {
    const { intl, punchState, eksisterendeOMPUTSoknaderState, getPunchPath, ident1, ident2 } = props;

    const soknader = eksisterendeOMPUTSoknaderState.eksisterendeSoknaderSvar.søknader;

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
            !!eksisterendeOMPUTSoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeOMPUTSoknaderState.isSoknadCreated
        ) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: eksisterendeOMPUTSoknaderState.soknadid,
                })
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeOMPUTSoknaderState.soknadid]);

    if (!ident1) {
        return null;
    }

    if (eksisterendeOMPUTSoknaderState.eksisterendeSoknaderRequestError) {
        return <AlertStripeFeil>Det oppsto en feil i henting av mapper.</AlertStripeFeil>;
    }

    if (
        punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        eksisterendeOMPUTSoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeOMPUTSoknaderState.isAwaitingSoknadCreation
    ) {
        return <NavFrontendSpinner />;
    }

    if (eksisterendeOMPUTSoknaderState.createSoknadRequestError) {
        return <AlertStripeFeil>Det oppsto en feil under opprettelse av søknad.</AlertStripeFeil>;
    }

    const technicalError =
        eksisterendeOMPUTSoknaderState.isSoknadCreated && !eksisterendeOMPUTSoknaderState.soknadid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const chooseSoknad = (soknad: IOMPUTSoknad) => {
        props.chooseEksisterendeSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo) => {
            const søknad = new OMPUTSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const { chosenSoknad } = props.eksisterendeOMPUTSoknaderState;
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

const mapStateToProps = (state: RootStateType): IEksisterendeOMPUTSoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchState,
    eksisterendeOMPUTSoknaderState: state.eksisterendeOMPUTSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    findEksisterendeSoknader: (ident1: string, ident2: string | null) =>
        dispatch(findEksisterendeOMPUTSoknader(ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    openEksisterendeSoknadAction: (info: IOMPUTSoknad) => dispatch(openEksisterendeOMPUTSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeOMPUTSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IOMPUTSoknad) => dispatch(chooseEksisterendeOMPUTSoknadAction(info)),
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createOMPUTSoknad(journalpostid, ident1, ident2)),
    resetSoknadidAction: () => dispatch(resetOMPUTSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendeOMPUTSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeOMPUTSoknaderComponent)
);
