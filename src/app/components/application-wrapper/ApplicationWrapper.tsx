import { BodyShort, Loader } from '@navikt/ds-react';
import { Header, UserPanel } from '@navikt/ft-plattform-komponenter';
import '@navikt/ft-plattform-komponenter/dist/style.css';
import IntlProvider from 'app/components/intl-provider/IntlProvider';
import { IAuthState } from 'app/models/types';
import { Locale } from 'app/models/types/Locale';
import { checkAuth } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import * as React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
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
interface IApplicationWrapperDispatchProps {
    checkAuth: typeof checkAuth;
}

const isDev = window.location.hostname.includes('dev.adeo.no');

const K9_LOS_URL = getEnvironmentVariable('K9_LOS_URL');
const K9_LOS_URL_SET: boolean = !!K9_LOS_URL && K9_LOS_URL !== 'undefined';
const REDIRECT_URL_LOS = K9_LOS_URL_SET ? K9_LOS_URL : 'http://localhost:8030';

type IApplicationWrapperProps = React.PropsWithChildren<IApplicationWrapperComponentProps> &
    IApplicationWrapperStateProps &
    IApplicationWrapperDispatchProps;

const ApplicationWrapper: React.FunctionComponent<IApplicationWrapperProps> = (props: IApplicationWrapperProps) => {
    const { authState, locale, children } = props;

    if (authState.error) {
        return <p>Ai! Det oppsto en feil i tilkoblingen til innloggingstjeneren.</p>;
    }

    if (!authState.loggedIn && !authState.isLoading) {
        if (!authState.redirectUrl) {
            props.checkAuth();
            return null;
        }
        window.location.replace(authState.redirectUrl);
        return null;
    }

    if (authState.isLoading) {
        return (
            <Container>
                <Row className="justify-content-center align-items-center" style={{ height: '100vh' }}>
                    <Col xs="auto">
                        <Loader size="large" />
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <IntlProvider {...{ locale }}>
            <div className="app fit-window-height">
                <div className={isDev ? 'headercontainer' : ''}>
                    <Header title="K9-punsj" titleHref={REDIRECT_URL_LOS}>
                        <UserPanel name={authState.userName!} />
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
function mapDispatchToProps(dispatch: any) {
    return { checkAuth: () => dispatch(checkAuth()) };
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationWrapper);
