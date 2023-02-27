import { Alert, Button, Loader, Modal } from '@navikt/ds-react';
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

import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { generateDateString } from '../../components/skjema/skjemaUtils';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import {
    chooseEksisterendePLSSoknadAction,
    closeEksisterendePLSSoknadAction,
    createPLSSoknad,
    findEksisterendePLSSoknader,
    openEksisterendePLSSoknadAction,
    resetPLSSoknadidAction,
} from '../state/actions/EksisterendePLSSoknaderActions';
import { IEksisterendePLSSoknaderState } from '../types/EksisterendePLSSoknaderState';
import { IPLSSoknad, PLSSoknad } from '../types/PLSSoknad';

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
    søkerId: string;
    pleietrengendeId: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

type IEksisterendePLSSoknaderProps = WrappedComponentProps &
    IEksisterendePLSSoknaderComponentProps &
    IEksisterendePLSSoknaderStateProps &
    IEksisterendePLSSoknaderDispatchProps;

export const EksisterendePLSSoknaderComponent: React.FunctionComponent<IEksisterendePLSSoknaderProps> = (
    props: IEksisterendePLSSoknaderProps
) => {
    const { intl, punchState, eksisterendeSoknaderState, getPunchPath, søkerId, pleietrengendeId } = props;

    const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;

    React.useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            props.setIdentAction(søkerId, pleietrengendeId);
            props.findEksisterendeSoknader(søkerId, null);
            props.setStepAction(PunchStep.CHOOSE_SOKNAD);
        } else {
            props.resetPunchAction();
            setHash('/');
        }
    }, [søkerId, pleietrengendeId]);

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

    if (!søkerId || søkerId === '') {
        return null;
    }

    if (eksisterendeSoknaderState.eksisterendeSoknaderRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil i henting av mapper.
            </Alert>
        );
    }

    if (
        punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        eksisterendeSoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeSoknaderState.isAwaitingSoknadCreation
    ) {
        return (
            <div>
                <Loader size="large" />
            </div>
        );
    }

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <Alert size="small" variant="error">
                Teknisk feil.
            </Alert>
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
                    antallSokere: pleietrengendeId ? '2' : '1',
                })}
            </Alert>
        </>
    );
};

const mapStateToProps = (state: RootStateType): IEksisterendePLSSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchState,
    eksisterendeSoknaderState: state.eksisterendePLSSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(setIdentAction(søkerId, pleietrengendeId)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    findEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendePLSSoknader(søkerId, pleietrengendeId)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    openEksisterendeSoknadAction: (info: IPLSSoknad) => dispatch(openEksisterendePLSSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendePLSSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IPLSSoknad) => dispatch(chooseEksisterendePLSSoknadAction(info)),
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createPLSSoknad(journalpostid, søkerId, pleietrengendeId)),
    resetSoknadidAction: () => dispatch(resetPLSSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendePLSSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendePLSSoknaderComponent)
);
