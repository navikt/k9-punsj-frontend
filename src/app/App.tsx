import moment                                  from 'moment';
import Modal                                   from 'nav-frontend-modal';
import * as React                              from 'react';
import {render}                                from 'react-dom';
import {Provider}                              from 'react-redux';
import {Route, Switch}                         from 'react-router-dom';
import {applyMiddleware, compose, createStore} from 'redux';

import ApplicationWrapper                                       from './components/application-wrapper/ApplicationWrapper';
import PunchPage                                                from './containers/punch-page/PunchPage';
import {Locale}                                                 from './models/types';
import {logger, thunk}                                          from './state/middleware';
import {rootReducer}                                            from './state/RootState';
import './styles/globalStyles.less';
import {getLocaleFromSessionStorage, setLocaleInSessionStorage} from './utils';

// tslint:disable-next-line:no-string-literal
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(logger, thunk)));

const localeFromSessionStorage = getLocaleFromSessionStorage();

const App: React.FunctionComponent = () => {
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
                <Switch>
                    <Route path="/" component={PunchPage}/>
                </Switch>
            </ApplicationWrapper>
        </Provider>
    );
};

const root = document.getElementById('app');
Modal.setAppElement('#app');
render(<App/>, root);