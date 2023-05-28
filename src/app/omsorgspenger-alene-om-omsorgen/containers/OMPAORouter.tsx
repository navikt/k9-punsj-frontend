import * as React from 'react';
import { useMemo } from 'react';
import { Route, Switch } from 'react-router-dom';

import RoutingPathsContext from 'app/state/context/RoutingPathsContext';

import useRedirect from '../../hooks/useRedirect';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import OMPAOPunchFormContainer from './OMPAOPunchFormContainer';
import { OMPAORegistreringsValg } from './OMPAORegistreringsValg';
import PunchOMPAOPage from './PunchOMPAOPage';
import KvitteringContainer from './SoknadKvittering/KvitteringContainer';
import { KvitteringContext } from './SoknadKvittering/KvitteringContext';

const OMPAORouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid, punchPath }) => {
    const OMPAORootPath = punchPath;

    const routingPaths = useMemo(
        () => ({
            soeknader: `${OMPAORootPath}/soeknader`,
            skjema: `${OMPAORootPath}/skjema/`,
            kvittering: `${OMPAORootPath}/fullfort/`,
        }),
        [],
    );

    useRedirect(OMPAORootPath, routingPaths.soeknader);
    const [kvittering, setKvittering] = React.useState<IOMPAOSoknadKvittering | undefined>(undefined);
    const kvitteringState = useMemo(() => ({ kvittering, setKvittering }), [kvittering, setKvittering]);
    return (
        <RoutingPathsContext.Provider value={routingPaths}>
            <KvitteringContext.Provider value={kvitteringState}>
                <PunchOMPAOPage journalpostid={journalpostid}>
                    <Switch>
                        <Route exact path={routingPaths.soeknader}>
                            <OMPAORegistreringsValg journalpostid={journalpostid} />
                        </Route>
                        <Route path={`${routingPaths.skjema}:id`}>
                            <OMPAOPunchFormContainer journalpostid={journalpostid} />
                        </Route>
                        <Route path={`${routingPaths.kvittering}:id`}>
                            <KvitteringContainer kvittering={kvittering} />
                        </Route>
                    </Switch>
                </PunchOMPAOPage>
            </KvitteringContext.Provider>
        </RoutingPathsContext.Provider>
    );
};

export default OMPAORouter;
