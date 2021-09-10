import * as React from 'react';
import { HashRouter, Route, RouteComponentProps } from 'react-router-dom';
import JournalpostLoader from './JournalpostLoader';
import { Fordeling } from './pleiepenger/Fordeling/Fordeling';
import { Sakstyper } from './SakstypeImpls';
import SakstypeStepRouter from './SakstypeStepRouter';

interface IRouterParams {
    journalpostid: string;
}

const JournalpostRouter: React.FunctionComponent<RouteComponentProps<IRouterParams>> = ({ match }) => {
    const { journalpostid } = match.params;

    return (
        <JournalpostLoader
            journalpostId={journalpostid}
            renderOnLoadComplete={() => (
                <HashRouter>
                    <Route exact={true} path="/">
                        <Fordeling journalpostId={journalpostid} />
                    </Route>
                    {Sakstyper.punchSakstyper.map((sakstypeConfig) => (
                        <Route
                            key={sakstypeConfig.navn}
                            path={sakstypeConfig.punchPath}
                            children={
                                sakstypeConfig.getComponent ? (
                                    sakstypeConfig.getComponent({
                                        journalpostid,
                                        punchPath: sakstypeConfig.punchPath,
                                    })
                                ) : (
                                    <SakstypeStepRouter sakstypeConfig={sakstypeConfig} journalpostid={journalpostid} />
                                )
                            }
                        />
                    ))}
                </HashRouter>
            )}
        />
    );
};

export default JournalpostRouter;
