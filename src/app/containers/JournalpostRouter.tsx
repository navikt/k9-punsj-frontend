import * as React from 'react';
import { HashRouter, Route, useParams } from 'react-router-dom';

import JournalpostLoader from './JournalpostLoader';
import { Sakstyper } from './SakstypeImpls';
import { Fordeling } from './pleiepenger/Fordeling/Fordeling';

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
                            {sakstypeConfig.getComponent({
                                journalpostid,
                            })}
                        </Route>
                    ))}
                </HashRouter>
            )}
        />
    );
};

export default JournalpostRouter;
