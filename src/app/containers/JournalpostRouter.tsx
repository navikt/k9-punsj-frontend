import { ErrorBoundary } from '@sentry/react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes, useParams } from 'react-router';

import SendBrevBehandletJp from 'app/brev-behandlet-journalpost/SendBrevBehandletJp';
import SendBrevPåFagsakLukkOppgave from 'app/brev-fagsak/SendBrevPåFagsak';
import { JournalpostOgPdfVisning } from 'app/components/JournalpostOgPdfVisning';
import { ROUTES } from 'app/constants/routes';
import { RootStateType } from 'app/state/RootState';
import KorrigeringAvInntektsmeldingContainer from 'app/søknader/korrigeringAvInntektsmelding/containers/KorrigeringAvInntektsmeldingContainer';
import OMPAOPunchFormContainer from 'app/søknader/omsorgspenger-alene-om-omsorgen/containers/OMPAOPunchFormContainer';
import { OMPAORegistreringsValg } from 'app/søknader/omsorgspenger-alene-om-omsorgen/containers/OMPAORegistreringsValg';
import { OMPKSPunchForm } from 'app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm';
import { OMPKSRegistreringsValg } from 'app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSRegistreringsValg';
import OMPMAPunchFormContainer from 'app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchFormContainer';
import { OMPMARegistreringsValg } from 'app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMARegistreringsValg';
import OMPUTPunchFormContainer from 'app/søknader/omsorgspenger-utbetaling/containers/OMPUTPunchFormContainer';
import { OMPUTRegistreringsValg } from 'app/søknader/omsorgspenger-utbetaling/containers/OMPUTRegistreringsValg';
import OLPPunchFormContainer from 'app/søknader/opplæringspenger/containers/OLPPunchFormContainer';
import { OLPRegistreringsValg } from 'app/søknader/opplæringspenger/containers/OLPRegistreringsValg';
import { PLSPunchForm } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm';
import { PLSRegistreringsValg } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSRegistreringsValg';
import { PSBPunchForm } from 'app/søknader/pleiepenger/containers/PSBPunchForm';
import { PSBRegistreringsValg } from 'app/søknader/pleiepenger/containers/RegistreringsValg/PSBRegistreringsValg';
import { logError } from 'app/utils/logUtils';
import Fordeling from '../fordeling/Fordeling';
import BehandlingAvJournaførtJp from '../fordeling/Komponenter/BehandlingAvJournaførtJp';
import ErrorFallback from './ErrorFallback';

const JournalpostRouter: React.FC = () => {
    const { journalpostid } = useParams<{ journalpostid: string }>();
    const journalposterIAapenSoknad = useSelector((state: RootStateType) => state.felles.journalposterIAapenSoknad);

    if (!journalpostid) {
        return null;
    }

    return (
        <JournalpostOgPdfVisning
            journalposter={journalposterIAapenSoknad?.length ? journalposterIAapenSoknad : [journalpostid]}
        >
            <ErrorBoundary fallback={<ErrorFallback />} onError={logError}>
                <Routes>
                    <Route path={ROUTES.PSB_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.PSB_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PSBRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route path={ROUTES.PUNCH} element={<PSBPunchForm />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.PLS_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.PLS_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PLSRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route path={ROUTES.PUNCH} element={<PLSPunchForm />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPKS_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.OMPKS_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPKSRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route path={ROUTES.PUNCH} element={<OMPKSPunchForm />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPMA_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.OMPMA_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPMARegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route
                            path={ROUTES.PUNCH}
                            element={<OMPMAPunchFormContainer journalpostid={journalpostid} />}
                        />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPUT_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.OMPUT_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPUTRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route
                            path={ROUTES.PUNCH}
                            element={<OMPUTPunchFormContainer journalpostid={journalpostid} />}
                        />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPAO_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.OMPAO_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPAORegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route
                            path={ROUTES.PUNCH}
                            element={<OMPAOPunchFormContainer journalpostid={journalpostid} />}
                        />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OLP_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.OLP_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OLPRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route path={ROUTES.PUNCH} element={<OLPPunchFormContainer journalpostid={journalpostid} />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.KORRIGERING_ROOT} element={<BehandlingAvJournaførtJp />} />
                    <Route path={ROUTES.KORRIGERING_ROOT}>
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                        <Route
                            path={ROUTES.KORRIGERING_INNTEKTSMELDING}
                            element={<KorrigeringAvInntektsmeldingContainer />}
                        />
                        <Route
                            path={ROUTES.KORRIGERING_INNTEKTSMELDING_ID}
                            element={<KorrigeringAvInntektsmeldingContainer />}
                        />
                    </Route>
                    <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsakLukkOppgave />} />
                    <Route path={ROUTES.BREV_BEHANDLET_JP} element={<SendBrevBehandletJp />} />
                    <Route path="/" element={<Fordeling />} />
                </Routes>
            </ErrorBoundary>
        </JournalpostOgPdfVisning>
    );
};

export default JournalpostRouter;
