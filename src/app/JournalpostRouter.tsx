import * as React                               from 'react';
import {HashRouter, Route, RouteComponentProps} from 'react-router-dom';
import AppContainer                             from './containers/AppContainer';
import JournalpostLoader                        from './containers/JournalpostLoader';
import {Fordeling}                              from './containers/punch-page/Fordeling';
import {Behandlingsvalg, Sakstyper}             from './models/Sakstype';


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
                Sakstyper
                    .filter(({ behandlingsvalg }) => behandlingsvalg === Behandlingsvalg.Punch)
                    .map(({ navn, punchConfig }) => {
                        if (!punchConfig) {
                            throw new Error(`punchConfig er ikke oppgitt for ${navn}`);
                        }
                        return (
                            <Route
                                key={navn}
                                path={punchConfig.path}
                                children={punchConfig.getComponent({ journalpostid })}
                            />
                        );
                    })
            }
        </HashRouter>
    );
};

export default JournalpostRouter;
