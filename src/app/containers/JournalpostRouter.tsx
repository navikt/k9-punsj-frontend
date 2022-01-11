import * as React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import JournalpostLoader from './JournalpostLoader';
import { Fordeling } from './pleiepenger/Fordeling/Fordeling';
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
                <>
                    <Fordeling journalpostId={journalpostid} />
                    <Routes>
                        {Sakstyper.punchSakstyper.map((sakstypeConfig) => (
                            <Route
                                key={sakstypeConfig.navn}
                                path={sakstypeConfig.punchPath}
                                element={
                                    sakstypeConfig.getComponent ? (
                                        sakstypeConfig.getComponent({
                                            journalpostid,
                                            punchPath: sakstypeConfig.punchPath,
                                        })
                                    ) : (
                                        <SakstypeStepRouter
                                            sakstypeConfig={sakstypeConfig}
                                            journalpostid={journalpostid}
                                        />
                                    )
                                }
                            />
                        ))}
                    </Routes>
                </>
            )}
        />
    );
};

export default JournalpostRouter;
