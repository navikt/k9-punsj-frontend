import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Button, Heading, Modal, Table } from '@navikt/ds-react';

import { ApiPath } from '../../apiConfig';
import VisSvg from '../../assets/SVG/VisSVG';
import { IJournalpostInfo } from '../../models/types';
import { apiUrl } from '../../utils';
import intlHelper from '../../utils/intlUtils';

import './settPåVentModal.less';

interface Props {
    submit: () => void;
    avbryt: () => void;

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

    const { submit, avbryt, journalposter, soknadId, children } = props;

    return (
        <Modal
            key="settpaaventmodal"
            className="settpaaventmodal"
            onClose={avbryt}
            aria-label="settpaaventmodal"
            data-testid="settpaaventmodal"
            open
        >
            <div className="sett-paa-vent pt-4 pb-4">
                <Heading size="medium" level="2">
                    <FormattedMessage id="skjema.knapp.settpaavent" />
                </Heading>

                <p>
                    <FormattedMessage id="skjema.settpaavent.periode" />
                </p>

                {children}

                <div className="knapper">
                    <Button variant="secondary" onClick={() => avbryt()} size="small">
                        <FormattedMessage id="skjema.knapp.avbryt" />
                    </Button>
                    <Button onClick={() => submit()} size="small">
                        <FormattedMessage id="skjema.knapp.settpaavent" />
                    </Button>
                </div>

                {journalposter && journalposter.length > 0 && soknadId && (
                    <div className="pt-4 pb-4">
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
                                                    <FormattedMessage id="modal.settpaavent.visjournalpost" />
                                                </div>
                                            </a>
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
            </div>
        </Modal>
    );
};

export default SettPaaVentModal;
