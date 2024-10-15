import React, { useEffect, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Button, Heading, Loader, Modal, Table } from '@navikt/ds-react';

import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { hentAlleJournalposterPerIdent } from 'app/api/api';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { RootStateType } from 'app/state/RootState';
import ErDuSikkerModal from '../../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import { hentEksisterendeSoeknader } from '../api';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

export interface IEksisterendeOMPUTSoknaderComponentProps {
    søkerId: string;
    pleietrengendeId: string | null;
    kanStarteNyRegistrering?: boolean;
}

export const EksisterendeOMPUTSoknader: React.FC<IEksisterendeOMPUTSoknaderComponentProps> = (props) => {
    const { søkerId, pleietrengendeId, kanStarteNyRegistrering } = props;
    const intl = useIntl();

    const [valgtSoeknad, setValgtSoeknad] = useState<IOMPUTSoknad | undefined>(undefined);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const fellesState = useSelector((state: RootStateType) => state.felles);

    useEffect(() => {
        if (!IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            dispatch(resetAllStateAction());
            navigate(ROUTES.HOME);
        }
    }, [søkerId, pleietrengendeId]);

    const {
        data: eksisterendeSoeknader,
        isLoading: lasterSoeknader,
        error: eksisterendeSoeknaderError,
    } = useQuery('hentSoeknaderOMPUT', () => hentEksisterendeSoeknader(søkerId));

    const {
        data: alleJournalposterPerIdent,
        isLoading: lasterAlleJournalposterPerIdent,
        error: hentAlleJournalposterPerIdentError,
    } = useQuery(`hentAlleJPPerIdentOMPUT_${søkerId}`, () => hentAlleJournalposterPerIdent(søkerId));

    if (lasterSoeknader || lasterAlleJournalposterPerIdent) {
        return <Loader />;
    }

    if (eksisterendeSoeknaderError instanceof Error) {
        return (
            <Alert size="small" variant="error">
                {eksisterendeSoeknaderError.message}
            </Alert>
        );
    }

    if (hentAlleJournalposterPerIdentError instanceof Error) {
        return (
            <Alert size="small" variant="error">
                {hentAlleJournalposterPerIdentError.message}
            </Alert>
        );
    }

    const gaaVidereMedSoeknad = (soknad: IOMPUTSoknad) => {
        navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
    };
    const fagsakId = fellesState.journalpost?.sak?.fagsakId || fordelingState?.fagsak?.fagsakId;

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        eksisterendeSoeknader?.søknader?.forEach((søknad: IOMPUTSoknad, index) => {
            const soknadId = søknad.soeknadId;
            const k9saksnummer = søknad.k9saksnummer || søknad.metadata.eksisterendeFagsak?.fagsakId;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                alleJournalposterPerIdent?.poster || [],
            );

            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                <DokumentIdList key={`dok-${index}`} dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                k9saksnummer,
                søknad.metadata?.eksisterendeFagsak?.behandlingsår,
                <Button
                    variant="secondary"
                    disabled={!!k9saksnummer && fagsakId !== k9saksnummer}
                    key={soknadId}
                    size="small"
                    onClick={() => setValgtSoeknad(søknad)}
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
                    onClose={() => setValgtSoeknad(undefined)}
                    aria-label={soknadId}
                    open={!!valgtSoeknad && soknadId === valgtSoeknad.soeknadId}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.info"
                        onSubmit={() => valgtSoeknad && gaaVidereMedSoeknad(valgtSoeknad)}
                        onClose={() => setValgtSoeknad(undefined)}
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
                        id={`tabell.info${kanStarteNyRegistrering ? '.OMP_UT' : '.kanIkkeStarteNyRegistrering'}`}
                    />
                </Alert>
                <Table className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.dokumenter')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.journalpostid')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.fagsakId')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.behandlingsÅr')}</Table.HeaderCell>
                            <Table.HeaderCell aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </Table.Row>
                    </Table.Header>
                    <tbody>{rows}</tbody>
                </Table>
                {modaler}
            </>
        );
    };

    if (eksisterendeSoeknader?.søknader && eksisterendeSoeknader.søknader.length) {
        return <>{showSoknader()}</>;
    }

    return (
        <Alert size="small" variant="info">
            {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                antallSokere: pleietrengendeId ? '2' : '1', // TODO hvorfor pleietrengende
            })}
        </Alert>
    );
};
