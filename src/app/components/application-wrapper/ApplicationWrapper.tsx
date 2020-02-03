import Header             from '@navikt/nap-header';
import UserPanel          from '@navikt/nap-user-panel';
import IntlProvider       from 'app/components/intl-provider/IntlProvider';
import LanguageToggle     from 'app/components/language-toggle/LanguageToggle';
import {IAuthState}       from 'app/models/types';
import {Locale}           from 'app/models/types/Locale';
import {checkAuth}        from 'app/state/actions';
import {RootStateType}    from 'app/state/RootState';
import NavFrontendSpinner from 'nav-frontend-spinner';
import {Normaltekst}      from 'nav-frontend-typografi';
import * as React                from 'react';
import {Col, Container, Row}     from 'react-bootstrap';
import {connect}                 from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';

interface IApplicationWrapperComponentProps {
    locale: Locale;
    onChangeLocale: (locale: Locale) => void;
}

interface IApplicationWrapperStateProps {authState: IAuthState}
interface IApplicationWrapperDispatchProps {checkAuth: typeof checkAuth}

type IApplicationWrapperProps =
    React.PropsWithChildren<IApplicationWrapperComponentProps> &
    IApplicationWrapperStateProps &
    IApplicationWrapperDispatchProps;

const ApplicationWrapper: React.FunctionComponent<IApplicationWrapperProps> = (props: IApplicationWrapperProps) => {

    const {authState, locale} = props;

    if (!!authState.error) {
        return <p>Ai! Det oppsto en feil i tilkoblingen til innloggingstjeneren.</p>;
    }

    if (!authState.loggedIn && !authState.isLoading) {
        if (!authState.redirectUrl) {
            props.checkAuth();
            return null;
        } else {
            window.location.replace(authState.redirectUrl);
            return null;
        }
    }

    if (authState.isLoading) {
        return (
            <Container>
                <Row className="justify-content-center align-items-center" style={{height: '100vh'}}>
                    <Col xs={'auto'}><NavFrontendSpinner/></Col>
                </Row>
            </Container>
        );
    }

    return (
        <IntlProvider {...{locale}}>
            <Normaltekst tag="div" className="fit-window-height">
                <Header title="K9-punsj">
                    <UserPanel name={props.authState.userName!}/>
                </Header>
                <LanguageToggle {...{locale}} toggle={props.onChangeLocale}/>
                <Router>{props.children}</Router>
            </Normaltekst>
        </IntlProvider>
    );
};

function mapStateToProps(state: RootStateType) {return {authState: state.authState}}
function mapDispatchToProps(dispatch: any) {return {checkAuth: () => dispatch(checkAuth())}}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationWrapper);