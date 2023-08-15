import * as React from 'react';
import { HashRouter, Route, useParams } from 'react-router-dom';

import JournalpostLoader from './JournalpostLoader';
import { Sakstyper } from './SakstypeImpls';
import SakstypeStepRouter from './SakstypeStepRouter';
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

                    {/* Denne koden gjør at riktig man kommer videre til visning for valgt sakstype. Fjernes den rendres ingenting når man går videre fra fordeling. */}
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
