import * as React                               from 'react';
import {BrowserRouter as Router, Route, RouteComponentProps} from 'react-router-dom';
import AppContainer                             from './containers/AppContainer';
import JournalpostLoader                        from './containers/JournalpostLoader';
import {Fordeling}        from './containers/pleiepenger/Fordeling';
import {Sakstyper}        from './containers/SakstypeImpls';
import SakstypeStepRouter from './containers/SakstypeStepRouter';


interface IRouterParams {
    journalpostid: string
}

const JournalpostRouter: React.FunctionComponent<RouteComponentProps<IRouterParams>> = ({ match }) => {
    const { journalpostid } = match.params;

    return (
        <Router>
            <Route
                exact={true}
                path=""
            >
                {/* TODO: Kan vurdere å legge AppContainer og Loader rundt alt, og ikke bare Fordeling */}
                <AppContainer>
                    <JournalpostLoader journalpostId={journalpostid} renderOnLoadComplete={() => (
                        <Fordeling journalpostId={journalpostid} />
                        
                    )}/>
                </AppContainer>
            </Route>
            {
                Sakstyper.punchSakstyper.map(sakstypeConfig =>  (
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
        </Router>
    );
};

export default JournalpostRouter;
