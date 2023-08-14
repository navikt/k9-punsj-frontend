import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button, Loader, Modal, Table } from '@navikt/ds-react';

import { PunchStep, TimeFormat } from 'app/models/enums';
import { IEksisterendeSoknaderState, IPunchState } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import {
    chooseEksisterendeSoknadAction,
    closeEksisterendeSoknadAction,
    createSoknad,
    findEksisterendeSoknader,
    openEksisterendeSoknadAction,
    resetPunchAction,
    resetSoknadidAction,
    setIdentAction,
    setStepAction,
    undoSearchForEksisterendeSoknaderAction,
} from 'app/state/actions';
import { datetime, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { generateDateString } from '../../components/skjema/skjemaUtils';
import { IPSBSoknad, PSBSoknad } from '../../models/types/PSBSoknad';
import ErDuSikkerModal from './ErDuSikkerModal';

export interface IEksisterendeSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
}

export interface IEksisterendeSoknaderDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    findEksisterendeSoknader: typeof findEksisterendeSoknader;
    openEksisterendeSoknadAction: typeof openEksisterendeSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeSoknadAction;
    resetSoknadidAction: typeof resetSoknadidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IEksisterendeSoknaderComponentProps {
    søkerId: string;
    pleietrengendeId: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

type IEksisterendeSoknaderProps = WrappedComponentProps &
    IEksisterendeSoknaderComponentProps &
    IEksisterendeSoknaderStateProps &
    IEksisterendeSoknaderDispatchProps;

export const EksisterendeSoknaderComponent: React.FunctionComponent<IEksisterendeSoknaderProps> = (
    props: IEksisterendeSoknaderProps,
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
                }),
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

    const chooseSoknad = (soknad: IPSBSoknad) => {
        props.chooseEksisterendeSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo) => {
            const søknad = new PSBSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const { chosenSoknad } = props.eksisterendeSoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                (søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                    '',
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
                        rowContent.map((v, i) => <Table.DataCell key={`${soknadId}_${i}`}>{v}</Table.DataCell>)
                    ) : (
                        <Table.DataCell colSpan={4} className="punch_mappetabell_tom_soknad">
                            Tom søknad
                        </Table.DataCell>
                    )}
                </tr>,
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
                </Modal>,
            );
        });

        return (
            <>
                <Table zebraStripes className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.barnetsfnrellerfdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.journalpostid')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'skjema.periode')}</Table.HeaderCell>
                            <Table.HeaderCell aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>{rows}</Table.Body>
                </Table>
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

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(setIdentAction(søkerId, pleietrengendeId)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    findEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeSoknader(søkerId, pleietrengendeId)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    openEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(openEksisterendeSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(chooseEksisterendeSoknadAction(info)),
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createSoknad(journalpostid, søkerId, pleietrengendeId)),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendeSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeSoknaderComponent),
);
