import React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Button, Heading } from '@navikt/ds-react';

import { FordelingDokumenttype } from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction } from 'app/state/actions';
import Fagsak from 'app/types/Fagsak';
import { finnForkortelseForDokumenttype } from 'app/utils';

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
    if (!søkerId || !journalpost) {
        navigate(-1);
        return null;
    }

    const sakstype = fagsak?.k9FagsakYtelseType || finnForkortelseForDokumenttype(dokumenttype) || '';

    return (
        <div className="sendBrevPåFagsak">
            <Heading size="small" level="1">
                Send brev og lukk oppgave i LOS
            </Heading>
            <BrevComponent
                søkerId={søkerId}
                sakstype={sakstype}
                fagsakId={fagsak?.fagsakId}
                journalpostId={journalpost?.journalpostId}
            />
            <Button
                className="submitButton"
                size="small"
                onClick={() => lukkJournalpostOppgave(journalpost?.journalpostId, søkerId, fagsak)}
            >
                Lukk oppgave
            </Button>
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    fagsak: state.fordelingState.fagsak,
    dokumenttype: state.fordelingState.dokumenttype,
    søkerId: state.identState.søkerId,
});
const mapDispatchToProps = (dispatch) => ({
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
});

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SendBrevPåFagsak);
