import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Button, Heading, Modal, Table, Link } from '@navikt/ds-react';
import { EyeFillIcon } from '@navikt/aksel-icons';

import { ApiPath } from '../../apiConfig';
import { IJournalpostInfo } from '../../models/types';
import { apiUrl } from '../../utils';
import intlHelper from '../../utils/intlUtils';

interface Props {
    submit: () => void;
    onClose: () => void;

    journalposter?: IJournalpostInfo[];
    soknadId?: string;
    children?: React.ReactNode;
}

const pdfUrl = (journalpost: IJournalpostInfo) => {
    const docId =
        journalpost.dokumenter && journalpost.dokumenter.length ? journalpost.dokumenter[0].dokument_id : 'not_found';

    return apiUrl(ApiPath.DOKUMENT, {
        journalpostId: journalpost.journalpostId,
        dokumentId: docId,
    });
};

const urlTilNyJournalpost = (id: string, jpid: string) => `${jpid}/pleiepenger/skjema/${id}`;

const SettPaaVentModal: React.FC<Props> = (props) => {
    const intl = useIntl();

    const { submit, onClose, journalposter, soknadId, children } = props;

    return (
        <Modal
            key="settpaaventmodal"
            onClose={onClose}
            aria-label="settpaaventmodal"
            header={{ heading: intlHelper(intl, 'skjema.knapp.settpaavent'), closeButton: false }}
            data-testid="settpaaventmodal"
            open
        >
            <Modal.Body>
                <>
                    <FormattedMessage id="skjema.settpaavent.periode" />

                    {children}

                    {journalposter && journalposter.length > 0 && soknadId && (
                        <div className="mt-4">
                            <Heading size="medium" level="2">
                                <FormattedMessage id="modal.settpaavent.overskrift" />
                            </Heading>

                            <Alert size="small" variant="info" className="mb-4">
                                <FormattedMessage id="modal.settpaavent.info" />
                            </Alert>

                            <Table className="punch_mappetabell">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>
                                            <FormattedMessage id="tabell.journalpostid" />
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <FormattedMessage id="tabell.mottakelsesdato" />
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <FormattedMessage id="tabell.typeinnsdending" />
                                        </Table.HeaderCell>

                                        <Table.HeaderCell
                                            aria-label={intlHelper(intl, 'modal.settpaavent.visjournalpost')}
                                        />
                                        <Table.HeaderCell
                                            aria-label={intlHelper(intl, 'modal.settpaavent.registrer')}
                                        />
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {journalposter.map((j) => (
                                        <Table.Row key={j.journalpostId}>
                                            <Table.DataCell>{j.journalpostId}</Table.DataCell>
                                            <Table.DataCell>{j.dato}</Table.DataCell>
                                            <Table.DataCell>{j.punsjInnsendingType?.navn || ''}</Table.DataCell>
                                            <Table.DataCell>
                                                <Link href={pdfUrl(j)} target="_blank" rel="noreferrer">
                                                    <EyeFillIcon title="Vis journalpost" />

                                                    <FormattedMessage id="modal.settpaavent.visjournalpost" />
                                                </Link>
                                            </Table.DataCell>
                                            <Table.DataCell>
                                                <Button
                                                    variant="secondary"
                                                    size="small"
                                                    onClick={() => {
                                                        window.location.href = urlTilNyJournalpost(
                                                            soknadId,
                                                            j.journalpostId,
                                                        );
                                                    }}
                                                >
                                                    <FormattedMessage id="modal.settpaavent.registrer" />
                                                </Button>
                                            </Table.DataCell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    )}
                </>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={submit} size="small">
                    <FormattedMessage id="skjema.knapp.settpaavent" />
                </Button>

                <Button variant="secondary" onClick={onClose} size="small">
                    <FormattedMessage id="skjema.knapp.avbryt" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SettPaaVentModal;
