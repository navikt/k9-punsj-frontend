import * as React from 'react';
import { useIntl } from 'react-intl';

import { Alert, Button } from '@navikt/ds-react';

import { ApiPath } from '../../apiConfig';
import VisSvg from '../../assets/SVG/VisSVG';
import { IJournalpostInfo } from '../../models/types';
import { apiUrl } from '../../utils';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

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

                    <table className="tabell tabell--stripet punch_mappetabell">
                        <thead>
                            <tr>
                                <th>{intlHelper(intl, 'tabell.journalpostid')}</th>
                                <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                                <th>{intlHelper(intl, 'tabell.typeinnsdending')}</th>
                                <th aria-label={intlHelper(intl, 'modal.settpaavent.visjournalpost')} />
                                <th aria-label={intlHelper(intl, 'modal.settpaavent.registrer')} />
                            </tr>
                            <tr />
                        </thead>
                        <tbody>
                            {journalposter.map((j, i) => (
                                <tr key={j.journalpostId}>
                                    <td>{j.journalpostId}</td>
                                    <td>{j.dato}</td>
                                    <td>{j.punsjInnsendingType.navn}</td>
                                    <td>
                                        <a className="visjp" href={pdfUrl(j)} target="_blank" rel="noreferrer">
                                            <VisSvg title="vis" />
                                            <div className="vistext">
                                                {intlHelper(intl, 'modal.settpaavent.visjournalpost')}
                                            </div>
                                        </a>
                                    </td>
                                    <td>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => {
                                                window.location.href = urlTilNyJournalpost(soknadId, j.journalpostId);
                                            }}
                                        >
                                            {intlHelper(intl, 'modal.settpaavent.registrer')}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default SettPaaVentModal;
