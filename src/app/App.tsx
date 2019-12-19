import {PunchStep}                                                     from 'app/models/enums';
import moment                                                          from 'moment';
import Modal                                                           from 'nav-frontend-modal';
import * as React                                                      from 'react';
import {render}                                                        from 'react-dom';
import {Provider}                                                      from 'react-redux';
import {BrowserRouter, HashRouter, Route, RouteComponentProps, Switch} from 'react-router-dom';
import {applyMiddleware, compose, createStore}                         from 'redux';

import ApplicationWrapper                                                from './components/application-wrapper/ApplicationWrapper';
import {PunchPage}                                                       from './containers/punch-page/PunchPage';
import {IPath, Locale}                                                   from './models/types';
import {logger, thunk}                                                   from './state/middleware';
import {rootReducer}                                                     from './state/RootState';
import './styles/globalStyles.less';
import {getLocaleFromSessionStorage, getPath, setLocaleInSessionStorage} from './utils';

// tslint:disable-next-line:no-string-literal
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(logger, thunk)));

const localeFromSessionStorage = getLocaleFromSessionStorage();

export const App: React.FunctionComponent = () => {

    const [locale, setLocale] = React.useState<Locale>(localeFromSessionStorage);
    moment.locale(localeFromSessionStorage);

    const paths: IPath[] = [
        {step: PunchStep.FORDELING,     path: '/'},
        {step: PunchStep.IDENT,         path: '/ident'},
        {step: PunchStep.CHOOSE_SOKNAD, path: '/hentsoknader/{ident}'},
        {step: PunchStep.FILL_FORM,     path: '/skjema/{id}'},
        {step: PunchStep.COMPLETED,     path: '/fullfort'}
    ];

    type IPunchPageRouterProps = {match?: any} & RouteComponentProps;
    const PunchPageRouter: React.FunctionComponent<IPunchPageRouterProps> = (props: IPunchPageRouterProps) => {
        const {journalpostid} = props.match.params;
        return <HashRouter>
            {Object.keys(PunchStep).map(Number).filter(step => !isNaN(step)).map(step => <Route
                exact={true}
                key={`hashroute_${step}`}
                path={getPath(paths, step)}
                children={<PunchPage {...{journalpostid, step}}/>}
            />)}
        </HashRouter>
    };

    return (
        <Provider store={store}>
            <ApplicationWrapper
                locale={locale}
                onChangeLocale={(activeLocale: Locale) => {
                    setLocaleInSessionStorage(activeLocale);
                    setLocale(activeLocale);
                }}
            >
                <BrowserRouter>
                    <Switch>
                        <Route path="/:journalpostid/" children={PunchPageRouter}/>
                        <Route path="/"><p>Journalpostid er ikke oppgitt.</p></Route>
                    </Switch>
                </BrowserRouter>
            </ApplicationWrapper>
        </Provider>
    );
};

const root = document.getElementById('app');
Modal.setAppElement('#app');
render(<App/>, root);