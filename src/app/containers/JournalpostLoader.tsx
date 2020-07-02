import {AlertStripeFeil}        from 'nav-frontend-alertstriper';
import NavFrontendSpinner       from 'nav-frontend-spinner';
import React, {useEffect}       from 'react';
import {Col, Container, Row}    from 'react-bootstrap';
import { FormattedMessage }     from 'react-intl';
import {connect}                from 'react-redux';
import {IPleiepengerPunchState} from '../models/types';
import {getJournalpost as getJournalpostAction}         from '../state/actions';
import {RootStateType}          from '../state/RootState';

interface IJournalPostProps {
    punchState: IPleiepengerPunchState;
    renderOnLoadComplete: () => React.ReactNode;
    journalpostId: string;
}

interface IDispatchProps {
    getJournalpost: typeof getJournalpostAction;
}

const JournalpostLoader: React.FunctionComponent<IJournalPostProps & IDispatchProps> = (
    {
        renderOnLoadComplete,
        punchState,
        getJournalpost,
        journalpostId
    }) => {

    useEffect(() => {
        getJournalpost(journalpostId);
    }, []);

    if (punchState.isJournalpostLoading) {
        return (
            <Container style={{height: '100%'}}>
                <Row className="justify-content-center align-items-center" style={{height: '100%'}}>
                    <Col xs={'auto'}><NavFrontendSpinner/></Col>
                </Row>
            </Container>
        );
    }

    if (!!punchState.journalpostRequestError) {
        return <AlertStripeFeil><FormattedMessage id="startPage.feil.journalpost" /></AlertStripeFeil>;
    }

    if (!punchState.journalpost) {
        return null;
    }

    if (!punchState.journalpost.dokumenter.length) {
        return <AlertStripeFeil><FormattedMessage id="startPage.feil.ingendokumenter" /></AlertStripeFeil>;
    }

    return <>{renderOnLoadComplete()}</>
}

const mapStateToProps = (state: RootStateType) => ({
    punchState: state.punchState,
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (id: string) => dispatch(getJournalpostAction(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(JournalpostLoader);
