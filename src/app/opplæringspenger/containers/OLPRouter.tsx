import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import * as React from 'react';
import { useMemo } from 'react';
import { Route, Switch } from 'react-router-dom';
import useRedirect from '../../hooks/useRedirect';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import OLPPunchFormContainer from './OLPPunchFormContainer';
import { OLPRegistreringsValg } from './OLPRegistreringsValg';
import PunchOLPPage from './PunchOLPPage';
import KvitteringContainer from './kvittering/KvitteringContainer';
import { KvitteringContext } from './kvittering/KvitteringContext';
import { IOLPSoknadKvittering } from '../OLPSoknadKvittering';

const OLPRouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid, punchPath }) => {
    const OLPRootPath = punchPath;

    const routingPaths = useMemo(
        () => ({
            soeknader: `${OLPRootPath}/soeknader`,
            skjema: `${OLPRootPath}/skjema/`,
            kvittering: `${OLPRootPath}/fullfort/`,
        }),
        []
    );

    useRedirect(OLPRootPath, routingPaths.soeknader);
    const [kvittering, setKvittering] = React.useState<IOLPSoknadKvittering | undefined>(undefined);
    const kvitteringState = useMemo(() => ({ kvittering, setKvittering }), [kvittering, setKvittering]);
    return (
        <RoutingPathsContext.Provider value={routingPaths}>
            <KvitteringContext.Provider value={kvitteringState}>
                <PunchOLPPage journalpostid={journalpostid}>
                    <Switch>
                        <Route exact path={routingPaths.soeknader}>
                            <OLPRegistreringsValg journalpostid={journalpostid} />
                        </Route>
                        <Route path={`${routingPaths.skjema}:id`}>
                            <OLPPunchFormContainer journalpostid={journalpostid} />
                        </Route>
                        <Route path={`${routingPaths.kvittering}:id`}>
                            <KvitteringContainer kvittering={kvittering} />
                        </Route>
                    </Switch>
                </PunchOLPPage>
            </KvitteringContext.Provider>
        </RoutingPathsContext.Provider>
    );
};

export default OLPRouter;
