import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Alert, TextField, Modal, Button } from '@navikt/ds-react';

import { getEnvironmentVariable } from 'app/utils';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { RootStateType } from '../../state/RootState';
import { lukkOppgaveResetAction } from '../../state/actions';
import { getJournalpost, resetJournalpostAction } from '../../state/reducers/FellesReducer';

import OkGaaTilLosModal from '../pleiepenger/OkGaaTilLosModal';
import OpprettJournalpostInngang from './OpprettJournalpostInngang';
import SendBrevIAvsluttetSakInngang from './SendBrevIAvsluttetSakInngang';
import { JournalpostConflictTyper } from '../../models/enums/Journalpost/JournalpostConflictTyper';

import './sok.less';

const SearchForm = () => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const [journalpostid, setJournalpostid] = useState('');

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);
    const notFound = useSelector((state: RootStateType) => state.felles.journalpostNotFound);
    const forbidden = useSelector((state: RootStateType) => state.felles.journalpostForbidden);
    const conflict = useSelector((state: RootStateType) => state.felles.journalpostConflict);
    const journalpostConflictError = useSelector((state: RootStateType) => state.felles.journalpostConflictError);
    const journalpostRequestError = useSelector((state: RootStateType) => state.felles.journalpostRequestError);
    const lukkOppgaveDone = useSelector((state: RootStateType) => state.fordelingState.lukkOppgaveDone);
    const isJournalpostLoading = useSelector((state: RootStateType) => state.felles.isJournalpostLoading);

    const prevJournalpostidRef = useRef(journalpostid);
    useEffect(() => {
        const prevJournalpostid = prevJournalpostidRef.current;

        if (journalpostid !== prevJournalpostid) {
            if (notFound || forbidden || conflict || journalpostRequestError || journalpostConflictError) {
                dispatch(resetJournalpostAction());
            }
        }

        prevJournalpostidRef.current = journalpostid;
    }, [journalpostid]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const journalpostId = e.target.value.replace(/[^0-9]/g, '');
        setJournalpostid(journalpostId);
    };

    const onClick = () => {
        if (journalpostid) {
            dispatch(getJournalpost(journalpostid));
        }
    };

    const handleKeydown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onClick();
        }
    };

    const lukkOppgaveReset = () => {
        dispatch(lukkOppgaveResetAction());
    };

    // Redirect logic can be handled through React Router or other means rather than window.location
    if (journalpost?.journalpostId) {
        if (journalpost.erFerdigstilt && getEnvironmentVariable('POSTMOTTAK_TOGGLE') === 'true') {
            window.location.assign(`journalpost/${journalpostid}/fordeling`);
        }
        window.location.assign(`journalpost/${journalpostid}`);
    }

    return (
        <>
            <div className="sok-container">
                <h1 className="sok-heading">{intl.formatMessage({ id: 'søk.overskrift' })}</h1>
                <div className="input-rad">
                    <TextField
                        value={journalpostid}
                        className="w-64"
                        onChange={onChange}
                        label={intl.formatMessage({ id: 'søk.label.jpid' })}
                        onKeyDown={handleKeydown}
                    />
                    <div className="mt-8 ml-6">
                        <Button
                            onClick={() => onClick()}
                            size="small"
                            className="h-12 w-24"
                            disabled={!journalpostid}
                            loading={isJournalpostLoading}
                        >
                            {intl.formatMessage({ id: 'søk.knapp.label' })}
                        </Button>
                    </div>
                    <VerticalSpacer sixteenPx />
                </div>
                <div className="flex justify-center items-start flex-shrink-0">
                    {notFound && (
                        <Alert variant="warning" className="mt-2 flex-shrink-0">
                            {intl.formatMessage({ id: 'søk.jp.notfound' }, { jpid: journalpostid })}
                        </Alert>
                    )}

                    {forbidden && (
                        <Alert variant="error" className="mt-2 flex-shrink-0">
                            {intl.formatMessage({ id: 'søk.jp.forbidden' }, { jpid: journalpostid })}
                        </Alert>
                    )}

                    {conflict &&
                        journalpostConflictError &&
                        journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET && (
                            <Alert variant="info" className="mt-2 flex-shrink-0">
                                {intl.formatMessage({ id: 'startPage.feil.ikkeStøttet' })}
                            </Alert>
                        )}

                    {journalpostRequestError?.message && (
                        <Alert variant="error" className="mt-2 flex-shrink-0">
                            {intl.formatMessage({ id: 'søk.jp.internalServerError' })}
                        </Alert>
                    )}

                    {!!journalpost && !journalpost?.kanSendeInn && (
                        <Alert variant="warning" className="mt-2 flex-shrink-0">
                            {intl.formatMessage({ id: 'fordeling.kanikkesendeinn' })}
                        </Alert>
                    )}
                </div>
            </div>

            {lukkOppgaveDone && (
                <Modal
                    key="lukkoppgaveokmodal"
                    onClose={lukkOppgaveReset}
                    aria-label={intl.formatMessage({ id: 'modal.ariaLabel' })}
                    open
                >
                    <OkGaaTilLosModal melding={intl.formatMessage({ id: 'fordeling.lukkoppgave.utfort' })} />
                </Modal>
            )}

            <div className="inngangContainer">
                <OpprettJournalpostInngang />
                <SendBrevIAvsluttetSakInngang />
            </div>
        </>
    );
};

export default SearchForm;
