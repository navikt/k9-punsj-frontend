import * as React from 'react';
import { HashRouter, Route } from 'react-router-dom';

import { RedigeringLoaderImpl } from './RedigeringLoader';
import { Sakstyper } from '../SakstypeImpls';
import SakstypeStepRouter from '../SakstypeStepRouter';

const RedigeringRouter: React.FunctionComponent = () => (
        <RedigeringLoaderImpl
            renderOnLoadComplete={() => (
                <HashRouter>
                    {Sakstyper.punchSakstyper.map((sakstypeConfig) => (
                        <Route
                            key={sakstypeConfig.navn}
                            path={sakstypeConfig.punchPath}
                            children={
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
                </HashRouter>
            )}
        />
    );

export default RedigeringRouter;
