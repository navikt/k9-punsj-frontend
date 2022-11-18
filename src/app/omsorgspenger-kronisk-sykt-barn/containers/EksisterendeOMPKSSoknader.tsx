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
import { Alert, Button , Modal, Button , Loader } from '@navikt/ds-react';

import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import {
    chooseEksisterendeOMPKSSoknadAction,
    closeEksisterendeOMPKSSoknadAction,
    createOMPKSSoknad,
    findEksisterendeOMPKSSoknader,
    openEksisterendeOMPKSSoknadAction,
    resetOMPKSSoknadidAction,
} from '../state/actions/EksisterendeOMPKSSoknaderActions';
import { IOMPKSSoknad, OMPKSSoknad } from '../types/OMPKSSoknad';
import { IEksisterendeOMPKSSoknaderState } from '../types/EksisterendeOMPKSSoknaderState';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';

export interface IEksisterendeOMPKSSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeOMPKSSoknaderState: IEksisterendeOMPKSSoknaderState;
}

export interface IEksisterendeOMPKSSoknaderDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    findEksisterendeSoknader: typeof findEksisterendeOMPKSSoknader;
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    openEksisterendeSoknadAction: typeof openEksisterendeOMPKSSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeOMPKSSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeOMPKSSoknadAction;
    createSoknad: typeof createOMPKSSoknad;
    resetSoknadidAction: typeof resetOMPKSSoknadidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IEksisterendeOMPKSSoknaderComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

type IEksisterendeOMPKSSoknaderProps = WrappedComponentProps &
    IEksisterendeOMPKSSoknaderComponentProps &
    IEksisterendeOMPKSSoknaderStateProps &
    IEksisterendeOMPKSSoknaderDispatchProps;

export const EksisterendeOMPKSSoknaderComponent: React.FunctionComponent<IEksisterendeOMPKSSoknaderProps> = (
    props: IEksisterendeOMPKSSoknaderProps
) => {
    const { intl, punchState, eksisterendeOMPKSSoknaderState, getPunchPath, ident1, ident2 } = props;

    const soknader = eksisterendeOMPKSSoknaderState.eksisterendeSoknaderSvar.søknader;

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
            !!eksisterendeOMPKSSoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeOMPKSSoknaderState.isSoknadCreated
        ) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: eksisterendeOMPKSSoknaderState.soknadid,
                })
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeOMPKSSoknaderState.soknadid]);

    if (!ident1) {
        return null;
    }

    if (eksisterendeOMPKSSoknaderState.eksisterendeSoknaderRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil i henting av mapper.
            </Alert>
        );
    }

    if (
        punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        eksisterendeOMPKSSoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeOMPKSSoknaderState.isAwaitingSoknadCreation
    ) {
        return <Loader size="large" />;
    }

    if (eksisterendeOMPKSSoknaderState.createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    const technicalError =
        eksisterendeOMPKSSoknaderState.isSoknadCreated && !eksisterendeOMPKSSoknaderState.soknadid ? (
            <Alert size="small" variant="error">
                Teknisk feil.
            </Alert>
        ) : null;

    const chooseSoknad = (soknad: IOMPKSSoknad) => {
        props.chooseEksisterendeSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo) => {
            const søknad = new OMPKSSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const { chosenSoknad } = props.eksisterendeOMPKSSoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                (søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                    '',
                Array.from(søknad.journalposter).join(', '),

                <Button
                    variant="secondary"
                    key={soknadId}
                    size="small"
                    onClick={() => props.openEksisterendeSoknadAction(soknadInfo)}
                >
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Button>,
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
                <Modal
                    key={soknadId}
                    onClose={props.closeEksisterendeSoknadAction}
                    aria-label={soknadId}
                    open={!!chosenSoknad && soknadId === chosenSoknad.soeknadId}
                    closeButton={false}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.info"
                        onSubmit={() => chooseSoknad(soknadInfo)}
                        onClose={() => props.closeEksisterendeSoknadAction()}
                        submitKnappText="mappe.lesemodus.knapp.velg"
                    />
                </Modal>
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
            <Alert size="small" variant="info">
                {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                    antallSokere: ident2 ? '2' : '1',
                })}
            </Alert>
        </>
    );
};

const mapStateToProps = (state: RootStateType): IEksisterendeOMPKSSoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchState,
    eksisterendeOMPKSSoknaderState: state.eksisterendeOMPKSSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    findEksisterendeSoknader: (ident1: string, ident2: string | null) =>
        dispatch(findEksisterendeOMPKSSoknader(ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    openEksisterendeSoknadAction: (info: IOMPKSSoknad) => dispatch(openEksisterendeOMPKSSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeOMPKSSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IOMPKSSoknad) => dispatch(chooseEksisterendeOMPKSSoknadAction(info)),
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createOMPKSSoknad(journalpostid, ident1, ident2)),
    resetSoknadidAction: () => dispatch(resetOMPKSSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendeOMPKSSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeOMPKSSoknaderComponent)
);
