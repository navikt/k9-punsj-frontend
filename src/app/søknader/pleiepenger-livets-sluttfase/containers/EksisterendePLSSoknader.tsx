import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button, Heading, Loader, Modal, Table } from '@navikt/ds-react';
import { useNavigate } from 'react-router';

import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { ROUTES } from 'app/constants/routes';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';

import { IJournalposterPerIdentState } from 'app/models/types/Journalpost/JournalposterPerIdentState';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { generateDateString } from '../../../components/skjema/skjemaUtils';
import ErDuSikkerModal from 'app/søknader/pleiepenger/ErDuSikkerModal';
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
    eksisterendeSoknaderState: IEksisterendePLSSoknaderState;
    journalposterState: IJournalposterPerIdentState;
    journalpost?: IJournalpost;
    fordelingState?: IFordelingState;
}

export interface IEksisterendePLSSoknaderDispatchProps {
    findEksisterendeSoknader: typeof findEksisterendePLSSoknader;
    openEksisterendeSoknadAction: typeof openEksisterendePLSSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendePLSSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendePLSSoknadAction;
    resetSoknadidAction: typeof resetPLSSoknadidAction;
    resetAllAction: typeof resetAllStateAction;
}

export interface IEksisterendePLSSoknaderComponentProps {
    søkerId: string;
    pleietrengendeId: string;
    kanStarteNyRegistrering?: boolean;
}

type IEksisterendePLSSoknaderProps = IEksisterendePLSSoknaderComponentProps &
    IEksisterendePLSSoknaderStateProps &
    IEksisterendePLSSoknaderDispatchProps;

export const EksisterendePLSSoknaderComponent: React.FC<IEksisterendePLSSoknaderProps> = (
    props: IEksisterendePLSSoknaderProps,
) => {
    const {
        eksisterendeSoknaderState,
        journalposterState,
        søkerId,
        pleietrengendeId,
        journalpost,
        fordelingState,
        kanStarteNyRegistrering,
    } = props;
    const intl = useIntl();
    const navigate = useNavigate();

    const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;

    useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            props.findEksisterendeSoknader(søkerId, null);
        } else {
            props.resetAllAction();
            navigate(ROUTES.HOME);
        }
    }, [søkerId, pleietrengendeId]);

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
        eksisterendeSoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeSoknaderState.isAwaitingSoknadCreation ||
        journalposterState.isJournalposterLoading
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
        if (soknad.soeknadId) {
            props.chooseEksisterendeSoknadAction(soknad);
            props.resetSoknadidAction();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
        } else {
            throw new Error('Søknad mangler søknadid');
        }
    };

    const fagsakId = journalpost?.sak?.fagsakId || fordelingState?.fagsak?.fagsakId;

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo, index) => {
            const søknad = new PLSSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const k9saksnummer = søknad?.k9saksnummer;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                journalposterState.journalposter,
            );

            const { chosenSoknad } = props.eksisterendeSoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.pleietrengende.norskIdent ? søknad.pleietrengende.norskIdent : '',
                <DokumentIdList key={`dok-${index}`} dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                k9saksnummer,
                generateDateString(søknad.soeknadsperiode),
                <Button
                    variant="secondary"
                    key={soknadId}
                    size="small"
                    disabled={
                        (søknad.pleietrengende.norskIdent &&
                            pleietrengendeId !== søknad.pleietrengende.norskIdent &&
                            !!pleietrengendeId &&
                            pleietrengendeId !== null) ||
                        (!!k9saksnummer && fagsakId !== k9saksnummer)
                    }
                    onClick={() => props.openEksisterendeSoknadAction(soknadInfo)}
                >
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Button>,
            ];
            rows.push(
                <tr key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
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
                <Heading size="medium" level="2">
                    <FormattedMessage id="tabell.overskrift" />
                </Heading>

                <Alert size="small" variant="info" className="mb-10 max-w-max">
                    <FormattedMessage
                        id={`tabell.info${kanStarteNyRegistrering ? '' : '.kanIkkeStarteNyRegistrering'}`}
                    />
                </Alert>
                <Table className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>
                                {intlHelper(intl, 'tabell.pleietrengendesfnrellerfdato')}
                            </Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.dokumenter')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.journalpostid')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.fagsakId')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'skjema.periode')}</Table.HeaderCell>
                            <Table.HeaderCell aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>{rows}</Table.Body>
                </Table>
                {modaler}
            </>
        );
    };

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
    eksisterendeSoknaderState: state.eksisterendePLSSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
});

const mapDispatchToProps = (dispatch: any) => ({
    findEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendePLSSoknader(søkerId, pleietrengendeId)),
    openEksisterendeSoknadAction: (info: IPLSSoknad) => dispatch(openEksisterendePLSSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendePLSSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IPLSSoknad) => dispatch(chooseEksisterendePLSSoknadAction(info)),
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createPLSSoknad(journalpostid, søkerId, pleietrengendeId)),
    resetSoknadidAction: () => dispatch(resetPLSSoknadidAction()),
    resetAllAction: () => dispatch(resetAllStateAction()),
});

export const EksisterendePLSSoknader = connect(mapStateToProps, mapDispatchToProps)(EksisterendePLSSoknaderComponent);
