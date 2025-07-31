import React, { useState, useCallback, useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { Alert, Button, Heading, TextField } from '@navikt/ds-react';
import { useNavigate } from 'react-router';

import { ROUTES } from 'app/constants/routes';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { lukkDebuggJp } from 'app/utils/JournalpostLoaderUtils';
import { JournalpostConflictTyper } from '../models/enums/Journalpost/JournalpostConflictTyper';
import { RootStateType } from '../state/RootState';
import { lukkOppgaveResetAction } from '../state/actions';
import { getJournalpost as fellesReducerGetJournalpost } from '../state/reducers/FellesReducer';
import VerticalSpacer from '../components/VerticalSpacer';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import OpprettJournalpostInngang from './components/OpprettJournalpostInngang';
import SendBrevIAvsluttetSakInngang from './components/SendBrevIAvsluttetSakInngang';
import { ConflictErrorComponent } from '../components/ConflictErrorComponent';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    const [journalpostid, setJournalpostid] = useState('');
    const [pendinglukkDebuggJp, setPendinglukkDebuggJp] = useState(false);
    const [lukkDebuggJpStatus, setLukkDebuggJpStatus] = useState<number | undefined>(undefined);
    const [ingenJp, setIngenJp] = useState(false);

    const {
        journalpost,
        journalpostNotFound,
        journalpostForbidden,
        journalpostConflict,
        journalpostConflictError,
        journalpostRequestError,
        isJournalpostLoading,
    } = useSelector((state: RootStateType) => state.felles);

    const lukkOppgaveDone = useSelector((state: RootStateType) => state.fordelingState.lukkOppgaveDone);

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

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLukkDebuggJpStatus(undefined);
        dispatch(resetAllStateAction());
        const journalpostId = e.target.value;
        const sanitizedJournalpostId = journalpostId.replace(/[^0-9]/g, '');
        setJournalpostid(sanitizedJournalpostId);
    }, []);

    const onClick = useCallback(() => {
        if (journalpostid) {
            dispatch(fellesReducerGetJournalpost(journalpostid));
        }
    }, [journalpostid, dispatch]);

    const handleKeydown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                onClick();
            }
        },
        [onClick],
    );

    const lukkOppgaveReset = useCallback(() => {
        dispatch(lukkOppgaveResetAction());
    }, [dispatch]);

    useEffect(() => {
        if (journalpost?.journalpostId) {
            navigate(ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId));
        }
    }, [journalpost]);

    if (lukkOppgaveDone) {
        return <OkGåTilLosModal meldingId="fordeling.lukkoppgave.utfort" onClose={lukkOppgaveReset} />;
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="py-36">
                <Heading size="xlarge" level="1">
                    <FormattedMessage id="søk.overskrift" />
                </Heading>

                <div className="flex items-center justify-center mt-10">
                    <TextField
                        value={journalpostid}
                        className="w-64"
                        onChange={onChange}
                        label={<FormattedMessage id="søk.label.jpid" />}
                        onKeyDown={handleKeydown}
                        disabled={isJournalpostLoading}
                    />

                    <div className="ml-4 self-end">
                        <Button
                            onClick={onClick}
                            disabled={!journalpostid || isJournalpostLoading}
                            loading={isJournalpostLoading}
                        >
                            <FormattedMessage id="søk.knapp.label" />
                        </Button>
                    </div>
                </div>

                <VerticalSpacer sixteenPx />

                {journalpostNotFound && (
                    <Alert size="small" variant="info">
                        <FormattedMessage id="søk.jp.notfound" values={{ jpid: journalpostid }} />
                    </Alert>
                )}

                {journalpostForbidden && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                    </Alert>
                )}

                {journalpostConflict && journalpostConflictError?.type === JournalpostConflictTyper.IKKE_STØTTET && (
                    <ConflictErrorComponent
                        journalpostid={journalpostid}
                        ingenJp={ingenJp}
                        pendingLukkDebuggJp={pendinglukkDebuggJp}
                        lukkDebuggJpStatus={lukkDebuggJpStatus}
                        handleLukkDebugg={handleLukkDebugg}
                    />
                )}

                {journalpostRequestError?.message && (
                    <Alert size="small" variant="error">
                        <FormattedMessage id="søk.jp.internalServerError" />
                    </Alert>
                )}

                {journalpost && !journalpost?.kanSendeInn && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="fordeling.kanikkesendeinn" />
                    </Alert>
                )}
            </div>

            <div className="flex justify-center gap-18">
                <OpprettJournalpostInngang />
                <SendBrevIAvsluttetSakInngang />
            </div>
        </div>
    );
};
