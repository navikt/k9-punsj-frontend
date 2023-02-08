import BrevComponent from 'app/components/brev/BrevComponent';
import BrevContainer from 'app/components/brev/BrevContainer';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { IJournalpost } from 'app/models/types';
import { setJournalpostPaaVentResetAction } from 'app/state/actions';
import {
    ferdigstillJournalpost,
    ferdigstillJournalpostResetAction,
} from 'app/state/actions/FordelingFerdigstillJournalpostActions';
import { settJournalpostPaaVent } from 'app/state/actions/FordelingSettPaaVentActions';
import { opprettGosysOppgave } from 'app/state/actions/GosysOppgaveActions';
import { RootStateType } from 'app/state/RootState';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import FerdigstillJournalpostErrorModal from './FerdigstillJournalpostErrorModal';
import FerdigstillJournalpostModal from './FerdigstillJournalpostModal';
import OkGaaTilLosModal from './OkGaaTilLosModal';
import OpprettOppgaveIGosysModal from './OpprettOppgaveIGosysModal';
import SettPaaVentErrorModal from './SettPaaVentErrorModal';
import SettPaaVentModal from './SettPaaVentModal';

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
    const dispatch = useDispatch();
    const showSettPaaVentSuccessModal = useSelector(
        (state: RootStateType) => state.fordelingSettPåVentState.settPaaVentSuccess
    );
    const showSettPaaVentErrorModal = useSelector(
        (state: RootStateType) => state.fordelingSettPåVentState.settPaaVentError
    );
    const showFerdigstillJournalpostSuccessModal = useSelector(
        (state: RootStateType) => state.fordelingFerdigstillJournalpostState.ferdigstillJournalpostSuccess
    );
    const showFerdigstillJournalpostErrorModal = useSelector(
        (state: RootStateType) => state.fordelingFerdigstillJournalpostState.ferdigstillJournalpostError
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
        <AlertStripeAdvarsel className="fordeling-brevIkkeSendtinfo">
            <FormattedMessage id="fordeling.inntektsmeldingUtenKrav.brevIkkeSendt" />
        </AlertStripeAdvarsel>
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
                <Hovedknapp mini onClick={() => setShowOpprettOppgaveIGosysModal(true)}>
                    <FormattedMessage id="fordeling.sakstype.ANNET" />
                </Hovedknapp>
            );
        }

        if (skalFerdigstilleJournalpost()) {
            return (
                <Hovedknapp mini onClick={() => setShowFerdigstillJournalpostModal(true)}>
                    <FormattedMessage id="skjema.knapp.ferdigstillJournalpost" />
                </Hovedknapp>
            );
        }

        if (skalSetteInntektsmeldingUtenKravPåVent()) {
            return (
                <Hovedknapp mini onClick={() => setShowSettPaaVentModal(true)}>
                    <FormattedMessage id="skjema.knapp.settpaavent" />
                </Hovedknapp>
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
                    journalpostId={journalpost?.journalpostId || ''}
                    setVisBrevIkkeSendtInfoboks={setVisBrevIkkeSendtInfoboks}
                    sakstype="OMP"
                />
            </BrevContainer>

            {getUtførValgKnapp()}

            {showSettPaaVentModal && (
                <ModalWrapper
                    className="settpaaventmodal"
                    onRequestClose={() => setShowSettPaaVentModal(false)}
                    contentLabel="settpaaventmodal"
                    isOpen
                    closeButton={false}
                >
                    <SettPaaVentModal submit={() => handleSettPaaVent()} avbryt={() => setShowSettPaaVentModal(false)}>
                        {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                    </SettPaaVentModal>
                </ModalWrapper>
            )}
            {showSettPaaVentSuccessModal && (
                <ModalWrapper
                    onRequestClose={() => resetSetPåVent()}
                    contentLabel="settpaaventokmodal"
                    closeButton={false}
                    isOpen
                >
                    <OkGaaTilLosModal melding="modal.settpaavent.til" />
                </ModalWrapper>
            )}
            {showSettPaaVentErrorModal && (
                <ModalWrapper
                    onRequestClose={() => resetSetPåVent()}
                    contentLabel="settpaaventokmodal"
                    closeButton={false}
                    isOpen
                >
                    <SettPaaVentErrorModal close={() => resetSetPåVent()} />
                </ModalWrapper>
            )}
            {showFerdigstillJournalpostModal && (
                <ModalWrapper
                    onRequestClose={() => setShowFerdigstillJournalpostModal(false)}
                    contentLabel="ferdigstill journalpostmodal"
                    closeButton={false}
                    isOpen
                >
                    <FerdigstillJournalpostModal
                        submit={() => handleFerdigstillJournalpost()}
                        avbryt={() => setShowFerdigstillJournalpostModal(false)}
                    >
                        {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                    </FerdigstillJournalpostModal>
                </ModalWrapper>
            )}
            {journalpost && showOpprettOppgaveIGosysModal && (
                <ModalWrapper
                    className="opprettOppgaveIGosysModal"
                    onRequestClose={() => setShowOpprettOppgaveIGosysModal(false)}
                    contentLabel="opprettOppgaveIGosysModal"
                    isOpen
                    closeButton={false}
                >
                    <OpprettOppgaveIGosysModal
                        submit={() => dispatch(opprettGosysOppgave(journalpost.journalpostId, søkerId, 'Annet'))}
                        avbryt={() => setShowOpprettOppgaveIGosysModal(false)}
                    >
                        {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                    </OpprettOppgaveIGosysModal>
                </ModalWrapper>
            )}
            {showFerdigstillJournalpostSuccessModal && (
                <ModalWrapper
                    onRequestClose={() => resetFerdigstillJournalpost()}
                    contentLabel="ferdigstill journalpostOkModal"
                    closeButton={false}
                    isOpen
                >
                    <OkGaaTilLosModal melding="modal.ferdigstilljournalpost" />
                </ModalWrapper>
            )}
            {showFerdigstillJournalpostErrorModal && (
                <ModalWrapper
                    onRequestClose={() => resetFerdigstillJournalpost()}
                    contentLabel="ferdigstill journalpostFeilModal"
                    closeButton={false}
                    isOpen
                >
                    <FerdigstillJournalpostErrorModal close={() => resetFerdigstillJournalpost()} />
                </ModalWrapper>
            )}
        </>
    );
};

export default HåndterInntektsmeldingUtenKrav;
