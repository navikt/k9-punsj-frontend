import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Button, Heading } from '@navikt/ds-react';

import { SplitView } from 'app/components/SplitView';
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
    const history = useHistory();
    if (!søkerId || !journalpost) {
        history.goBack();
        return null;
    }

    const sakstype = fagsak?.sakstype || finnForkortelseForDokumenttype(dokumenttype) || '';

    return (
        <SplitView>
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
        </SplitView>
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
