import * as React from 'react';
import { HashRouter, Route } from 'react-router-dom';

import { Sakstyper } from '../SakstypeImpls';
import SakstypeStepRouter from '../SakstypeStepRouter';
import { RedigeringLoaderImpl } from './RedigeringLoader';

const RedigeringRouter: React.FunctionComponent = () => (
    <RedigeringLoaderImpl
        renderOnLoadComplete={() => (
            <HashRouter>
                {Sakstyper.punchSakstyper.map((sakstypeConfig) => (
                    <Route key={sakstypeConfig.navn} path={sakstypeConfig.punchPath}>
                        {sakstypeConfig.getComponent ? (
                            sakstypeConfig.getComponent({
                                punchPath: sakstypeConfig.punchPath,
                            })
                        ) : (
                            <SakstypeStepRouter sakstypeConfig={sakstypeConfig} journalpostid={undefined} />
                        )}
                    </Route>
                ))}
            </HashRouter>
        )}
    />
);

export default RedigeringRouter;
