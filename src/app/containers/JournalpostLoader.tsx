import React, { useEffect, useState } from 'react';

import { Alert, Loader } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import FeilmeldingPanel from '../components/FeilmeldingPanel';
import { ConflictErrorComponent } from '../components/ConflictErrorComponent';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import { JournalpostConflictTyper } from '../models/enums/Journalpost/JournalpostConflictTyper';
import { RootStateType } from '../state/RootState';
import { lukkOppgaveResetAction } from '../state/actions';
import { getJournalpost as getJournalpostAction } from '../state/reducers/FellesReducer';
import { lukkDebuggJp } from 'app/utils/JournalpostLoaderUtils';

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
        if (!journalpost && journalpostid) {
            getJournalpost(journalpostid);
        }
    }, [journalpostid, journalpost]);

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
            <div className="flex justify-center mt-40">
                <Loader size="3xlarge" data-testid="spinner" />
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
        return <OkGåTilLosModal meldingId="fordeling.lukkoppgave.utfort" onClose={() => lukkOppgaveReset()} />;
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
