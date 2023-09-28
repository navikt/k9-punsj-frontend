import React from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Fieldset, Modal, TextField } from '@navikt/ds-react';

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

export class SearchFormComponent extends React.Component<ISearchFormProps, ISearchFormComponentState> {
    constructor(props: ISearchFormProps) {
        super(props);
        this.state = {
            journalpostid: '',
        };
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const journalpostId = e.target.value;
        // Only allow numbers (0-9)
        const sanitizedJournalpostId = journalpostId.replace(/[^0-9]/g, '');
        this.setState({ journalpostid: sanitizedJournalpostId });
    };

    onClick = (): void => {
        const { journalpostid } = this.state;
        const { getJournalpost } = this.props;
        if (journalpostid) {
            getJournalpost(journalpostid);
        }
    };

    handleKeydown = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            this.onClick();
        }
    };

    render() {
        const { journalpostid } = this.state;
        const {
            notFound,
            forbidden,
            conflict,
            journalpostConflictError,
            journalpostRequestError,
            journalpost,
            lukkOppgaveDone,
            lukkOppgaveReset,
        } = this.props;

        const disabled = !journalpostid;

        if (journalpost?.journalpostId) {
            window.location.assign(`journalpost/${journalpostid}`);
        }

        if (lukkOppgaveDone) {
            return (
                <Modal
                    key="lukkoppgaveokmodal"
                    onBeforeClose={() => lukkOppgaveReset()}
                    aria-label="settpaaventokmodal"
                    open
                >
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
                    <Fieldset>
                        <div className="input-rad">
                            <TextField
                                value={journalpostid}
                                className="w-64"
                                onChange={this.onChange}
                                label={<FormattedMessage id="søk.label.jpid" />}
                                onKeyDown={this.handleKeydown}
                            />
                            <SokKnapp onClick={this.onClick} tekstId="søk.knapp.label" disabled={disabled} />
                            <VerticalSpacer sixteenPx />
                        </div>

                        {!!notFound && (
                            <Alert size="small" variant="info">
                                <FormattedMessage id="søk.jp.notfound" values={{ jpid: journalpostid }} />
                            </Alert>
                        )}

                        {!!forbidden && (
                            <Alert size="small" variant="warning">
                                <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
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
                    </Fieldset>
                </div>
                <div className="inngangContainer">
                    <OpprettJournalpostInngang />
                    <SendBrevIAvsluttetSakInngang />
                </div>
            </>
        );
    }
}

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
