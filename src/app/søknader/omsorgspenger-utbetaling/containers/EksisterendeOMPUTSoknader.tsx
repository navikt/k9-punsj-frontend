import React, { useEffect, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Button, Heading, Loader, Table } from '@navikt/ds-react';

import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/validation';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { hentAlleJournalposterPerIdent } from 'app/api/api';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { RootStateType } from 'app/state/RootState';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
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
    }, [søkerId, pleietrengendeId, dispatch, navigate]);

    const {
        data: eksisterendeSoeknader,
        isPending: lasterSoeknader,
        error: eksisterendeSoeknaderError,
    } = useQuery({
        queryKey: ['hentSoeknaderOMPUT'],
        queryFn: () => hentEksisterendeSoeknader(søkerId),
    });

    const {
        data: alleJournalposterPerIdent,
        isPending: lasterAlleJournalposterPerIdent,
        error: hentAlleJournalposterPerIdentError,
    } = useQuery({
        queryKey: [`hentAlleJPPerIdentOMPUT_${søkerId}`],
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
                            <FormattedMessage id="tabell.tomSøknad" />
                        </Table.DataCell>
                    )}
                </tr>,
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

                <Alert size="small" variant="info" className="mt-4 mb-10 max-w-max">
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
