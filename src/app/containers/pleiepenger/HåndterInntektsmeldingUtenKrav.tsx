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
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import FerdigstillJournalpostErrorModal from './FerdigstillJournalpostErrorModal';
import FerdigstillJournalpostModal from './FerdigstillJournalpostModal';
import OkGaaTilLosModal from './OkGaaTilLosModal';
import OpprettOppgaveIGosysModal from './OpprettOppgaveIGosysModal';
import SettPaaVentErrorModal from './SettPaaVentErrorModal';
import SettPaaVentModal from './SettPaaVentModal';

interface Props {
    journalpost?: IJournalpost;
    ident1: string;
}

const HåndterInntektsmeldingUtenKrav: React.FC<Props> = ({ journalpost, ident1 }) => {
    const [showSettPaaVentModal, setShowSettPaaVentModal] = useState(false);
    const [showFerdigstillJournalpostModal, setShowFerdigstillJournalpostModal] = useState(false);
    const [showOpprettOppgaveIGosysModal, setShowOpprettOppgaveIGosysModal] = useState(false);
    const [visBrevIkkeSendtInfoboks, setVisBrevIkkeSendtInfoboks] = useState(false);
    const [håndterInntektsmeldingUtenKravValg, setHåndterInntektsmeldingUtenKravValg] = useState<string>('');
    const dispatch = useDispatch();
    const intl = useIntl();
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
        dispatch(ferdigstillJournalpost(journalpost?.journalpostId || '', ident1));
        setShowFerdigstillJournalpostModal(false);
    };

    const getBrevIkkeSendtInfoboks = () => (
        <AlertStripeAdvarsel className="fordeling-brevIkkeSendtinfo">
            Påbegynt brev er ikke sendt. Dersom du går videre vil ikke brev gå ut.
        </AlertStripeAdvarsel>
    );

    const resetSetPåVent = () => dispatch(setJournalpostPaaVentResetAction());
    const resetFerdigstillJournalpost = () => dispatch(ferdigstillJournalpostResetAction());

    const handleUtgåttInntektsmelding = (valgtHåndtering: string) => {
        setHåndterInntektsmeldingUtenKravValg(valgtHåndtering);
    };

    const skalOppretteGosysoppgaveForUtgåttInntektsmelding = () =>
        håndterInntektsmeldingUtenKravValg === 'opprettJournalføringsoppgave' && ident1;
    const skalFerdigstilleJournalpost = () => håndterInntektsmeldingUtenKravValg === 'ferdigstillJournalpost' && ident1;

    const skalSetteUtgåttInntektsmeldingPåVent = () => håndterInntektsmeldingUtenKravValg === 'settPåVent' && ident1;

    const getUtførValgKnapp = () => {
        if (skalOppretteGosysoppgaveForUtgåttInntektsmelding()) {
            return (
                <Hovedknapp mini onClick={() => setShowOpprettOppgaveIGosysModal(true)}>
                    <FormattedMessage id="fordeling.sakstype.ANNET" />
                </Hovedknapp>
            );
        }

        if (skalFerdigstilleJournalpost()) {
            return (
                <Hovedknapp mini onClick={() => setShowFerdigstillJournalpostModal(true)}>
                    {intlHelper(intl, 'skjema.knapp.ferdigstillJournalpost')}
                </Hovedknapp>
            );
        }

        if (skalSetteUtgåttInntektsmeldingPåVent()) {
            return (
                <Hovedknapp mini onClick={() => setShowSettPaaVentModal(true)}>
                    {intlHelper(intl, 'skjema.knapp.settpaavent')}
                </Hovedknapp>
            );
        }
        return null;
    };

    return (
        <>
            <VerticalSpacer fourtyPx />
            <RadioPanelGruppe
                name="utgåttInntektsmelding"
                radios={[
                    {
                        label: 'Ferdigstill journalpost',
                        value: 'ferdigstillJournalpost',
                    },
                    {
                        label: 'Opprett journalføringsoppgave i Gosys',
                        value: 'opprettJournalføringsoppgave',
                    },
                    {
                        label: 'Sett på vent',
                        value: 'settPåVent',
                    },
                ]}
                legend="Hva ønsker du å gjøre med dokumentet?"
                checked={håndterInntektsmeldingUtenKravValg}
                onChange={(event) => handleUtgåttInntektsmelding((event.target as HTMLInputElement).value)}
            />
            <BrevContainer>
                <BrevComponent
                    søkerId={ident1}
                    journalpostId={journalpost?.journalpostId || ''}
                    setVisBrevIkkeSendtInfoboks={setVisBrevIkkeSendtInfoboks}
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
                        submit={() => dispatch(opprettGosysOppgave(journalpost.journalpostId, ident1, 'Annet'))}
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
