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
import { generateDateString } from '../../components/skjema/skjemaUtils';
import { IEksisterendePLSSoknaderState } from '../types/EksisterendePLSSoknaderState';
import {
    chooseEksisterendePLSSoknadAction,
    closeEksisterendePLSSoknadAction,
    createPLSSoknad,
    findEksisterendePLSSoknader,
    openEksisterendePLSSoknadAction,
    resetPLSSoknadidAction,
} from '../state/actions/EksisterendePLSSoknaderActions';
import { IPLSSoknad, PLSSoknad } from '../types/PLSSoknad';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';

export interface IEksisterendePLSSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeSoknaderState: IEksisterendePLSSoknaderState;
}

export interface IEksisterendePLSSoknaderDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    findEksisterendeSoknader: typeof findEksisterendePLSSoknader;
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    openEksisterendeSoknadAction: typeof openEksisterendePLSSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendePLSSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendePLSSoknadAction;
    createSoknad: typeof createPLSSoknad;
    resetSoknadidAction: typeof resetPLSSoknadidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IEksisterendePLSSoknaderComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

type IEksisterendePLSSoknaderProps = WrappedComponentProps &
    IEksisterendePLSSoknaderComponentProps &
    IEksisterendePLSSoknaderStateProps &
    IEksisterendePLSSoknaderDispatchProps;

export const EksisterendePLSSoknaderComponent: React.FunctionComponent<IEksisterendePLSSoknaderProps> = (
    props: IEksisterendePLSSoknaderProps
) => {
    const { intl, punchState, eksisterendeSoknaderState, getPunchPath, ident1, ident2 } = props;

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
        if (!!eksisterendeSoknaderState.eksisterendeSoknaderSvar && eksisterendeSoknaderState.isSoknadCreated) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: eksisterendeSoknaderState.soknadid,
                })
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeSoknaderState.soknadid]);

    if (!ident1 || ident1 === '') {
        return null;
    }

    if (eksisterendeSoknaderState.eksisterendeSoknaderRequestError) {
        return <AlertStripeFeil>Det oppsto en feil i henting av mapper.</AlertStripeFeil>;
    }

    if (
        punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        eksisterendeSoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeSoknaderState.isAwaitingSoknadCreation
    ) {
        return (
            <div>
                <NavFrontendSpinner />
            </div>
        );
    }

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return <AlertStripeFeil>Det oppsto en feil under opprettelse av søknad.</AlertStripeFeil>;
    }

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const chooseSoknad = (soknad: IPLSSoknad) => {
        props.chooseEksisterendeSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo) => {
            const søknad = new PLSSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const { chosenSoknad } = props.eksisterendeSoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.pleietrengende.norskIdent ? søknad.pleietrengende.norskIdent : '',
                Array.from(søknad.journalposter).join(', '),
                generateDateString(søknad.soeknadsperiode),
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

const mapStateToProps = (state: RootStateType): IEksisterendePLSSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchState,
    eksisterendeSoknaderState: state.eksisterendePLSSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    findEksisterendeSoknader: (ident1: string, ident2: string | null) =>
        dispatch(findEksisterendePLSSoknader(ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    openEksisterendeSoknadAction: (info: IPLSSoknad) => dispatch(openEksisterendePLSSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendePLSSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IPLSSoknad) => dispatch(chooseEksisterendePLSSoknadAction(info)),
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createPLSSoknad(journalpostid, ident1, ident2)),
    resetSoknadidAction: () => dispatch(resetPLSSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendePLSSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendePLSSoknaderComponent)
);
