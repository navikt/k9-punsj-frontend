import * as React from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

import { Alert, Button, Heading, Loader, Table } from '@navikt/ds-react';

import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { ROUTES } from 'app/constants/routes';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';

import { IJournalposterPerIdentState } from 'app/models/types/Journalpost/JournalposterPerIdentState';

import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { IFordelingState, IJournalpost } from 'app/models/types';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import {
    chooseEksisterendeOMPKSSoknadAction,
    closeEksisterendeOMPKSSoknadAction,
    findEksisterendeOMPKSSoknader,
    openEksisterendeOMPKSSoknadAction,
    resetOMPKSSoknadidAction,
} from '../state/actions/EksisterendeOMPKSSoknaderActions';
import { IEksisterendeOMPKSSoknaderState } from '../types/EksisterendeOMPKSSoknaderState';
import { IOMPKSSoknad, OMPKSSoknad } from '../types/OMPKSSoknad';

export interface IEksisterendeOMPKSSoknaderStateProps {
    eksisterendeOMPKSSoknaderState: IEksisterendeOMPKSSoknaderState;
    journalposterState: IJournalposterPerIdentState;
    journalpost?: IJournalpost;
    fordelingState?: IFordelingState;
}

export interface IEksisterendeOMPKSSoknaderDispatchProps {
    findEksisterendeSoknader: typeof findEksisterendeOMPKSSoknader;
    openEksisterendeSoknadAction: typeof openEksisterendeOMPKSSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeOMPKSSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeOMPKSSoknadAction;
    resetSoknadidAction: typeof resetOMPKSSoknadidAction;
    resetAllAction: typeof resetAllStateAction;
}

export interface IEksisterendeOMPKSSoknaderComponentProps {
    søkerId: string;
    pleietrengendeId: string | null;
    kanStarteNyRegistrering?: boolean;
}

type IEksisterendeOMPKSSoknaderProps = WrappedComponentProps &
    IEksisterendeOMPKSSoknaderComponentProps &
    IEksisterendeOMPKSSoknaderStateProps &
    IEksisterendeOMPKSSoknaderDispatchProps;

export const EksisterendeOMPKSSoknaderComponent: React.FunctionComponent<IEksisterendeOMPKSSoknaderProps> = (
    props: IEksisterendeOMPKSSoknaderProps,
) => {
    const {
        eksisterendeOMPKSSoknaderState,
        journalposterState,
        søkerId,
        pleietrengendeId,
        journalpost,
        fordelingState,
        kanStarteNyRegistrering,
    } = props;
    const intl = useIntl();
    const navigate = useNavigate();
    const soknader = eksisterendeOMPKSSoknaderState.eksisterendeSoknaderSvar.søknader;
    React.useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            props.findEksisterendeSoknader(søkerId, null);
        } else {
            props.resetAllAction();
            navigate(ROUTES.HOME);
        }
    }, [søkerId, pleietrengendeId]);

    if (!søkerId) {
        return null;
    }

    if (eksisterendeOMPKSSoknaderState.eksisterendeSoknaderRequestError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.requestError" />
            </Alert>
        );
    }

    if (
        eksisterendeOMPKSSoknaderState.isEksisterendeSoknaderLoading ||
        eksisterendeOMPKSSoknaderState.isAwaitingSoknadCreation
    ) {
        return <Loader size="large" />;
    }

    if (eksisterendeOMPKSSoknaderState.createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.createSoknadRequestError" />
            </Alert>
        );
    }

    const technicalError =
        eksisterendeOMPKSSoknaderState.isSoknadCreated && !eksisterendeOMPKSSoknaderState.soknadid ? (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.tekniskFeil" />
            </Alert>
        ) : null;

    const chooseSoknad = (soknad: IOMPKSSoknad) => {
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
            const søknad = new OMPKSSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const k9saksnummer = søknad?.k9saksnummer;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                journalposterState.journalposter,
            );
            const { chosenSoknad } = props.eksisterendeOMPKSSoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                (søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                    '',
                <DokumentIdList key={`dok-${index}`} dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                k9saksnummer,

                <Button
                    variant="secondary"
                    key={soknadId}
                    size="small"
                    disabled={
                        (søknad.barn.norskIdent &&
                            pleietrengendeId !== søknad.barn.norskIdent &&
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
                <Table.Row key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        rowContent.map((v, i) => <Table.DataCell key={`${soknadId}_${i}`}>{v}</Table.DataCell>)
                    ) : (
                        <Table.DataCell colSpan={4} className="punch_mappetabell_tom_soknad">
                            <FormattedMessage id="tabell.tomSøknad" />
                        </Table.DataCell>
                    )}
                </Table.Row>,
            );
            modaler.push(
                <ErDuSikkerModal
                    melding="modal.erdusikker.info"
                    modalKey={soknadId}
                    open={!!chosenSoknad && soknadId === chosenSoknad.soeknadId}
                    submitKnappText="mappe.lesemodus.knapp.velg"
                    onSubmit={() => chooseSoknad(soknadInfo)}
                    onClose={() => props.closeEksisterendeSoknadAction()}
                />,
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
                <Table zebraStripes className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.barnetsfnrellerfdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.dokumenter')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.journalpostid')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.fagsakId')}</Table.HeaderCell>
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

const mapStateToProps = (state: RootStateType): IEksisterendeOMPKSSoknaderStateProps => ({
    eksisterendeOMPKSSoknaderState: state.eksisterendeOMPKSSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
});

const mapDispatchToProps = (dispatch: any) => ({
    findEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeOMPKSSoknader(søkerId, pleietrengendeId)),
    openEksisterendeSoknadAction: (info: IOMPKSSoknad) => dispatch(openEksisterendeOMPKSSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeOMPKSSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IOMPKSSoknad) => dispatch(chooseEksisterendeOMPKSSoknadAction(info)),
    resetSoknadidAction: () => dispatch(resetOMPKSSoknadidAction()),
    resetAllAction: () => dispatch(resetAllStateAction()),
});

export const EksisterendeOMPKSSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeOMPKSSoknaderComponent),
);
