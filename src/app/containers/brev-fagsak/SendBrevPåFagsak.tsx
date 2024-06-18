import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heading } from '@navikt/ds-react';
import { FordelingDokumenttype } from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction } from 'app/state/actions';
import Fagsak from 'app/types/Fagsak';
import { finnForkortelseForDokumenttype } from 'app/utils';
import { ROUTES } from 'app/constants/routes';
import BrevComponent from '../../components/brev/BrevComponent';

import './sendBrevPåFagsak.less';

interface StateProps {
    fagsak?: Fagsak;
    søkerId?: string;
    journalpost?: IJournalpost;
    dokumenttype?: FordelingDokumenttype;
}

interface DispatchProps {
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
}

const SendBrevPåFagsak: React.FC<StateProps & DispatchProps> = ({
    fagsak,
    søkerId,
    journalpost,
    lukkJournalpostOppgave,
    dokumenttype,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!søkerId || !journalpost) {
            navigate(location.pathname.replace(ROUTES.SEND_BREV_FAGSAK, ''));
        }
    }, []);

    if (!søkerId || !journalpost) {
        return null;
    }

    const sakstype = fagsak?.sakstype || finnForkortelseForDokumenttype(dokumenttype) || '';

    return (
        <div className="sendBrevPåFagsak">
            <Heading size="small" level="1">
                <FormattedMessage id={`sendBrevPåFagsak.header`} />
            </Heading>

            <BrevComponent
                søkerId={søkerId}
                sakstype={sakstype}
                fagsakId={fagsak?.fagsakId}
                journalpostId={journalpost?.journalpostId}
                lukkJournalpostOppgave={() => lukkJournalpostOppgave(journalpost?.journalpostId, søkerId, fagsak)}
            />
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    fagsak: state.fordelingState.fagsak,
    dokumenttype: state.fordelingState.dokumenttype,
    søkerId: state.identState.søkerId,
});

const mapDispatchToProps = (dispatch: any) => ({
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
});

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SendBrevPåFagsak);
