import { Button, Heading } from '@navikt/ds-react';
import { SplitView } from 'app/components/SplitView';
import { IJournalpost } from 'app/models/types';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import Fagsak from 'app/types/Fagsak';
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import BrevComponent from '../../components/brev/BrevComponent';
import './sendBrevPåFagsak.less';

interface StateProps {
    fagsak?: Fagsak;
    søkerId?: string;
    journalpost?: IJournalpost;
}

interface DispatchProps {
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
}

const SendBrevPåFagsak: React.FC<StateProps & DispatchProps> = ({
    fagsak,
    søkerId,
    journalpost,
    lukkJournalpostOppgave,
}) => {
    const history = useHistory();
    if (!fagsak || !søkerId || !journalpost) {
        history.goBack();
        return null;
    }

    return (
        <SplitView>
            <div className="sendBrevPåFagsak">
                <Heading size="small" level="1">
                    Send brev og lukk oppgave i LOS
                </Heading>
                <BrevComponent søkerId={søkerId} sakstype={fagsak.sakstype} fagsakId={fagsak.fagsakId} />
                <Button
                    className="submitButton"
                    size="small"
                    onClick={() => lukkJournalpostOppgave(journalpost?.journalpostId)}
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
    søkerId: state.identState.ident1,
});
const mapDispatchToProps = (dispatch) => ({
    lukkJournalpostOppgave: (journalpostId: string) => dispatch(lukkJournalpostOppgaveAction(journalpostId)),
});

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SendBrevPåFagsak);
