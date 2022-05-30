import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import useRedirect from '../../hooks/useRedirect';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import OMPUTPunchFormContainer from './OMPUTPunchFormContainer';
import { OMPUTRegistreringsValg } from './OMPUTRegistreringsValg';
import PunchOMPUTPage from './PunchOMPUTPage';
import { OMPUTSoknadKvittering } from './SoknadKvittering/OMPUTSoknadKvittering';

const OMPUTRouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid, punchPath }) => {
    const OMPUTRootPath = punchPath;

    const routingPaths = React.useMemo(
        () => ({
            soeknader: `${OMPUTRootPath}/soeknader`,
            skjema: `${OMPUTRootPath}/skjema/`,
            kvittering: `${OMPUTRootPath}/fullfort/`,
        }),
        []
    );

    useRedirect(OMPUTRootPath, routingPaths.soeknader);
    return (
        <RoutingPathsContext.Provider value={routingPaths}>
            <PunchOMPUTPage journalpostid={journalpostid}>
                <Switch>
                    <Route exact path={routingPaths.soeknader}>
                        <OMPUTRegistreringsValg journalpostid={journalpostid} />
                    </Route>
                    <Route path={`${routingPaths.skjema}:id`}>
                        <OMPUTPunchFormContainer journalpostid={journalpostid} />
                    </Route>
                    <Route path={`${routingPaths.kvittering}:id`}>
                        <OMPUTSoknadKvittering journalpostid={journalpostid} />
                    </Route>
                </Switch>
            </PunchOMPUTPage>
        </RoutingPathsContext.Provider>
    );
};

export default OMPUTRouter;
