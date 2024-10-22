import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Alert, Button, Heading, Loader, Modal, Table } from '@navikt/ds-react';
import { TimeFormat } from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import { ROUTES } from 'app/constants/routes';
import {
    chooseEksisterendeSoknadAction,
    closeEksisterendeSoknadAction,
    openEksisterendeSoknadAction,
    resetSoknadidAction,
} from 'app/state/actions';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { generateDateString } from '../../../components/skjema/skjemaUtils';
import { IPSBSoknad, PSBSoknad } from '../../../models/types/PSBSoknad';
import ErDuSikkerModal from '../../../components/ErDuSikkerModal';
import { Dispatch } from 'redux';

export interface Props {
    pleietrengendeId: string | null;
    fagsakId: string;
    kanStarteNyRegistrering: boolean;
}

export const EksisterendeSoknader: React.FC<Props> = ({
    pleietrengendeId,
    fagsakId,
    kanStarteNyRegistrering,
}: Props) => {
    const intl = useIntl();

    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    const openEksisterendeSoknad = (info: IPSBSoknad) => dispatch(openEksisterendeSoknadAction(info));
    const closeEksisterendeSoknad = () => dispatch(closeEksisterendeSoknadAction());
    const chooseEksisterendeSoknad = (info: IPSBSoknad) => dispatch(chooseEksisterendeSoknadAction(info));
    const resetSoknadid = () => dispatch(resetSoknadidAction());

    const eksisterendeSoknaderState = useSelector((state: RootStateType) => state.eksisterendeSoknaderState);
    const journalposterState = useSelector((state: RootStateType) => state.journalposterPerIdentState);

    const søknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;

    if (eksisterendeSoknaderState.eksisterendeSoknaderRequestError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.requestError" />
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
                <FormattedMessage id="eksisterendeSoknader.createSoknadRequestError" />
            </Alert>
        );
    }

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.tekniskFeil" />
            </Alert>
        ) : null;

    const chooseSoknad = (soknad: IPSBSoknad) => {
        if (soknad.soeknadId) {
            chooseEksisterendeSoknad(soknad);
            resetSoknadid();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
        } else {
            throw new Error('Søknad mangler søknadid');
        }
    };

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        søknader?.forEach((soknadInfo, index) => {
            const søknad = new PSBSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const k9saksnummer = søknad?.k9saksnummer;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                journalposterState.journalposter,
            );

            const { chosenSoknad } = eksisterendeSoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                (søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                    '',
                <DokumentIdList key={`dok-${index}`} dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                k9saksnummer,
                generateDateString(søknad.soeknadsperiode),
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
                    onClick={() => openEksisterendeSoknad(soknadInfo)}
                >
                    <FormattedMessage id="mappe.lesemodus.knapp.velg" />
                </Button>,
            ];
            rows.push(
                <tr key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        rowContent.map((v, i) => <Table.DataCell key={`${soknadId}_${i}`}>{v}</Table.DataCell>)
                    ) : (
                        <Table.DataCell colSpan={4} className="punch_mappetabell_tom_soknad">
                            <FormattedMessage id="tabell.tomSøknad" />
                        </Table.DataCell>
                    )}
                </tr>,
            );
            modaler.push(
                <Modal
                    key={soknadId}
                    onCancel={() => {
                        closeEksisterendeSoknad();
                    }}
                    onClose={() => {
                        closeEksisterendeSoknad();
                    }}
                    aria-label={soknadId}
                    open={!!chosenSoknad && soknadId === chosenSoknad.soeknadId}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.info"
                        onSubmit={() => chooseSoknad(soknadInfo)}
                        onClose={() => closeEksisterendeSoknad()}
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
                <Table zebraStripes className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">
                                <FormattedMessage id="tabell.mottakelsesdato" />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <FormattedMessage id="tabell.barnetsfnrellerfdato" />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <FormattedMessage id="tabell.dokumenter" />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <FormattedMessage id="tabell.journalpostid" />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <FormattedMessage id="tabell.fagsakId" />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <FormattedMessage id="skjema.periode" />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" aria-label="mappe.lesemodus.knapp.velg" />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>{rows}</Table.Body>
                </Table>
                {modaler}
            </>
        );
    };

    if (søknader && søknader.length) {
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
                <FormattedMessage
                    id="mapper.infoboks.ingensoknader"
                    values={{ antallSokere: pleietrengendeId ? '2' : '1' }}
                />
            </Alert>
        </>
    );
};
