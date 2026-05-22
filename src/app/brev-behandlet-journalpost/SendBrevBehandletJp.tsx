import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Heading } from '@navikt/ds-react';

import { RootStateType } from 'app/state/RootState';
import { ROUTES } from 'app/constants/routes';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import { utledSakstypeForBehandletJournalpostBrev } from 'app/components/brev/brevSakstypeUtils';

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
    const tilbakePath = location.pathname.replace(ROUTES.BREV_BEHANDLET_JP, '');
    const sakstype = utledSakstypeForBehandletJournalpostBrev({
        journalpostSakstype: sak?.sakstype,
        dokumenttype: fordelingState.dokumenttype,
    });

    if (!norskIdent) {
        return null;
    }

    if (!sakstype) {
        return (
            <Box margin="space-16" className="space-y-4">
                <Heading size="small" level="1">
                    <FormattedMessage id="sendBrevBehandletJournalpost.header" />
                </Heading>
                <Alert variant="warning">
                    <FormattedMessage id="sendBrevBehandletJournalpost.uavklartSakstype" />
                </Alert>
                <Button size="small" variant="secondary" onClick={() => navigate(tilbakePath)}>
                    <FormattedMessage id="brevComponent.btn.tilbake" />
                </Button>
            </Box>
        );
    }

    return (
        <Box margin="space-16">
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
        </Box>
    );
};

export default SendBrevBehandletJp;
