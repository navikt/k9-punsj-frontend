import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Button, Heading, Loader, Table } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';

import { hentAlleJournalposterPerIdent } from 'app/api/api';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { RootStateType } from 'app/state/RootState';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
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
        isPending: lasterSoeknader,
        error: eksisterendeSoeknaderError,
    } = useQuery({
        queryKey: ['hentSoeknaderOMPAO'],
        queryFn: () => hentEksisterendeSoeknader(søkerId),
    });

    const {
        data: alleJournalposterPerIdent,
        isPending: lasterAlleJournalposterPerIdent,
        error: hentAlleJournalposterPerIdentError,
    } = useQuery({
        queryKey: [`hentAlleJPPerIdentOMPAO_${søkerId}`],
        queryFn: () => hentAlleJournalposterPerIdent(søkerId),
    });

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

        eksisterendeSoeknader?.søknader?.forEach((søknad: IOMPAOSoknad, index) => {
            const soknadId = søknad.soeknadId;
            const k9saksnummer = søknad?.k9saksnummer;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                alleJournalposterPerIdent?.poster || [],
            );

            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                (søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                    '',
                <DokumentIdList key={`dok-${index}`} dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                k9saksnummer,
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
                        (!!k9saksnummer && fagsakId !== k9saksnummer)
                    }
                    onClick={() => setValgtSoeknad(søknad)}
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
                    open={!!valgtSoeknad && soknadId === valgtSoeknad.soeknadId}
                    submitKnappText="mappe.lesemodus.knapp.velg"
                    onSubmit={() => valgtSoeknad && gaaVidereMedSoeknad(valgtSoeknad)}
                    onClose={() => setValgtSoeknad(undefined)}
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
