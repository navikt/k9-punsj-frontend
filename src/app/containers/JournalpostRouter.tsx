import * as React from 'react';
import { Route, Routes, useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from '@sentry/react';

import { JournalpostOgPdfVisning } from 'app/components/JournalpostOgPdfVisning';
import { PLSRegistreringsValg } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSRegistreringsValg';
import { PLSPunchForm } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm';
import { OMPKSRegistreringsValg } from 'app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSRegistreringsValg';
import { OMPKSPunchForm } from 'app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm';
import { OMPMARegistreringsValg } from 'app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMARegistreringsValg';
import OMPMAPunchFormContainer from 'app/søknader/omsorgspenger-midlertidig-alene/containers/OMPMAPunchFormContainer';
import { OMPUTRegistreringsValg } from 'app/søknader/omsorgspenger-utbetaling/containers/OMPUTRegistreringsValg';
import OMPUTPunchFormContainer from 'app/søknader/omsorgspenger-utbetaling/containers/OMPUTPunchFormContainer';
import { OLPRegistreringsValg } from 'app/søknader/opplæringspenger/containers/OLPRegistreringsValg';
import OLPPunchFormContainer from 'app/søknader/opplæringspenger/containers/OLPPunchFormContainer';
import { OMPAORegistreringsValg } from 'app/søknader/omsorgspenger-alene-om-omsorgen/containers/OMPAORegistreringsValg';
import OMPAOPunchFormContainer from 'app/søknader/omsorgspenger-alene-om-omsorgen/containers/OMPAOPunchFormContainer';
import { ROUTES } from 'app/constants/routes';
import { RootStateType } from 'app/state/RootState';
import { logError } from 'app/utils/logUtils';
import Fordeling from '../Fordeling/Fordeling';
import { RegistreringsValg as PSBRegistreringsValg } from './pleiepenger/RegistreringsValg';
import { PSBPunchForm } from './pleiepenger/PSBPunchForm';
import ErrorFallback from './ErrorFallback';
import KorrigeringAvInntektsmeldingContainer from 'app/søknader/korrigeringAvInntektsmelding/KorrigeringAvInntektsmeldingContainer';
import SendBrevPåFagsak from './brev-fagsak/SendBrevPåFagsak';
import JournalførOgFortsettValg from '../Fordeling/Komponenter/JournalførOgFortsettValg';

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
                    <Route path={ROUTES.PSB_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.PSB_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PSBRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route path={ROUTES.PUNCH} element={<PSBPunchForm />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.PLS_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.PLS_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PLSRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route path={ROUTES.PUNCH} element={<PLSPunchForm />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPKS_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.OMPKS_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPKSRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route path={ROUTES.PUNCH} element={<OMPKSPunchForm />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPMA_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.OMPMA_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPMARegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route
                            path={ROUTES.PUNCH}
                            element={<OMPMAPunchFormContainer journalpostid={journalpostid} />}
                        />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPUT_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.OMPUT_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPUTRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route
                            path={ROUTES.PUNCH}
                            element={<OMPUTPunchFormContainer journalpostid={journalpostid} />}
                        />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OMPAO_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.OMPAO_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPAORegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route
                            path={ROUTES.PUNCH}
                            element={<OMPAOPunchFormContainer journalpostid={journalpostid} />}
                        />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.OLP_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.OLP_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OLPRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route path={ROUTES.PUNCH} element={<OLPPunchFormContainer journalpostid={journalpostid} />} />
                        <Route path="*" element={<Navigate to={ROUTES.VELG_SOKNAD} />} />
                    </Route>

                    <Route path={ROUTES.KORRIGERING_ROOT} element={<JournalførOgFortsettValg />} />
                    <Route path={ROUTES.KORRIGERING_ROOT}>
                        <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                        <Route
                            path={ROUTES.KORRIGERING_INNTEKTSMELDING}
                            element={<KorrigeringAvInntektsmeldingContainer />}
                        />
                        <Route
                            path={ROUTES.KORRIGERING_INNTEKTSMELDING_ID}
                            element={<KorrigeringAvInntektsmeldingContainer />}
                        />
                    </Route>
                    <Route path={ROUTES.SEND_BREV_FAGSAK} element={<SendBrevPåFagsak />} />
                    <Route path="/" element={<Fordeling />} />
                </Routes>
            </ErrorBoundary>
        </JournalpostOgPdfVisning>
    );
};

export default JournalpostRouter;
