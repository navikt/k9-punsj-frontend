import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heading } from '@navikt/ds-react';

import { RootStateType } from 'app/state/RootState';
import { ROUTES } from 'app/constants/routes';
import BrevComponent from 'app/components/brev/BrevComponent';

import './sendBrevBehandletJp.less';

const SendBrevBehandletJp: React.FC = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);

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

    if (!norskIdent || !sak?.sakstype) {
        return null;
    }

    return (
        <div className="sendBrevBehandletJp">
            <Heading size="small" level="1">
                <FormattedMessage id="sendBrevBehandletJournalpost.header" />
            </Heading>

            <BrevComponent
                søkerId={norskIdent}
                sakstype={sak?.sakstype}
                fagsakId={sak?.fagsakId}
                journalpostId={journalpostId}
                tilbake={true}
            />
        </div>
    );
};

export default SendBrevBehandletJp;
