import * as React from 'react';
import { HashRouter, Route, useParams } from 'react-router-dom';
import JournalpostLoader from './JournalpostLoader';
import { Fordeling } from './Fordeling/Fordeling';
import { Sakstyper } from './SakstypeImpls';
import SakstypeStepRouter from './SakstypeStepRouter';

interface IRouterParams {
    journalpostid: string;
}

const JournalpostRouter: React.FunctionComponent = () => {
    const { journalpostid } = useParams<IRouterParams>();

    return (
        <JournalpostLoader
            journalpostId={journalpostid}
            renderOnLoadComplete={() => (
                <HashRouter>
                    <Route exact path="/">
                        <Fordeling journalpostId={journalpostid} />
                    </Route>
                    {Sakstyper.punchSakstyper.map((sakstypeConfig) => (
                        <Route key={sakstypeConfig.navn} path={sakstypeConfig.punchPath}>
                            {sakstypeConfig.getComponent ? (
                                sakstypeConfig.getComponent({
                                    journalpostid,
                                    punchPath: sakstypeConfig.punchPath,
                                })
                            ) : (
                                <SakstypeStepRouter sakstypeConfig={sakstypeConfig} journalpostid={journalpostid} />
                            )}
                        </Route>
                    ))}
                </HashRouter>
            )}
        />
    );
};

export default JournalpostRouter;
