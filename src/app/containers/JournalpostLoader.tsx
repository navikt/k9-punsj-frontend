import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FeilmeldingPanel from '../components/FeilmeldingPanel';
import VerticalSpacer from '../components/VerticalSpacer';
import { JournalpostConflictTyper } from '../models/enums/Journalpost/JournalpostConflictTyper';
import { IError, IJournalpost } from '../models/types';
import { IJournalpostConflictResponse } from '../models/types/Journalpost/IJournalpostConflictResponse';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction } from '../state/actions';
import { getJournalpost as getJournalpostAction } from '../state/reducers/FellesReducer';
import { RootStateType } from '../state/RootState';
import './journalpostLoader.less';
import OkGaaTilLosModal from './pleiepenger/OkGaaTilLosModal';

interface IJournaPostStateProps {
    journalpost?: IJournalpost;
    isJournalpostLoading?: boolean;
    journalpostRequestError?: IError;
    journalpostConflictError?: IJournalpostConflictResponse;
    forbidden?: boolean;
    conflict?: boolean;
    notFound?: boolean;
    lukkOppgaveDone?: boolean;
}

interface IJournalpostProps {
    renderOnLoadComplete: () => React.ReactNode;
    journalpostId: string;
}

interface IDispatchProps {
    getJournalpost: typeof getJournalpostAction;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    lukkOppgaveReset: typeof lukkOppgaveResetAction;
}

export type JournapostLoaderProps = IJournaPostStateProps & IJournalpostProps & IDispatchProps;

export const JournalpostLoaderImpl: React.FunctionComponent<JournapostLoaderProps> = ({
    renderOnLoadComplete,
    isJournalpostLoading,
    getJournalpost,
    lukkJournalpostOppgave,
    lukkOppgaveReset,
    journalpostId,
    journalpost,
    journalpostConflictError,
    forbidden,
    conflict,
    notFound,
    lukkOppgaveDone,
}) => {
    useEffect(() => {
        if (journalpostId) {
            getJournalpost(journalpostId);
        }
    }, [journalpostId]);

    if (isJournalpostLoading) {
        return (
            <Container style={{ height: '100%' }}>
                <Row className="justify-content-center align-items-center" style={{ height: '100%' }}>
                    <Col xs="auto">
                        <NavFrontendSpinner />
                    </Col>
                </Row>
            </Container>
        );
    }

    if (notFound) {
        return <FeilmeldingPanel messageId="startPage.feil.journalpost" />;
    }

    if (forbidden) {
        return <FeilmeldingPanel messageId="startPage.feil.ikketilgang" />;
    }

    if (lukkOppgaveDone) {
        return (
            <ModalWrapper
                key="lukkoppgaveokmodal"
                onRequestClose={() => lukkOppgaveReset()}
                contentLabel="settpaaventokmodal"
                closeButton={false}
                isOpen
            >
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </ModalWrapper>
        );
    }

    if (
        !!conflict &&
        !!journalpostConflictError &&
        journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET
    ) {
        return (
            <>
                <FeilmeldingPanel messageId="startPage.feil.ikkeStøttet" />
                <VerticalSpacer eightPx />
                <div className="journalpostloader-conflict__container">
                    <Knapp onClick={() => lukkJournalpostOppgave(journalpostId)}>
                        <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                    </Knapp>
                </div>
            </>
        );
    }

    if (!journalpost) {
        return null;
    }

    if (!journalpost.dokumenter.length) {
        return (
            <AlertStripeFeil>
                <FormattedMessage id="startPage.feil.ingendokumenter" />
            </AlertStripeFeil>
        );
    }

    return <>{renderOnLoadComplete()}</>;
};

const mapStateToProps = ({ felles, fordelingState }: RootStateType): IJournaPostStateProps => ({
    journalpost: felles.journalpost,
    journalpostRequestError: felles.journalpostRequestError,
    isJournalpostLoading: felles.isJournalpostLoading,
    forbidden: felles.journalpostForbidden,
    conflict: felles.journalpostConflict,
    journalpostConflictError: felles.journalpostConflictError,
    notFound: felles.journalpostNotFound,
    lukkOppgaveDone: fordelingState.lukkOppgaveDone,
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (id: string) => dispatch(getJournalpostAction(id)),
    lukkJournalpostOppgave: (journalpostid: string) => dispatch(lukkJournalpostOppgaveAction(journalpostid)),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(JournalpostLoaderImpl);
