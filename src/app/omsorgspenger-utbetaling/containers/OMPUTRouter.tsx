import * as React from 'react';
import { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';

import RoutingPathsContext from 'app/state/context/RoutingPathsContext';

import useRedirect from '../../hooks/useRedirect';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import { IOMPUTSoknadKvittering } from '../types/OMPUTSoknadKvittering';
import OMPUTPunchFormContainer from './OMPUTPunchFormContainer';
import { OMPUTRegistreringsValg } from './OMPUTRegistreringsValg';
import PunchOMPUTPage from './PunchOMPUTPage';
import KvitteringContainer from './SoknadKvittering/KvitteringContainer';
import { KvitteringContext } from './SoknadKvittering/KvitteringContext';

const OMPUTRouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid, punchPath }) => {
    const OMPUTRootPath = punchPath;

    const routingPaths = useMemo(
        () => ({
            soeknader: `${OMPUTRootPath}/soeknader`,
            skjema: `${OMPUTRootPath}/skjema/`,
            kvittering: `${OMPUTRootPath}/fullfort/`,
        }),
        [],
    );

    useRedirect(OMPUTRootPath, routingPaths.soeknader);
    const [kvittering, setKvittering] = React.useState<IOMPUTSoknadKvittering | undefined>(undefined);
    const kvitteringState = useMemo(() => ({ kvittering, setKvittering }), [kvittering, setKvittering]);
    return (
        <RoutingPathsContext.Provider value={routingPaths}>
            <KvitteringContext.Provider value={kvitteringState}>
                <PunchOMPUTPage journalpostid={journalpostid}>
                    <Routes>
                        <Route exact path={routingPaths.soeknader}>
                            <OMPUTRegistreringsValg journalpostid={journalpostid} />
                        </Route>
                        <Route path={`${routingPaths.skjema}:id`}>
                            <OMPUTPunchFormContainer journalpostid={journalpostid} />
                        </Route>
                        <Route path={`${routingPaths.kvittering}:id`}>
                            <KvitteringContainer kvittering={kvittering} />
                        </Route>
                    </Routes>
                </PunchOMPUTPage>
            </KvitteringContext.Provider>
        </RoutingPathsContext.Provider>
    );
};

export default OMPUTRouter;
