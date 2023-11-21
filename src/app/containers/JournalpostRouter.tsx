import * as React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { JournalpostOgPdfVisning } from 'app/components/JournalpostOgPdfVisning';

import { PLSRegistreringsValg } from 'app/pleiepenger-livets-sluttfase/containers/PLSRegistreringsValg';
import { PLSPunchForm } from 'app/pleiepenger-livets-sluttfase/containers/PLSPunchForm';
import { PLSKvittering } from 'app/pleiepenger-livets-sluttfase/containers/PLSKvittering';
import { ROUTES } from 'app/constants/routes';
import { Fordeling } from './pleiepenger/Fordeling/Fordeling';

const JournalpostRouter: React.FunctionComponent = () => {
    const { journalpostid } = useParams<{ journalpostid: string }>();

    if (!journalpostid) {
        return null;
    }

    return (
        <JournalpostOgPdfVisning journalposter={[journalpostid]}>
            <Routes>
                <Route path={ROUTES.PLS_ROOT}>
                    <Route
                        path={ROUTES.PLS_VELG_SOKNAD}
                        element={<PLSRegistreringsValg journalpostid={journalpostid} />}
                    />
                    <Route path={ROUTES.PLS_PUNCH} element={<PLSPunchForm journalpostid={journalpostid} />}>
                        <Route path={ROUTES.PLS_KVITTERING} element={<PLSKvittering />} />
                    </Route>
                </Route>
                <Route path="/" element={<Fordeling />} />
            </Routes>
        </JournalpostOgPdfVisning>
    );
};

export default JournalpostRouter;
