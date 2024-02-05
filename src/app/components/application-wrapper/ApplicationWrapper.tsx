import * as React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { Loader } from '@navikt/ds-react';
import { Header, UserPanel } from '@navikt/ft-plattform-komponenter';
import '@navikt/ft-plattform-komponenter/dist/style.css';

import IntlProvider from 'app/components/intl-provider/IntlProvider';
import { IAuthState } from 'app/models/types';
import { Locale } from 'app/models/types/Locale';
import { RootStateType } from 'app/state/RootState';
import { checkAuth } from 'app/state/actions';

import AppContainer from '../../containers/AppContainer';
import { getEnvironmentVariable } from '../../utils';
import './applicationWrapper.less';

interface IApplicationWrapperComponentProps {
    locale: Locale;
    onChangeLocale: (locale: Locale) => void;
}

interface IApplicationWrapperStateProps {
    authState: IAuthState;
}

const isDev = window.location.hostname.includes('dev.adeo.no');

type IApplicationWrapperProps = React.PropsWithChildren<IApplicationWrapperComponentProps> &
    IApplicationWrapperStateProps;

const ApplicationWrapper: React.FunctionComponent<IApplicationWrapperProps> = (props: IApplicationWrapperProps) => {
    const { authState, locale, children } = props;
    const [k9LosUrl, setK9LosUrl] = React.useState<string>('http://localhost:8080');

    React.useEffect(() => {
        setK9LosUrl(getEnvironmentVariable('K9_LOS_URL') || 'http://localhost:8080');
    }, [window.appSettings]);

    return (
        <IntlProvider {...{ locale }}>
            <div className="app fit-window-height">
                <div className={isDev ? 'headercontainer' : ''}>
                    <Header title="K9-punsj" titleHref={k9LosUrl}>
                        <UserPanel name={authState.userName} />
                    </Header>
                </div>
                <AppContainer>
                    <Router>{children}</Router>
                </AppContainer>
            </div>
        </IntlProvider>
    );
};

function mapStateToProps(state: RootStateType) {
    return { authState: state.authState };
}

export default connect(mapStateToProps)(ApplicationWrapper);
