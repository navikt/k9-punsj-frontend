import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Button, Heading, Loader, Modal, Table } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';

import { hentAlleJournalposterPerIdent } from 'app/api/api';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { RootStateType } from 'app/state/RootState';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import { hentEksisterendeSoeknader } from '../api';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';

export interface Props {
    søkerId: string;
    pleietrengendeId: string | null;
    kanStarteNyRegistrering?: boolean;
}

const EksisterendeOMPAOSoknader: React.FC<Props> = (props) => {
    const { søkerId, pleietrengendeId, kanStarteNyRegistrering } = props;

    const intl = useIntl();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const fellesState = useSelector((state: RootStateType) => state.felles);

    const [valgtSoeknad, setValgtSoeknad] = useState<IOMPAOSoknad | undefined>(undefined);

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
    } = useQuery('hentSoeknaderOMPAO', () => hentEksisterendeSoeknader(søkerId));

    const {
        data: alleJournalposterPerIdent,
        isLoading: lasterAlleJournalposterPerIdent,
        error: hentAlleJournalposterPerIdentError,
    } = useQuery(`hentAlleJPPerIdentOMPAO_${søkerId}`, () => hentAlleJournalposterPerIdent(søkerId));

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

    const gaaVidereMedSoeknad = (soknad: IOMPAOSoknad) => {
        navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
    };
    const fagsakId = fellesState.journalpost?.sak?.fagsakId || fordelingState?.fagsak?.fagsakId;

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        eksisterendeSoeknader?.søknader?.forEach((søknad: IOMPAOSoknad) => {
            const soknadId = søknad.soeknadId;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                alleJournalposterPerIdent?.poster || [],
            );

            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.soekerId,
                <DokumentIdList dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                søknad.periode && søknad.periode.fom ? dayjs(søknad.periode.fom).format('DD.MM.YYYY') : '',
                <Button
                    variant="secondary"
                    key={soknadId}
                    size="small"
                    disabled={
                        (søknad.barn.norskIdent &&
                            pleietrengendeId !== søknad.barn.norskIdent &&
                            !!pleietrengendeId &&
                            pleietrengendeId !== null) ||
                        (!!søknad.k9saksnummer && fagsakId !== søknad.k9saksnummer)
                    }
                    onClick={() => setValgtSoeknad(søknad)}
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
                        id={`tabell.info${kanStarteNyRegistrering ? '' : '.kanIkkeStarteNyRegistrering'}`}
                    />
                </Alert>
                <Table zebraStripes className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.soekersFoedselsnummer')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.dokumenter')}</Table.HeaderCell>
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
    };

    if (eksisterendeSoeknader?.søknader && eksisterendeSoeknader.søknader.length) {
        return <>{showSoknader()}</>;
    }

    return (
        <Alert size="small" variant="info">
            {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                antallSokere: pleietrengendeId ? '2' : '1',
            })}
        </Alert>
    );
};

export default EksisterendeOMPAOSoknader;
