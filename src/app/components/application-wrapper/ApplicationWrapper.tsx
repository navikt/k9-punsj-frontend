import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, InternalHeader, Spacer } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { Dispatch } from 'redux';
import { ExternalLinkIcon } from '@navikt/aksel-icons';

import AppContainer from '../../containers/AppContainer';
import { getEnvironmentVariable } from '../../utils';
import IntlProvider from 'app/components/intl-provider/IntlProvider';
import { Locale } from 'app/models/types/Locale';
import { RootStateType } from 'app/state/RootState';
import { checkAuth } from 'app/state/actions';

import './applicationWrapper.less';

interface Props {
    locale: Locale;
    onChangeLocale: (locale: Locale) => void;
    children?: React.ReactNode;
}

const isDev = window.location.hostname.includes('intern.dev.nav.no');

const ApplicationWrapper: React.FC<Props> = ({ locale, children }) => {
    const dispatch = useDispatch<Dispatch<any>>();

    const authState = useSelector((state: RootStateType) => state.authState);

    const handleButtonClick = () => {
        const k9LosUrl = getEnvironmentVariable('K9_LOS_URL');
        if (k9LosUrl) {
            window.location.href = k9LosUrl;
        }
    };

    const checkAuthentication = () => {
        if (!authState.loggedIn) {
            dispatch(checkAuth());
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, [authState.loggedIn, dispatch]);

    return (
        <IntlProvider {...{ locale }}>
            <div className="app fit-window-height">
                <div className={isDev ? 'headercontainer' : ''}>
                    <InternalHeader>
                        <InternalHeader.Title as="a" href="/">
                            <FormattedMessage id="applicationWrapper.header.tittel.punsj" />
                        </InternalHeader.Title>

                        <div className="self-center mx-5">
                            <Button
                                size="small"
                                onClick={handleButtonClick}
                                iconPosition="right"
                                icon={<ExternalLinkIcon />}
                                className="custom-button"
                            >
                                <FormattedMessage id="applicationWrapper.header.tittel.los" />
                            </Button>
                        </div>

                        <Spacer />
                        <InternalHeader.User name={authState.userName || ''} />
                    </InternalHeader>
                </div>
                <AppContainer>
                    <Router>{children}</Router>
                </AppContainer>
            </div>
        </IntlProvider>
    );
};

export default ApplicationWrapper;
