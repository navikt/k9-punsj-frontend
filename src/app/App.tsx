import moment                                                   from 'moment';
import Modal                                                    from 'nav-frontend-modal';
import * as React                                               from 'react';
import {render}                                                 from 'react-dom';
import {Provider}                                               from 'react-redux';
import {BrowserRouter as Router, Route, Switch}                           from 'react-router-dom';
import {applyMiddleware, compose, createStore}                  from 'redux';

import ApplicationWrapper                                       from './components/application-wrapper/ApplicationWrapper';
import JournalpostRouter                                        from './JournalpostRouter';
import {Locale}                                                 from './models/types';
import {logger, thunk}                                          from './state/middleware';
import {rootReducer}                                            from './state/RootState';
import './styles/globalStyles.less';
import {getLocaleFromSessionStorage, setLocaleInSessionStorage} from './utils';

// tslint:disable-next-line:no-string-literal
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(logger, thunk)));

const localeFromSessionStorage = getLocaleFromSessionStorage();

export const App: React.FunctionComponent = () => {

    const [locale, setLocale] = React.useState<Locale>(localeFromSessionStorage);
    moment.locale(localeFromSessionStorage);

    return (
        <Provider store={store}>
            <ApplicationWrapper
                locale={locale}
                onChangeLocale={(activeLocale: Locale) => {
                    setLocaleInSessionStorage(activeLocale);
                    setLocale(activeLocale);
                }}
            >
                <Router>
                    <Switch>
                        <Route path="/:journalpostid/" children={JournalpostRouter}/>
                        <Route path="/"><p>Journalpostid er ikke oppgitt.</p></Route>
                    </Switch>
                </Router>
            </ApplicationWrapper>
        </Provider>
    );
};

const root = document.getElementById('app');
Modal.setAppElement('#app');
render(<App/>, root);
