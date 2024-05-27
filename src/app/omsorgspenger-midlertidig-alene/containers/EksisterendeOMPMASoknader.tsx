import React, { useEffect } from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

import { Alert, Button, Heading, Loader, Modal, Table } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { areBothDatesDefined, generateDateString } from 'app/components/skjema/skjemaUtils';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';

import { IJournalposterPerIdentState } from 'app/models/types/Journalpost/JournalposterPerIdentState';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { IFordelingState, IJournalpost } from 'app/models/types';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import {
    chooseEksisterendeOMPMASoknadAction,
    closeEksisterendeOMPMASoknadAction,
    createOMPMASoknad,
    findEksisterendeOMPMASoknader,
    openEksisterendeOMPMASoknadAction,
    resetOMPMASoknadidAction,
} from '../state/actions/EksisterendeOMPMASoknaderActions';
import { IEksisterendeOMPMASoknaderState } from '../types/EksisterendeOMPMASoknaderState';
import { IOMPMASoknad, OMPMASoknad } from '../types/OMPMASoknad';

export interface IEksisterendeOMPMASoknaderStateProps {
    eksisterendeOMPMASoknaderState: IEksisterendeOMPMASoknaderState;
    journalposterState: IJournalposterPerIdentState;
    journalpost?: IJournalpost;
    fordelingState?: IFordelingState;
}

export interface IEksisterendeOMPMASoknaderDispatchProps {
    findEksisterendeSoknader: typeof findEksisterendeOMPMASoknader;
    openEksisterendeSoknadAction: typeof openEksisterendeOMPMASoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeOMPMASoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeOMPMASoknadAction;
    resetAllAction: typeof resetAllStateAction;
}

export interface IEksisterendeOMPMASoknaderComponentProps {
    søkerId: string;
    annenPart: string;
    kanStarteNyRegistrering?: boolean;
}

type IEksisterendeOMPMASoknaderProps = WrappedComponentProps &
    IEksisterendeOMPMASoknaderComponentProps &
    IEksisterendeOMPMASoknaderStateProps &
    IEksisterendeOMPMASoknaderDispatchProps;

export const EksisterendeOMPMASoknaderComponent: React.FC<IEksisterendeOMPMASoknaderProps> = (
    props: IEksisterendeOMPMASoknaderProps,
) => {
    const {
        eksisterendeOMPMASoknaderState,
        journalposterState,
        søkerId,
        annenPart,
        journalpost,
        fordelingState,
        kanStarteNyRegistrering,
    } = props;
    const intl = useIntl();
    const navigate = useNavigate();

    const soknader = eksisterendeOMPMASoknaderState.eksisterendeSoknaderSvar.søknader;

    useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, annenPart)) {
            props.findEksisterendeSoknader(søkerId);
        } else {
            props.resetAllAction();
            navigate(ROUTES.HOME);
        }
    }, [søkerId, annenPart]);

    if (!søkerId) {
        return null;
    }

    if (eksisterendeOMPMASoknaderState.eksisterendeSoknaderRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil i henting av mapper.
            </Alert>
        );
    }

    if (
        eksisterendeOMPMASoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeOMPMASoknaderState.isAwaitingSoknadCreation ||
        journalposterState.isJournalposterLoading
    ) {
        return <Loader size="large" />;
    }

    if (eksisterendeOMPMASoknaderState.createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    const technicalError =
        eksisterendeOMPMASoknaderState.isSoknadCreated && !eksisterendeOMPMASoknaderState.soknadid ? (
            <Alert size="small" variant="error">
                Teknisk feil.
            </Alert>
        ) : null;

    const chooseSoknad = (soknad: IOMPMASoknad) => {
        if (soknad.soeknadId) {
            props.chooseEksisterendeSoknadAction(soknad);
            navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
        } else {
            throw new Error('Søknad mangler søknadid');
        }
    };

    const fagsakId = journalpost?.sak?.fagsakId || fordelingState?.fagsak?.fagsakId;

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo) => {
            const søknad = new OMPMASoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const k9saksnummer = søknad?.k9saksnummer;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                journalposterState.journalposter,
            );
            const { chosenSoknad } = props.eksisterendeOMPMASoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.annenForelder.norskIdent,
                <DokumentIdList dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                k9saksnummer,
                søknad.annenForelder.periode && areBothDatesDefined(søknad.annenForelder.periode)
                    ? generateDateString(søknad.annenForelder.periode)
                    : '',

                <Button
                    variant="secondary"
                    key={soknadId}
                    size="small"
                    disabled={
                        (søknad.annenForelder.norskIdent &&
                            annenPart !== søknad.annenForelder.norskIdent &&
                            !!annenPart &&
                            annenPart !== null) ||
                        (!!k9saksnummer && fagsakId !== k9saksnummer)
                    }
                    onClick={() => props.openEksisterendeSoknadAction(soknadInfo)}
                >
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Button>,
            ];
            rows.push(
                <Table.Row key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        // eslint-disable-next-line react/no-array-index-key
                        rowContent.map((v, i) => <Table.DataCell key={`${soknadId}_${i}`}>{v}</Table.DataCell>)
                    ) : (
                        <Table.DataCell colSpan={4} className="punch_mappetabell_tom_soknad">
                            Tom søknad
                        </Table.DataCell>
                    )}
                </Table.Row>,
            );
            modaler.push(
                <Modal
                    key={soknadId}
                    onClose={() => {
                        props.closeEksisterendeSoknadAction();
                    }}
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
                        id={`tabell.info${kanStarteNyRegistrering ? '.OMS_MA' : '.kanIkkeStarteNyRegistrering'}`}
                    />
                </Alert>
                <Table zebraStripes className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.annenForelder')}</Table.HeaderCell>
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
                    antallSokere: annenPart ? '2' : '1',
                })}
            </Alert>
        </>
    );
};

const mapStateToProps = (state: RootStateType): IEksisterendeOMPMASoknaderStateProps => ({
    eksisterendeOMPMASoknaderState: state.eksisterendeOMPMASoknaderState,
    journalposterState: state.journalposterPerIdentState,
});

const mapDispatchToProps = (dispatch: any) => ({
    findEksisterendeSoknader: (søkerId: string) => dispatch(findEksisterendeOMPMASoknader(søkerId)),
    openEksisterendeSoknadAction: (info: IOMPMASoknad) => dispatch(openEksisterendeOMPMASoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeOMPMASoknadAction()),
    chooseEksisterendeSoknadAction: (info: IOMPMASoknad) => dispatch(chooseEksisterendeOMPMASoknadAction(info)),
    createSoknad: (journalpostid: string, søkerId: string, annenPart: string) =>
        dispatch(createOMPMASoknad(journalpostid, søkerId, annenPart)),
    resetSoknadidAction: () => dispatch(resetOMPMASoknadidAction()),
    resetAllAction: () => dispatch(resetAllStateAction()),
});

export const EksisterendeOMPMASoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeOMPMASoknaderComponent),
);
