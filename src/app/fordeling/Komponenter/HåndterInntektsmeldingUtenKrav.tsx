import React, { useMemo, useState } from 'react';

import { Alert, Button } from '@navikt/ds-react';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import VerticalSpacer from 'app/components/VerticalSpacer';
import BrevContainer from 'app/components/brev/BrevContainer';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import { IJournalpost } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { setJournalpostPaaVentResetAction } from 'app/state/actions';
import {
    ferdigstillJournalpost,
    ferdigstillJournalpostResetAction,
} from 'app/state/actions/FordelingFerdigstillJournalpostActions';
import { settJournalpostPaaVent } from 'app/state/actions/FordelingSettPaaVentActions';
import { opprettGosysOppgave } from 'app/state/actions/GosysOppgaveActions';
import { erYngreEnn18år } from 'app/utils/validationHelpers';
import OkGåTilLosModal from '../../components/okGåTilLosModal/OkGåTilLosModal';
import SettPaaVentModal from '../../components/settPåVentModal/SettPåVentModal';
import ErrorModal from './ErrorModal';

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

    const isSubmitDisabled = useMemo(
        () => IdentRules.erUgyldigIdent(søkerId) || (!IdentRules.erUgyldigIdent(søkerId) && erYngreEnn18år(søkerId)),
        [søkerId],
    );

    const getUtførValgKnapp = () => {
        if (skalOppretteGosysoppgaveForInntektsmeldingUtenKrav()) {
            return (
                <Button size="small" onClick={() => setShowOpprettOppgaveIGosysModal(true)} disabled={isSubmitDisabled}>
                    <FormattedMessage id="fordeling.sakstype.ANNET" />
                </Button>
            );
        }

        if (skalFerdigstilleJournalpost()) {
            return (
                <Button
                    size="small"
                    onClick={() => setShowFerdigstillJournalpostModal(true)}
                    disabled={isSubmitDisabled}
                >
                    <FormattedMessage id="skjema.knapp.ferdigstillJournalpost" />
                </Button>
            );
        }

        if (skalSetteInntektsmeldingUtenKravPåVent()) {
            return (
                <Button size="small" onClick={() => setShowSettPaaVentModal(true)} disabled={isSubmitDisabled}>
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
                <SettPaaVentModal submit={() => handleSettPaaVent()} onClose={() => setShowSettPaaVentModal(false)}>
                    {visBrevIkkeSendtInfoboks && getBrevIkkeSendtInfoboks()}
                </SettPaaVentModal>
            )}

            {showSettPaaVentSuccessModal && (
                <OkGåTilLosModal
                    meldingId="modal.settpaavent.til"
                    onClose={() => {
                        resetSetPåVent();
                    }}
                />
            )}

            {showSettPaaVentErrorModal && <ErrorModal onClose={() => resetSetPåVent()} />}

            {showFerdigstillJournalpostModal && (
                <ErDuSikkerModal
                    melding="fordeling.inntektsmeldingUtenKrav.erDuSikkerModal.ferdigstill"
                    modalKey="erdusikker.ferdigstill"
                    open={showFerdigstillJournalpostModal}
                    submitKnappText="modal.erdusikker.fortsett"
                    extraInfo={visBrevIkkeSendtInfoboks ? 'fordeling.inntektsmeldingUtenKrav.brevIkkeSendt' : undefined}
                    onSubmit={handleFerdigstillJournalpost}
                    onClose={() => setShowFerdigstillJournalpostModal(false)}
                />
            )}

            {!!journalpost && showOpprettOppgaveIGosysModal && (
                <ErDuSikkerModal
                    melding="fordeling.inntektsmeldingUtenKrav.erDuSikkerModal.opprettOppgaveIGosys"
                    modalKey="erdusikker.opprettOppgaveIGosys"
                    open={!!journalpost && showOpprettOppgaveIGosysModal}
                    submitKnappText="modal.erdusikker.fortsett"
                    extraInfo={visBrevIkkeSendtInfoboks ? 'fordeling.inntektsmeldingUtenKrav.brevIkkeSendt' : undefined}
                    onSubmit={() => dispatch(opprettGosysOppgave(journalpost.journalpostId, søkerId, 'Annet'))}
                    onClose={() => setShowOpprettOppgaveIGosysModal(false)}
                />
            )}

            {showFerdigstillJournalpostSuccessModal && (
                <OkGåTilLosModal
                    meldingId="modal.ferdigstilljournalpost"
                    onClose={() => {
                        resetFerdigstillJournalpost();
                    }}
                />
            )}

            {showFerdigstillJournalpostErrorModal && <ErrorModal onClose={() => resetFerdigstillJournalpost()} />}
        </>
    );
};

export default HåndterInntektsmeldingUtenKrav;
