import * as React                               from 'react';
import {HashRouter, Route, RouteComponentProps} from 'react-router-dom';
import AppContainer                             from './containers/AppContainer';
import JournalpostLoader                        from './containers/JournalpostLoader';
import {Fordeling}                              from './containers/punch-page/Fordeling';
import {Sakstyper}                              from './models/Sakstype';


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
                Sakstyper.punchSakstyper.map(({ navn, punchPath, getComponent }) => (
                    <Route
                        key={navn}
                        path={punchPath}
                        children={getComponent({journalpostid})}
                    />
                ))
            }
        </HashRouter>
    );
};

export default JournalpostRouter;
