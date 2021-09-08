import {AlertStripeAdvarsel, AlertStripeFeil} from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, {useEffect} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import {IError, IJournalpost} from '../models/types';
import {getJournalpost as getJournalpostAction} from '../state/reducers/FellesReducer';
import {RootStateType} from '../state/RootState';
import FeilmeldingPanel from "../components/FeilmeldingPanel";
import {IJournalpostConflictResponse} from "../models/types/Journalpost/IJournalpostConflictResponse";
import {JournalpostConflictTyper} from "../models/enums/Journalpost/JournalpostConflictTyper";
import VerticalSpacer from "../components/VerticalSpacer";
import {Knapp} from "nav-frontend-knapper";
import {lukkJournalpostOppgave as lukkJournalpostOppgaveAction} from "../state/actions";
import './journalpostLoader.less';

interface IJournaPostStateProps {
    journalpost?: IJournalpost;
    isJournalpostLoading?: boolean;
    journalpostRequestError?: IError;
    journalpostConflictError?: IJournalpostConflictResponse;
    forbidden: boolean | undefined;
    conflict: boolean | undefined;
    notFound: boolean | undefined;
}

interface IJournalpostProps {
    renderOnLoadComplete: () => React.ReactNode;
    journalpostId: string;
}

interface IDispatchProps {
    getJournalpost: typeof getJournalpostAction;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
}

export type JournapostLoaderProps = IJournaPostStateProps &
    IJournalpostProps &
    IDispatchProps;

export const JournalpostLoaderImpl: React.FunctionComponent<JournapostLoaderProps> = ({
    renderOnLoadComplete,
    isJournalpostLoading,
    getJournalpost,
    lukkJournalpostOppgave,
    journalpostId,
    journalpost,
    journalpostConflictError,
    forbidden,
    conflict,
    notFound
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

    if (!!conflict
        && typeof journalpostConflictError !== 'undefined'
        && journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET) {
        return (
            <div>
                <FeilmeldingPanel messageId={"startPage.feil.ikkeStøttet"}/>
                <VerticalSpacer eightPx={true} />
                <div className="journalpostloader-conflict__container">
                <Knapp onClick={() => lukkJournalpostOppgave(journalpostId)}>
                    <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES"/>
                </Knapp>
                </div>
            </div>
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
    conflict: felles.journalpostConflict,
    journalpostConflictError: felles.journalpostConflictError,
    notFound: felles.journalpostNotFound
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (id: string) => dispatch(getJournalpostAction(id)),
    lukkJournalpostOppgave: (journalpostid: string) =>
        dispatch(lukkJournalpostOppgaveAction(journalpostid)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JournalpostLoaderImpl);
