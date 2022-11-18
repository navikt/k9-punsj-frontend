import Fagsak from 'app/types/Fagsak';

import { Alert, Loader, Modal } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FeilmeldingPanel from '../components/FeilmeldingPanel';
import VerticalSpacer from '../components/VerticalSpacer';
import { JournalpostConflictTyper } from '../models/enums/Journalpost/JournalpostConflictTyper';
import { IJournalpost } from '../models/types';
import { IJournalpostConflictResponse } from '../models/types/Journalpost/IJournalpostConflictResponse';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction } from '../state/actions';
import { getJournalpost as getJournalpostAction } from '../state/reducers/FellesReducer';
import { RootStateType } from '../state/RootState';
import './journalpostLoader.less';
import OkGaaTilLosModal from './pleiepenger/OkGaaTilLosModal';

interface IJournaPostStateProps {
    journalpost?: IJournalpost;
    isJournalpostLoading?: boolean;
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
                        <Loader size="large" />
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
            <Modal
                key="lukkoppgaveokmodal"
                onClose={() => lukkOppgaveReset()}
                aria-label="settpaaventokmodal"
                closeButton={false}
                open
            >
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </Modal>
        );
    }

    if (
        !!conflict &&
        journalpostConflictError &&
        journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET
    ) {
        return (
            <>
                <FeilmeldingPanel messageId="startPage.feil.ikkeStøttet" />
                <VerticalSpacer eightPx />
            </>
        );
    }

    if (!journalpost) {
        return null;
    }

    if (!journalpost.dokumenter.length) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="startPage.feil.ingendokumenter" />
            </Alert>
        );
    }

    return <>{renderOnLoadComplete()}</>;
};

const mapStateToProps = ({ felles, fordelingState }: RootStateType): IJournaPostStateProps => ({
    journalpost: felles.journalpost,
    isJournalpostLoading: felles.isJournalpostLoading,
    forbidden: felles.journalpostForbidden,
    conflict: felles.journalpostConflict,
    journalpostConflictError: felles.journalpostConflictError,
    notFound: felles.journalpostNotFound,
    lukkOppgaveDone: fordelingState.lukkOppgaveDone,
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (id: string) => dispatch(getJournalpostAction(id)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(JournalpostLoaderImpl);
