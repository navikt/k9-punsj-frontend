import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Button, Modal } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import BrevComponent from 'app/components/brev/BrevComponent';
import BrevContainer from 'app/components/brev/BrevContainer';
import { IJournalpost } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { setJournalpostPaaVentResetAction } from 'app/state/actions';
import {
    ferdigstillJournalpost,
    ferdigstillJournalpostResetAction,
} from 'app/state/actions/FordelingFerdigstillJournalpostActions';
import { settJournalpostPaaVent } from 'app/state/actions/FordelingSettPaaVentActions';
import { opprettGosysOppgave } from 'app/state/actions/GosysOppgaveActions';

import FerdigstillJournalpostErrorModal from './FerdigstillJournalpostErrorModal';
import FerdigstillJournalpostModal from './FerdigstillJournalpostModal';
import OkGåTilLosModal from '../../components/okGåTilLosModal/OkGåTilLosModal';
import OpprettOppgaveIGosysModal from './OpprettOppgaveIGosysModal';
import SettPåVentErrorModal from '../../components/settPåVentModal/SettPåVentErrorModal';
import SettPaaVentModal from '../../components/settPåVentModal/SettPåVentModal';
import { Dispatch } from 'redux';

interface Props {
    journalpost?: IJournalpost;
    søkerId: string;
}

