import * as React from 'react';
import { HashRouter, Route } from 'react-router-dom';

import { Sakstyper } from '../SakstypeImpls';
import SakstypeStepRouter from '../SakstypeStepRouter';

const RedigeringRouter: React.FunctionComponent = () => (
    <>
        {Sakstyper.punchSakstyper.map((sakstypeConfig) => (
            <Route
                key={sakstypeConfig.navn}
                path={sakstypeConfig.punchPath}
                element={
                    sakstypeConfig.getComponent ? (
                        sakstypeConfig.getComponent({
                            punchPath: sakstypeConfig.punchPath,
                        })
                    ) : (
                        <SakstypeStepRouter sakstypeConfig={sakstypeConfig} journalpostid={undefined} />
                    )
                }
            />
        ))}
    </>
);

export default RedigeringRouter;
