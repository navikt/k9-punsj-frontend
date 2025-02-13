import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heading } from '@navikt/ds-react';

import { RootStateType } from 'app/state/RootState';
import { ROUTES } from 'app/constants/routes';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import { getForkortelseFraFordelingDokumenttype } from 'app/utils';

import './sendBrevBehandletJp.less';

const SendBrevBehandletJp: React.FC = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!journalpost) {
            navigate(location.pathname.replace(ROUTES.BREV_BEHANDLET_JP, ''));
        }
    }, []);

    if (!journalpost) {
        return null;
    }

    const { journalpostId, sak, norskIdent } = journalpost;

    const forkortelseFraFordelingDokumenttype = fordelingState.dokumenttype
        ? getForkortelseFraFordelingDokumenttype(fordelingState.dokumenttype)
        : undefined;

    const sakstype = sak?.sakstype || forkortelseFraFordelingDokumenttype;

    if (!norskIdent || !sakstype) {
        return null;
    }

    return (
        <div className="sendBrevBehandletJp">
            <Heading size="small" level="1">
                <FormattedMessage id="sendBrevBehandletJournalpost.header" />
            </Heading>

            <BrevComponent
                søkerId={norskIdent}
                sakstype={sakstype}
                fagsakId={sak?.fagsakId || 'GENERELL_SAK'}
                journalpostId={journalpostId}
                visTilbakeBtn={true}
            />
        </div>
    );
};

export default SendBrevBehandletJp;
