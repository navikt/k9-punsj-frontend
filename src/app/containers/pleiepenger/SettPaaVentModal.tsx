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
        </div>
    );
};

export default SettPaaVentModal;
