import React, { useEffect, useState } from 'react';

import { Alert, Loader, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import FeilmeldingPanel from '../components/FeilmeldingPanel';
import { ConflictErrorComponent } from '../components/ConflictErrorComponent';
import { OkGaaTilLosModal } from 'app/components/okGaaTilLosModal/OkGaaTilLosModal';
import { JournalpostConflictTyper } from '../models/enums/Journalpost/JournalpostConflictTyper';
import { RootStateType } from '../state/RootState';
import { lukkOppgaveResetAction } from '../state/actions';
import { getJournalpost as getJournalpostAction } from '../state/reducers/FellesReducer';
import { lukkDebuggJp } from 'app/utils/JournalpostLoaderUtils';

import './journalpostLoader.less';

interface Props {
    renderOnLoadComplete: () => React.ReactNode;
}

const JournalpostLoader: React.FC<Props> = ({ renderOnLoadComplete }: Props) => {
    const { journalpostid } = useParams<{ journalpostid: string }>();

    const dispatch = useDispatch<Dispatch<any>>();

    const getJournalpost = (id: string) => dispatch(getJournalpostAction(id));
    const lukkOppgaveReset = () => dispatch(lukkOppgaveResetAction());

    const {
        journalpost,
        isJournalpostLoading,
        journalpostNotFound,
        journalpostForbidden,
        journalpostConflict,
        journalpostConflictError,
        journalpostRequestError,
    } = useSelector((state: RootStateType) => state.felles);

    const lukkOppgaveDone = useSelector((state: RootStateType) => state.fordelingState.lukkOppgaveDone);

    const [pendinglukkDebuggJp, setPendinglukkDebuggJp] = useState(false);
    const [lukkDebuggJpStatus, setLukkDebuggJpStatus] = useState<number | undefined>(undefined);
    const [ingenJp, setIngenJp] = useState(false);

    useEffect(() => {
        if (journalpostid) {
            getJournalpost(journalpostid);
        }
    }, [journalpostid]);

    const handleLukkDebugg = () => {
        if (journalpostid) {
            setPendinglukkDebuggJp(true);
            setLukkDebuggJpStatus(undefined);
            lukkDebuggJp(journalpostid).then((status: number) => {
                setPendinglukkDebuggJp(false);
                setLukkDebuggJpStatus(status);
            });
        } else {
            setIngenJp(true);
        }
    };

    if (isJournalpostLoading) {
        return (
            <div className="h-screen">
                <div className="justify-content-center align-items-center h-screen flex flex-wrap">
                    <Loader size="large" data-testid="spinner" />
                </div>
            </div>
        );
    }

    if (journalpostNotFound) {
        return (
            <div data-testid="journalpostNotFound">
                <FeilmeldingPanel messageId="startPage.feil.journalpost" />
            </div>
        );
    }

    if (journalpostForbidden) {
        return (
            <div data-testid="journalpostForbidden">
                <FeilmeldingPanel messageId="startPage.feil.ikketilgang" />
            </div>
        );
    }

    if (lukkOppgaveDone) {
        return (
            <Modal key="lukkoppgaveokmodal" onClose={() => lukkOppgaveReset()} aria-label="settpaaventokmodal" open>
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </Modal>
        );
    }

    if (journalpostConflict && journalpostConflictError?.type === JournalpostConflictTyper.IKKE_STØTTET) {
        return (
            <ConflictErrorComponent
                journalpostid={journalpostid || 'ukjent'}
                ingenJp={ingenJp}
                pendingLukkDebuggJp={pendinglukkDebuggJp}
                lukkDebuggJpStatus={lukkDebuggJpStatus}
                handleLukkDebugg={handleLukkDebugg}
                data-testid="journalpostConflictComponent"
            />
        );
    }

    if (journalpostRequestError) {
        return <FeilmeldingPanel messageId="startPage.feil.internalServerError" />;
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

    return renderOnLoadComplete();
};

export default JournalpostLoader;
