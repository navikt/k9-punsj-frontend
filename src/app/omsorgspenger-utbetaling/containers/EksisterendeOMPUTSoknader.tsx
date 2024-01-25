import React, { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';

import { Alert, Button, Loader, Modal, Table } from '@navikt/ds-react';

import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { IDokUrlParametre, datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { hentAlleJournalposterPerIdent } from 'app/api/api';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import { hentEksisterendeSoeknader } from '../api';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

export interface IEksisterendeOMPUTSoknaderComponentProps {
    søkerId: string;
    pleietrengendeId: string | null;
}

const getListAvDokumenterFraJournalposter = (dokUrlParametre: IDokUrlParametre[]): React.JSX.Element => (
    <ul className="list-none p-0">
        {dokUrlParametre.map((dok) => (
            <li key={dok.dokumentId}>
                <a href={dokumenterPreviewUtils.pdfUrl(dok)} target="_blank" rel="noopener noreferrer">
                    {dok.dokumentId}
                </a>
            </li>
        ))}
    </ul>
);

export const EksisterendeOMPUTSoknader: React.FC<IEksisterendeOMPUTSoknaderComponentProps> = (props) => {
    const { søkerId, pleietrengendeId } = props;
    const intl = useIntl();

    const [valgtSoeknad, setValgtSoeknad] = useState<IOMPUTSoknad | undefined>(undefined);
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
    } = useQuery('hentAlleJournalposterPerIdentOMPUT', () => hentAlleJournalposterPerIdent(søkerId));

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

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        eksisterendeSoeknader?.søknader?.forEach((søknad: IOMPUTSoknad) => {
            const soknadId = søknad.soeknadId;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                alleJournalposterPerIdent?.poster || [],
            );

            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.soekerId,
                getListAvDokumenterFraJournalposter(dokUrlParametre),
                Array.from(søknad.journalposter).join(', '),
                <Button variant="secondary" key={soknadId} size="small" onClick={() => setValgtSoeknad(søknad)}>
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
                <h2>{intlHelper(intl, 'tabell.overskrift')}</h2>
                <Table className="punch_mappetabell">
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
                antallSokere: pleietrengendeId ? '2' : '1',
            })}
        </Alert>
    );
};
