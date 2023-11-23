import * as React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { ErrorBoundary } from '@sentry/react';

import { JournalpostOgPdfVisning } from 'app/components/JournalpostOgPdfVisning';
import { PLSRegistreringsValg } from 'app/pleiepenger-livets-sluttfase/containers/PLSRegistreringsValg';
import { PLSPunchForm } from 'app/pleiepenger-livets-sluttfase/containers/PLSPunchForm';
import { PLSKvitteringContainer } from 'app/pleiepenger-livets-sluttfase/containers/PLSKvittering';
import { OMPKSRegistreringsValg } from 'app/omsorgspenger-kronisk-sykt-barn/containers/OMPKSRegistreringsValg';
import { OMPKSPunchForm } from 'app/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm';
import { OMPMARegistreringsValg } from 'app/omsorgspenger-midlertidig-alene/containers/OMPMARegistreringsValg';
import OMPMAPunchFormContainer from 'app/omsorgspenger-midlertidig-alene/containers/OMPMAPunchFormContainer';
import { ROUTES } from 'app/constants/routes';
import { Fordeling } from './pleiepenger/Fordeling/Fordeling';
import { RegistreringsValg as PSBRegistreringsValg } from './pleiepenger/RegistreringsValg';
import { PSBPunchForm } from './pleiepenger/PSBPunchForm';
import ErrorFallback from './ErrorFallback';
import { PSBKvitteringContainer } from './pleiepenger/SoknadKvittering/SoknadKvitteringContainer';

const JournalpostRouter: React.FunctionComponent = () => {
    const { journalpostid } = useParams<{ journalpostid: string }>();

    if (!journalpostid) {
        return null;
    }

    return (
        <JournalpostOgPdfVisning journalposter={[journalpostid]}>
            <ErrorBoundary fallback={<ErrorFallback />}>
                <Routes>
                    <Route path={ROUTES.PSB_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PSBRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.PUNCH} element={<PSBPunchForm journalpostid={journalpostid} />} />
                        <Route path={`${ROUTES.PUNCH}${ROUTES.KVITTERING}`} element={<PSBKvitteringContainer />} />
                    </Route>
                    <Route path={ROUTES.PLS_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PLSRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.PUNCH} element={<PLSPunchForm journalpostid={journalpostid} />} />
                        <Route path={`${ROUTES.PUNCH}${ROUTES.KVITTERING}`} element={<PLSKvitteringContainer />} />
                    </Route>
                    <Route path={ROUTES.OMPKS_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPKSRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.PUNCH} element={<OMPKSPunchForm journalpostid={journalpostid} />} />
                    </Route>
                    <Route path={ROUTES.OMPMA_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<OMPMARegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route
                            path={ROUTES.PUNCH}
                            element={<OMPMAPunchFormContainer journalpostid={journalpostid} />}
                        />
                    </Route>

                    <Route path="/" element={<Fordeling />} />
                </Routes>
            </ErrorBoundary>
        </JournalpostOgPdfVisning>
    );
};

export default JournalpostRouter;
