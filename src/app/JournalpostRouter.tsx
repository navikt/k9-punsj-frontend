import * as React                               from 'react';
import {HashRouter, Route, RouteComponentProps} from 'react-router-dom';
import AppContainer                             from './containers/AppContainer';
import JournalpostLoader                        from './containers/JournalpostLoader';
import {Fordeling}                              from './containers/punch-page/Fordeling';
import {Sakstyper}                              from './sakstype/SakstypeImpls';
import SakstypeStepRouter                       from './sakstype/SakstypeStepRouter';


interface IRouterParams {
    journalpostid: string
}

const JournalpostRouter: React.FunctionComponent<RouteComponentProps<IRouterParams>> = ({ match }) => {
    const { journalpostid } = match.params;

    return (
        <HashRouter>
            <Route
                exact={true}
                path="/"
            >
                {/* TODO: Kan vurdere å legge AppContainer og Loader rundt alt, og ikke bare Fordeling */}
                <AppContainer>
                    <JournalpostLoader journalpostId={journalpostid} renderOnLoadComplete={() => (
                        <Fordeling journalpostId={journalpostid} />
                    )}/>
                </AppContainer>
            </Route>
            {
                Sakstyper.punchSakstyper.map(sakstypeConfig => (
                    <Route
                        key={sakstypeConfig.navn}
                        path={sakstypeConfig.punchPath}
                        children={sakstypeConfig.getComponent
                            ? sakstypeConfig.getComponent({journalpostid})
                            : <SakstypeStepRouter sakstypeConfig={sakstypeConfig} journalpostid={journalpostid} />
                        }
                    />
                ))
            }
        </HashRouter>
    );
};

export default JournalpostRouter;
