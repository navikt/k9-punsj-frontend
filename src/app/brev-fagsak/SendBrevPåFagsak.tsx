import React, { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { RootStateType } from 'app/state/RootState';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction } from 'app/state/actions';
import { finnForkortelseForDokumenttype } from 'app/utils';
import { ROUTES } from 'app/constants/routes';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';

import './sendBrevPåFagsak.less';

const SendBrevPåFagsakLukkOppgave: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    const [visErDuSikkerLukkModal, setVisErDuSikkerLukkModal] = useState<boolean>(false);

    const location = useLocation();

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const identState = useSelector((state: RootStateType) => state.identState);

    const { fagsak, dokumenttype, lukkOppgaveDone, isAwaitingLukkOppgaveResponse, lukkOppgaveError } = fordelingState;
    const { søkerId } = identState;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!søkerId || !journalpost) {
            navigate(location.pathname.replace(ROUTES.SEND_BREV_FAGSAK, ''));
        }
    }, []);

    if (!søkerId || !journalpost || !fagsak) {
        return null;
    }

    const sakstype = fagsak?.sakstype || finnForkortelseForDokumenttype(dokumenttype) || '';

    const lukkJournalpostOppgave = () =>
        dispatch(lukkJournalpostOppgaveAction(journalpost.journalpostId, søkerId, fagsak));
    const lukkOppgaveReset = () => dispatch(lukkOppgaveResetAction());

    return (
        <div className="sendBrevPåFagsak">
            <div className="mb-10">
                <Heading size="medium" level="1">
                    <FormattedMessage id="sendBrevPåFagsak.header" />
                </Heading>
            </div>

            <BrevComponent
                søkerId={søkerId}
                sakstype={sakstype}
                fagsakId={fagsak?.fagsakId}
                journalpostId={journalpost?.journalpostId}
            />

            {lukkOppgaveError && (
                <Alert variant="error" size="medium" className="mb-4" fullWidth inline>
                    <FormattedMessage id="sendBrevPåFagsak.error.lukkOppgave" />
                </Alert>
            )}

            <Button
                className="mt-6"
                variant="secondary"
                size="small"
                onClick={() => setVisErDuSikkerLukkModal(true)}
                type="button"
                loading={isAwaitingLukkOppgaveResponse}
            >
                <FormattedMessage id="sendBrevPåFagsak.btn.lukkOppgave" />
            </Button>

            {lukkOppgaveDone && (
                <OkGåTilLosModal
                    meldingId="sendBrevPåFagsak.modal.gåTilLos.melding"
                    onClose={() => {
                        lukkOppgaveReset();
                    }}
                />
            )}

            {visErDuSikkerLukkModal && (
                <ErDuSikkerModal
                    melding="sendBrevPåFagsak.modal.erdusikker.lukkoppgave"
                    modalKey="erdusikker.lukkoppgave"
                    open={visErDuSikkerLukkModal}
                    submitKnappText="modal.erdusikker.fortsett"
                    onSubmit={() => {
                        lukkJournalpostOppgave();
                        setVisErDuSikkerLukkModal(false);
                    }}
                    onClose={() => setVisErDuSikkerLukkModal(false)}
                />
            )}
        </div>
    );
};

export default SendBrevPåFagsakLukkOppgave;
