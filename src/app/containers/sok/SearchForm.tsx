import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Alert, TextField, Modal, Fieldset, Button } from '@navikt/ds-react';

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

    const {
        journalpost,
        notFound,
        forbidden,
        conflict,
        journalpostConflictError,
        journalpostRequestError,
        lukkOppgaveDone,
        isJournalpostLoading,
    } = useSelector((state: RootStateType) => ({
        journalpost: state.felles.journalpost,
        notFound: state.felles.journalpostNotFound,
        forbidden: state.felles.journalpostForbidden,
        conflict: state.felles.journalpostConflict,
        journalpostConflictError: state.felles.journalpostConflictError,
        journalpostRequestError: state.felles.journalpostRequestError,
        lukkOppgaveDone: state.fordelingState.lukkOppgaveDone,
        isJournalpostLoading: state.felles.isJournalpostLoading,
    }));

    const prevJournalpostidRef = useRef(journalpostid);
    useEffect(() => {
        const prevJournalpostid = prevJournalpostidRef.current;
        dispatch(resetJournalpostAction());

        if (journalpostid !== prevJournalpostid) {
            dispatch(resetJournalpostAction());
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
        window.location.assign(`journalpost/${journalpostid}`);
    }

    return (
        <>
            <div className="sok-container">
                <h1 className="sok-heading">{intl.formatMessage({ id: 'søk.overskrift' })}</h1>
                <Fieldset>
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
                    </div>{' '}
                </Fieldset>
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
