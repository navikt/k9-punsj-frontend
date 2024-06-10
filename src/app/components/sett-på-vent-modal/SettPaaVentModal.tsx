import React from 'react';
import { useIntl } from 'react-intl';
import { Alert, Button, Table } from '@navikt/ds-react';
import { ApiPath } from 'app/apiConfig';
import VisSvg from 'app/assets/SVG/VisSVG';
import { IJournalpostInfo } from 'app/models/types';
import { apiUrl } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import './settPaaVentModal.less';

interface ISettPaaVentModalProps {
    submit: () => void;
    avbryt: () => void;
    journalposter?: IJournalpostInfo[];
    soknadId?: string;
    children?: React.ReactNode;
}

const pdfUrl = (journalpost: IJournalpostInfo) =>
    apiUrl(ApiPath.DOKUMENT, {
        journalpostId: journalpost.journalpostId,
        dokumentId: journalpost.dokumenter[0].dokument_id,
    });

const urlTilNyJournalpost = (id: string, jpid: string) => `${jpid}/pleiepenger/skjema/${id}`;

const SettPaaVentModal: React.FC<ISettPaaVentModalProps> = (props) => {
    const { submit, avbryt, journalposter, soknadId, children } = props;
    const intl = useIntl();

    return (
        <div className="sett-paa-vent">
            <h2>{intlHelper(intl, 'skjema.knapp.settpaavent')}</h2>
            <p>{intlHelper(intl, 'skjema.settpaavent.periode')}</p>
            {children}
            <div className="knapper">
                <Button variant="secondary" onClick={() => submit()} size="small">
                    {intlHelper(intl, 'skjema.knapp.settpaavent')}
                </Button>
                <Button variant="secondary" onClick={() => avbryt()} size="small">
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Button>
            </div>
            {journalposter && journalposter.length > 0 && soknadId && (
                <>
                    <h2>{intlHelper(intl, 'modal.settpaavent.overskrift')}</h2>
                    <Alert size="small" variant="info">
                        {intlHelper(intl, 'modal.settpaavent.info')}
                    </Alert>

                    <Table className="punch_mappetabell">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{intlHelper(intl, 'tabell.journalpostid')}</Table.HeaderCell>
                                <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                                <Table.HeaderCell>{intlHelper(intl, 'tabell.typeinnsdending')}</Table.HeaderCell>
                                <Table.HeaderCell aria-label={intlHelper(intl, 'modal.settpaavent.visjournalpost')} />
                                <Table.HeaderCell aria-label={intlHelper(intl, 'modal.settpaavent.registrer')} />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {journalposter.map((j) => (
                                <Table.Row key={j.journalpostId}>
                                    <Table.DataCell>{j.journalpostId}</Table.DataCell>
                                    <Table.DataCell>{j.dato}</Table.DataCell>
                                    <Table.DataCell>{j.punsjInnsendingType?.navn || ''}</Table.DataCell>
                                    <Table.DataCell>
                                        <a className="visjp" href={pdfUrl(j)} target="_blank" rel="noreferrer">
                                            <VisSvg title="vis" />
                                            <div className="vistext">
                                                {intlHelper(intl, 'modal.settpaavent.visjournalpost')}
                                            </div>
                                        </a>
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => {
                                                window.location.href = urlTilNyJournalpost(soknadId, j.journalpostId);
                                            }}
                                        >
                                            {intlHelper(intl, 'modal.settpaavent.registrer')}
                                        </Button>
                                    </Table.DataCell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </>
            )}
        </div>
    );
};

export default SettPaaVentModal;
