import React, { useState, useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Modal, TextField } from '@navikt/ds-react';
import { useNavigate } from 'react-router';

import { ROUTES } from 'app/constants/routes';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { lukkDebuggJp } from 'app/utils/JournalpostLoaderUtils';
import { JournalpostConflictTyper } from '../models/enums/Journalpost/JournalpostConflictTyper';
import { RootStateType } from '../state/RootState';
import { lukkOppgaveResetAction } from '../state/actions';
import { getJournalpost as fellesReducerGetJournalpost } from '../state/reducers/FellesReducer';
import VerticalSpacer from '../components/VerticalSpacer';
import SokKnapp from '../components/knapp/SokKnapp';
import { OkGaaTilLosModal } from 'app/components/gå-til-los-modal/OkGaaTilLosModal';
import OpprettJournalpostInngang from './components/opprettJournalpostInngang/OpprettJournalpostInngang';
import SendBrevIAvsluttetSakInngang from './components/sendBrevIAvsluttetSakInngang/SendBrevIAvsluttetSakInngang';
import { ConflictErrorComponent } from '../components/ConflictErrorComponent';

import './home.less';

export const Home = () => {
    const [journalpostid, setJournalpostid] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);
    const notFound = useSelector((state: RootStateType) => state.felles.journalpostNotFound);
    const forbidden = useSelector((state: RootStateType) => state.felles.journalpostForbidden);
    const conflict = useSelector((state: RootStateType) => state.felles.journalpostConflict);
    const journalpostConflictError = useSelector((state: RootStateType) => state.felles.journalpostConflictError);
    const journalpostRequestError = useSelector((state: RootStateType) => state.felles.journalpostRequestError);
    const lukkOppgaveDone = useSelector((state: RootStateType) => state.fordelingState.lukkOppgaveDone);

    const [pendinglukkDebuggJp, setPendinglukkDebuggJp] = useState(false);
    const [lukkDebuggJpStatus, setLukkDebuggJpStatus] = useState<number | undefined>(undefined);
    const [ingenJp, setIngenJp] = useState(false);

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

    const disabled = !journalpostid;

    useEffect(() => {
        if (journalpost?.journalpostId) {
            // Her har jeg lagt inn en reset av redux state fordi tidligere ble window.location.href brukt for å navigere til journalposten.
            // så hvis man ikke resetter state først skjer det rare ting.
            // TODO: fiks dette så vi slipper å kjøre kall for å hente ut journalpost to ganger
            dispatch(resetAllStateAction());

            navigate(ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId));
        }
    }, [journalpost]);
    if (lukkOppgaveDone) {
        return (
            <Modal key="lukkoppgaveokmodal" onClose={lukkOppgaveReset} aria-label="settpaaventokmodal" open>
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </Modal>
        );
    }

    return (
        <>
            <div className="sok-container">
                <h1 className="sok-heading">
                    <FormattedMessage id="søk.overskrift" />
                </h1>
                <div className="input-rad">
                    <TextField
                        value={journalpostid}
                        className="w-64"
                        onChange={onChange}
                        label={<FormattedMessage id="søk.label.jpid" />}
                        onKeyDown={handleKeydown}
                    />
                    <SokKnapp onClick={onClick} tekstId="søk.knapp.label" disabled={disabled} />
                    <VerticalSpacer sixteenPx />
                </div>

                {notFound && (
                    <Alert size="small" variant="info">
                        <FormattedMessage id="søk.jp.notfound" values={{ jpid: journalpostid }} />
                    </Alert>
                )}

                {forbidden && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                    </Alert>
                )}

                {conflict && journalpostConflictError?.type === JournalpostConflictTyper.IKKE_STØTTET && (
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
            <div className="inngangContainer">
                <OpprettJournalpostInngang />
                <SendBrevIAvsluttetSakInngang />
            </div>
        </>
    );
};
