import {AlertStripeFeil} from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, {useEffect} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import {IError, IJournalpost} from '../models/types';
import {getJournalpost as getJournalpostAction} from '../state/reducers/FellesReducer';
import {RootStateType} from '../state/RootState';
import FeilmeldingPanel from "../components/FeilmeldingPanel";

interface IJournaPostStateProps {
    journalpost?: IJournalpost;
    isJournalpostLoading?: boolean;
    journalpostRequestError?: IError;
    forbidden: boolean | undefined;
    notFound: boolean | undefined;
}

interface IJournalpostProps {
    renderOnLoadComplete: () => React.ReactNode;
    journalpostId: string;
}

interface IDispatchProps {
    getJournalpost: typeof getJournalpostAction;
}

export type JournapostLoaderProps = IJournaPostStateProps &
    IJournalpostProps &
    IDispatchProps;

export const JournalpostLoaderImpl: React.FunctionComponent<JournapostLoaderProps> = ({
                                                                                          renderOnLoadComplete,
                                                                                          isJournalpostLoading,
                                                                                          getJournalpost,
                                                                                          journalpostId,
                                                                                          journalpost,
                                                                                          forbidden, notFound
                                                                                      }) => {
    useEffect(() => {
        if (journalpostId) {
            getJournalpost(journalpostId);
        }
    }, [journalpostId]);

    if (isJournalpostLoading) {
        return (
            <Container style={{height: '100%'}}>
                <Row
                    className="justify-content-center align-items-center"
                    style={{height: '100%'}}
                >
                    <Col xs={'auto'}>
                        <NavFrontendSpinner/>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!!notFound) {
        return (
            <FeilmeldingPanel messageId={"startPage.feil.journalpost"}/>
        );
    }

    if (!!forbidden) {
        return (
            <FeilmeldingPanel messageId={"startPage.feil.ikketilgang"}/>
        );
    }

    if (!journalpost) {
        return null;
    }

    if (!journalpost.dokumenter.length) {
        return (
            <AlertStripeFeil>
                <FormattedMessage id="startPage.feil.ingendokumenter"/></AlertStripeFeil>
        );
    }

    return <>{renderOnLoadComplete()}</>;
};

const mapStateToProps = ({felles}: RootStateType): IJournaPostStateProps => ({
    journalpost: felles.journalpost,
    journalpostRequestError: felles.journalpostRequestError,
    isJournalpostLoading: felles.isJournalpostLoading,
    forbidden: felles.journalpostForbidden,
    notFound: felles.journalpostNotFound
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (id: string) => dispatch(getJournalpostAction(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JournalpostLoaderImpl);
