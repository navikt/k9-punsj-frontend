import * as React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { ErrorBoundary } from '@sentry/react';

import { JournalpostOgPdfVisning } from 'app/components/JournalpostOgPdfVisning';
import { PLSRegistreringsValg } from 'app/pleiepenger-livets-sluttfase/containers/PLSRegistreringsValg';
import { PLSPunchForm } from 'app/pleiepenger-livets-sluttfase/containers/PLSPunchForm';
import { PLSKvittering } from 'app/pleiepenger-livets-sluttfase/containers/PLSKvittering';
import { ROUTES } from 'app/constants/routes';
import { Fordeling } from './pleiepenger/Fordeling/Fordeling';
import { RegistreringsValg as PSBRegistreringsValg } from './pleiepenger/RegistreringsValg';
import { PSBPunchForm } from './pleiepenger/PSBPunchForm';
import { PSBSoknadKvittering } from './pleiepenger/SoknadKvittering/SoknadKvittering';
import ErrorFallback from './ErrorFallback';

const JournalpostRouter: React.FunctionComponent = () => {
    const { journalpostid } = useParams<{ journalpostid: string }>();

    if (!journalpostid) {
        return null;
    }

    throw Error('Tester sentry');

    return (
        <JournalpostOgPdfVisning journalposter={[journalpostid]}>
            <ErrorBoundary fallback={<ErrorFallback />}>
                <Routes>
                    <Route path={ROUTES.PSB_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PSBRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.PUNCH} element={<PSBPunchForm journalpostid={journalpostid} />}>
                            <Route path={ROUTES.KVITTERING} element={<PSBSoknadKvittering response={undefined} />} />
                        </Route>
                    </Route>
                    <Route path={ROUTES.PLS_ROOT}>
                        <Route
                            path={ROUTES.VELG_SOKNAD}
                            element={<PLSRegistreringsValg journalpostid={journalpostid} />}
                        />
                        <Route path={ROUTES.PUNCH} element={<PLSPunchForm journalpostid={journalpostid} />}>
                            <Route path={ROUTES.KVITTERING} element={<PLSKvittering />} />
                        </Route>
                    </Route>

                    <Route path="/" element={<Fordeling />} />
                </Routes>
            </ErrorBoundary>
        </JournalpostOgPdfVisning>
    );
};

export default JournalpostRouter;