const opprettJournalføringsoppgaveValue = 'opprettJournalføringsoppgave';
const ferdigstillJournalpostValue = 'ferdigstillJournalpost';
const settPåVentValue = 'settPåVent';
const HåndterInntektsmeldingUtenKrav: React.FC<Props> = ({ journalpost, søkerId }) => {
    const [showSettPaaVentModal, setShowSettPaaVentModal] = useState(false);
    const [showFerdigstillJournalpostModal, setShowFerdigstillJournalpostModal] = useState(false);
    const [showOpprettOppgaveIGosysModal, setShowOpprettOppgaveIGosysModal] = useState(false);
    const [visBrevIkkeSendtInfoboks, setVisBrevIkkeSendtInfoboks] = useState(false);
    const [håndterInntektsmeldingUtenKravValg, setHåndterInntektsmeldingUtenKravValg] = useState<string>('');

    const dispatch = useDispatch<Dispatch<any>>();

    const showSettPaaVentSuccessModal = useSelector(
        (state: RootStateType) => state.fordelingSettPåVentState.settPaaVentSuccess,
    );

    const showSettPaaVentErrorModal = useSelector(
        (state: RootStateType) => state.fordelingSettPåVentState.settPaaVentError,
    );

    const showFerdigstillJournalpostSuccessModal = useSelector(
        (state: RootStateType) => state.fordelingFerdigstillJournalpostState.ferdigstillJournalpostSuccess,
    );

    const showFerdigstillJournalpostErrorModal = useSelector(
        (state: RootStateType) => state.fordelingFerdigstillJournalpostState.ferdigstillJournalpostError,
    );

    const handleSettPaaVent = () => {
        dispatch(settJournalpostPaaVent(journalpost?.journalpostId || ''));
        setShowSettPaaVentModal(false);
    };

    const handleFerdigstillJournalpost = () => {
        dispatch(ferdigstillJournalpost(journalpost?.journalpostId || '', søkerId));
        setShowFerdigstillJournalpostModal(false);
    };

    const getBrevIkkeSendtInfoboks = () => (
        <Alert size="small" variant="warning" className="fordeling-brevIkkeSendtinfo">
            <FormattedMessage id="fordeling.inntektsmeldingUtenKrav.brevIkkeSendt" />
        </Alert>
    );

    const resetSetPåVent = () => dispatch(setJournalpostPaaVentResetAction());
    const resetFerdigstillJournalpost = () => dispatch(ferdigstillJournalpostResetAction());

    const handleInntektsmeldingUtenKrav = (valgtHåndtering: string) => {
        setHåndterInntektsmeldingUtenKravValg(valgtHåndtering);
    };

    const skalOppretteGosysoppgaveForInntektsmeldingUtenKrav = () =>
        håndterInntektsmeldingUtenKravValg === opprettJournalføringsoppgaveValue && søkerId;
    const skalFerdigstilleJournalpost = () =>
        håndterInntektsmeldingUtenKravValg === ferdigstillJournalpostValue && søkerId;

    const skalSetteInntektsmeldingUtenKravPåVent = () =>
        håndterInntektsmeldingUtenKravValg === settPåVentValue && søkerId;

    const getUtførValgKnapp = () => {
        if (skalOppretteGosysoppgaveForInntektsmeldingUtenKrav()) {
            return (
                <Button size="small" onClick={() => setShowOpprettOppgaveIGosysModal(true)}>
                    <FormattedMessage id="fordeling.sakstype.ANNET" />
                </Button>
            );
        }

        if (skalFerdigstilleJournalpost()) {
            return (
                <Button size="small" onClick={() => setShowFerdigstillJournalpostModal(true)}>
                    <FormattedMessage id="skjema.knapp.ferdigstillJournalpost" />
                </Button>
            );
        }

        if (skalSetteInntektsmeldingUtenKravPåVent()) {
            return (
                <Button size="small" onClick={() => setShowSettPaaVentModal(true)}>
                    <FormattedMessage id="skjema.knapp.settpaavent" />
                </Button>
            );
        }
        return null;
    };

    return (
        <>
            <VerticalSpacer fourtyPx />
            <RadioPanelGruppe
                name="inntektsmeldingUtenKrav"
                radios={[
                    {
                        label: 'Ferdigstill journalpost',
                        value: ferdigstillJournalpostValue,
                    },
                    {
                        label: 'Opprett journalføringsoppgave i Gosys',
                        value: opprettJournalføringsoppgaveValue,
                    },
                    {
                        label: 'Sett på vent',
                        value: settPåVentValue,
                    },
                ]}
                legend="Hva ønsker du å gjøre med dokumentet?"
                checked={håndterInntektsmeldingUtenKravValg}
                onChange={(event) => handleInntektsmeldingUtenKrav((event.target as HTMLInputElement).value)}
            />
            <BrevContainer>
                <BrevComponent
                    søkerId={søkerId}
                    sakstype="OMP"
                    journalpostId={journalpost?.journalpostId || ''}
                    setVisBrevIkkeSendtInfoboks={setVisBrevIkkeSendtInfoboks}
                />
            </BrevContainer>

            {getUtførValgKnapp()}

            {showSettPaaVentModal && (
                <SettPaaVentModal submit={() => handleSettPaaVent()} avbryt={() => setShowSettPaaVentModal(false)}>
                    {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                </SettPaaVentModal>
            )}

            {showSettPaaVentSuccessModal && (
                <OkGåTilLosModal
                    melding="modal.settpaavent.til"
                    onClose={() => {
                        resetSetPåVent();
                    }}
                />
            )}

            {showSettPaaVentErrorModal && <SettPåVentErrorModal onClose={() => resetSetPåVent()} />}

            {showFerdigstillJournalpostModal && (
                <Modal
                    onClose={() => setShowFerdigstillJournalpostModal(false)}
                    aria-label="ferdigstill journalpostmodal"
                    open
                >
                    <FerdigstillJournalpostModal
                        submit={() => handleFerdigstillJournalpost()}
                        avbryt={() => setShowFerdigstillJournalpostModal(false)}
                    >
                        {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                    </FerdigstillJournalpostModal>
                </Modal>
            )}

            {journalpost && showOpprettOppgaveIGosysModal && (
                <Modal
                    className="opprettOppgaveIGosysModal"
                    onClose={() => setShowOpprettOppgaveIGosysModal(false)}
                    aria-label="opprettOppgaveIGosysModal"
                    open
                >
                    <OpprettOppgaveIGosysModal
                        submit={() => dispatch(opprettGosysOppgave(journalpost.journalpostId, søkerId, 'Annet'))}
                        avbryt={() => setShowOpprettOppgaveIGosysModal(false)}
                    >
                        {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                    </OpprettOppgaveIGosysModal>
                </Modal>
            )}

            {showFerdigstillJournalpostSuccessModal && (
                <OkGåTilLosModal
                    melding="modal.ferdigstilljournalpost"
                    onClose={() => {
                        resetFerdigstillJournalpost();
                    }}
                />
            )}

            {showFerdigstillJournalpostErrorModal && (
                <Modal
                    onClose={() => {
                        resetFerdigstillJournalpost();
                    }}
                    aria-label="ferdigstill journalpostFeilModal"
                    open
                >
                    <FerdigstillJournalpostErrorModal close={() => resetFerdigstillJournalpost()} />
                </Modal>
            )}
        </>
    );
};

export default HåndterInntektsmeldingUtenKrav;
