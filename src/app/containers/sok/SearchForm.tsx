import { Alert, Modal } from '@navikt/ds-react';
import React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';

import Fagsak from 'app/types/Fagsak';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import { connect } from 'react-redux';
import SokKnapp from '../../components/knapp/SokKnapp';
import VerticalSpacer from '../../components/VerticalSpacer';
import { JournalpostConflictTyper } from '../../models/enums/Journalpost/JournalpostConflictTyper';
import { IError, IJournalpost } from '../../models/types';
import { IJournalpostConflictResponse } from '../../models/types/Journalpost/IJournalpostConflictResponse';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction } from '../../state/actions';
import { getJournalpost as fellesReducerGetJournalpost } from '../../state/reducers/FellesReducer';
import { RootStateType } from '../../state/RootState';
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
            lukkJournalpostOppgave,
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
                    onClose={() => lukkOppgaveReset()}
                    aria-label="settpaaventokmodal"
                    closeButton={false}
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
                    <SkjemaGruppe>
                        <div className="input-rad">
                            <Input
                                value={journalpostid}
                                bredde="L"
                                onChange={(e) => this.setState({ journalpostid: e.target.value })}
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
                    </SkjemaGruppe>
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
