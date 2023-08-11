import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Alert, Modal } from '@navikt/ds-react';

import Fagsak from 'app/types/Fagsak';

import VerticalSpacer from '../../components/VerticalSpacer';
import SokKnapp from '../../components/knapp/SokKnapp';
import { JournalpostConflictTyper } from '../../models/enums/Journalpost/JournalpostConflictTyper';
import { IError, IJournalpost } from '../../models/types';
import { IJournalpostConflictResponse } from '../../models/types/Journalpost/IJournalpostConflictResponse';
import { RootStateType } from '../../state/RootState';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction } from '../../state/actions';
import { getJournalpost as fellesReducerGetJournalpost } from '../../state/reducers/FellesReducer';
import OkGaaTilLosModal from '../pleiepenger/OkGaaTilLosModal';
import OpprettJournalpostInngang from './OpprettJournalpostInngang';
import SendBrevIAvsluttetSakInngang from './SendBrevIAvsluttetSakInngang';
import './sok.less';

export interface ISearchFormStateProps {
    journalpost?: IJournalpost;
    notFound: boolean;
    forbidden: boolean;
    conflict?: boolean;
    journalpostConflictError?: IJournalpostConflictResponse;
    journalpostRequestError?: IError;
    lukkOppgaveDone?: boolean;
    lukkOppgaveReset: () => void;
}

export interface ISearchFormDispatchProps {
    getJournalpost: typeof fellesReducerGetJournalpost;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
}

export interface ISearchFormComponentState {
    journalpostid?: string;
}

type ISearchFormProps = WrappedComponentProps &
    ISearchFormStateProps &
    ISearchFormDispatchProps &
    ISearchFormComponentState;

export const SearchFormComponent: React.FC<ISearchFormProps> = ({
    notFound,
    forbidden,
    conflict,
    journalpostConflictError,
    journalpostRequestError,
    journalpost,
    lukkOppgaveDone,
    lukkOppgaveReset,
    getJournalpost,
}) => {
    const [sanitizedJournalpostId, setSanitizedJournalpostId] = useState<string>('');

    const history = useHistory();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const journalpostId = e.target.value;
        // Only allow numbers (0-9)
        const sanitizedValue = journalpostId.replace(/[^0-9]/g, '');
        setSanitizedJournalpostId(sanitizedValue);
    };

    const onClick = (): void => {
        if (sanitizedJournalpostId) {
            getJournalpost(sanitizedJournalpostId);
        }
    };

    const handleKeydown = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            onClick();
        }
    };

    if (journalpost?.journalpostId) {
        history.push(`/journalpost/${journalpost.journalpostId}`);
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

    const disabled = !sanitizedJournalpostId;

    return (
        <>
            <div className="sok-container">
                <h1 className="sok-heading">
                    <FormattedMessage id="søk.overskrift" />
                </h1>
                <SkjemaGruppe>
                    <div className="input-rad">
                        <Input
                            value={sanitizedJournalpostId}
                            bredde="L"
                            onChange={onChange}
                            label={<FormattedMessage id="søk.label.jpid" />}
                            onKeyDown={handleKeydown}
                        />
                        <SokKnapp onClick={onClick} tekstId="søk.knapp.label" disabled={disabled} />
                        <VerticalSpacer sixteenPx />
                    </div>
                    <div className="max-w-[500px] m-auto">
                        {!!notFound && (
                            <Alert size="small" variant="info">
                                <FormattedMessage id="søk.jp.notfound" values={{ jpid: sanitizedJournalpostId }} />
                            </Alert>
                        )}

                        {!!forbidden && (
                            <Alert size="small" variant="warning">
                                <FormattedMessage id="søk.jp.forbidden" values={{ jpid: sanitizedJournalpostId }} />
                            </Alert>
                        )}

                        {conflict &&
                            journalpostConflictError &&
                            journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET && (
                                <Alert size="small" variant="warning">
                                    <FormattedMessage id="startPage.feil.ikkeStøttet" />
                                </Alert>
                            )}

                        {journalpostRequestError?.message && (
                            <Alert size="small" variant="warning">
                                {journalpostRequestError.message}
                            </Alert>
                        )}

                        {!!journalpost && !journalpost?.kanSendeInn && (
                            <Alert size="small" variant="warning">
                                <FormattedMessage id="fordeling.kanikkesendeinn" />
                            </Alert>
                        )}
                    </div>
                </SkjemaGruppe>
            </div>
            <div className="inngangContainer">
                <OpprettJournalpostInngang />
                <SendBrevIAvsluttetSakInngang />
            </div>
        </>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    notFound: state.felles.journalpostNotFound,
    forbidden: state.felles.journalpostForbidden,
    conflict: state.felles.journalpostConflict,
    journalpostConflictError: state.felles.journalpostConflictError,
    journalpostRequestError: state.felles.journalpostRequestError,
    lukkOppgaveDone: state.fordelingState.lukkOppgaveDone,
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (journalpostid: string) => dispatch(fellesReducerGetJournalpost(journalpostid)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
});

export const SearchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent));
