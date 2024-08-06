import  React, {useEffect} from 'react';
import { connect, useDispatch } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { InternalHeader, Spacer } from "@navikt/ds-react";
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

const isDev = window.location.hostname.includes('intern.dev.nav.no');

type IApplicationWrapperProps = React.PropsWithChildren<IApplicationWrapperComponentProps> &
    IApplicationWrapperStateProps;

const ApplicationWrapper: React.FunctionComponent<IApplicationWrapperProps> = (props: IApplicationWrapperProps) => {
    const { authState, locale, children } = props;
    
    const [k9LosUrl, setK9LosUrl] = React.useState<string>('http://localhost:8080');
    
    const dispatch = useDispatch();

    useEffect(() => {
        setK9LosUrl(getEnvironmentVariable('K9_LOS_URL') || 'http://localhost:8080');
    }, [window.appSettings]);

    useEffect(() => {
        if (!authState.loggedIn) {
            dispatch(checkAuth());
        }
    }, []);

    return (
        <IntlProvider {...{ locale }}>
            <div className="app fit-window-height">
                <div className={isDev ? 'headercontainer' : ''}>
                    <InternalHeader>
                    <InternalHeader.Title as="a" href={k9LosUrl}>K9-punsj</InternalHeader.Title>
                    <Spacer />
                    <InternalHeader.User name={authState.userName|| ''} />
                    </InternalHeader>
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
