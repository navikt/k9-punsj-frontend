import { Alert, Button, Modal } from '@navikt/ds-react';
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
    ident1: string;
}

const opprettJournalføringsoppgaveValue = 'opprettJournalføringsoppgave';
const ferdigstillJournalpostValue = 'ferdigstillJournalpost';
const settPåVentValue = 'settPåVent';
const HåndterInntektsmeldingUtenKrav: React.FC<Props> = ({ journalpost, ident1 }) => {
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
        dispatch(ferdigstillJournalpost(journalpost?.journalpostId || '', ident1));
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
        håndterInntektsmeldingUtenKravValg === opprettJournalføringsoppgaveValue && ident1;
    const skalFerdigstilleJournalpost = () =>
        håndterInntektsmeldingUtenKravValg === ferdigstillJournalpostValue && ident1;

    const skalSetteInntektsmeldingUtenKravPåVent = () =>
        håndterInntektsmeldingUtenKravValg === settPåVentValue && ident1;

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
                    søkerId={ident1}
                    journalpostId={journalpost?.journalpostId || ''}
                    setVisBrevIkkeSendtInfoboks={setVisBrevIkkeSendtInfoboks}
                    sakstype="OMP"
                />
            </BrevContainer>

            {getUtførValgKnapp()}

            {showSettPaaVentModal && (
                <Modal
                    className="settpaaventmodal"
                    onClose={() => setShowSettPaaVentModal(false)}
                    aria-label="settpaaventmodal"
                    open
                    closeButton={false}
                >
                    <SettPaaVentModal submit={() => handleSettPaaVent()} avbryt={() => setShowSettPaaVentModal(false)}>
                        {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                    </SettPaaVentModal>
                </Modal>
            )}
            {showSettPaaVentSuccessModal && (
                <Modal onClose={() => resetSetPåVent()} aria-label="settpaaventokmodal" closeButton={false} open>
                    <OkGaaTilLosModal melding="modal.settpaavent.til" />
                </Modal>
            )}
            {showSettPaaVentErrorModal && (
                <Modal onClose={() => resetSetPåVent()} aria-label="settpaaventokmodal" closeButton={false} open>
                    <SettPaaVentErrorModal close={() => resetSetPåVent()} />
                </Modal>
            )}
            {showFerdigstillJournalpostModal && (
                <Modal
                    onClose={() => setShowFerdigstillJournalpostModal(false)}
                    aria-label="ferdigstill journalpostmodal"
                    closeButton={false}
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
                    closeButton={false}
                >
                    <OpprettOppgaveIGosysModal
                        submit={() => dispatch(opprettGosysOppgave(journalpost.journalpostId, ident1, 'Annet'))}
                        avbryt={() => setShowOpprettOppgaveIGosysModal(false)}
                    >
                        {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                    </OpprettOppgaveIGosysModal>
                </Modal>
            )}
            {showFerdigstillJournalpostSuccessModal && (
                <Modal
                    onClose={() => resetFerdigstillJournalpost()}
                    aria-label="ferdigstill journalpostOkModal"
                    closeButton={false}
                    open
                >
                    <OkGaaTilLosModal melding="modal.ferdigstilljournalpost" />
                </Modal>
            )}
            {showFerdigstillJournalpostErrorModal && (
                <Modal
                    onClose={() => resetFerdigstillJournalpost()}
                    aria-label="ferdigstill journalpostFeilModal"
                    closeButton={false}
                    open
                >
                    <FerdigstillJournalpostErrorModal close={() => resetFerdigstillJournalpost()} />
                </Modal>
            )}
        </>
    );
};

export default HåndterInntektsmeldingUtenKrav;
