import React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import { connect } from 'react-redux';
import VerticalSpacer from '../../components/VerticalSpacer';
import SokKnapp from '../../components/knapp/SokKnapp';
import { JournalpostConflictTyper } from '../../models/enums/Journalpost/JournalpostConflictTyper';
import { IError, IJournalpost } from '../../models/types';
import { IJournalpostConflictResponse } from '../../models/types/Journalpost/IJournalpostConflictResponse';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction } from '../../state/actions';
import { getJournalpost as fellesReducerGetJournalpost } from '../../state/reducers/FellesReducer';
import { RootStateType } from '../../state/RootState';
import OkGaaTilLosModal from '../pleiepenger/OkGaaTilLosModal';
import './sok.less';
import OpprettJournalpostInngang from './OpprettJournalpostInngang';

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
                <ModalWrapper
                    key="lukkoppgaveokmodal"
                    onRequestClose={() => lukkOppgaveReset()}
                    contentLabel="settpaaventokmodal"
                    closeButton={false}
                    isOpen
                >
                    <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
                </ModalWrapper>
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
                            <AlertStripeInfo>
                                <FormattedMessage id="søk.jp.notfound" values={{ jpid: journalpostid }} />
                            </AlertStripeInfo>
                        )}

                        {!!forbidden && (
                            <AlertStripeAdvarsel>
                                <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                            </AlertStripeAdvarsel>
                        )}

                        {conflict &&
                            journalpostConflictError &&
                            journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET && (
                                <>
                                    <AlertStripeAdvarsel>
                                        <FormattedMessage id="startPage.feil.ikkeStøttet" />
                                    </AlertStripeAdvarsel>
                                    <VerticalSpacer eightPx />
                                    <Knapp
                                        onClick={() => {
                                            if (journalpostid) lukkJournalpostOppgave(journalpostid);
                                        }}
                                    >
                                        <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                                    </Knapp>
                                </>
                            )}

                        {journalpostRequestError?.message && (
                            <>
                                <AlertStripeAdvarsel>{journalpostRequestError.message}</AlertStripeAdvarsel>
                                <VerticalSpacer eightPx />
                                <Knapp
                                    onClick={() => {
                                        if (journalpostid) lukkJournalpostOppgave(journalpostid);
                                    }}
                                >
                                    <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                                </Knapp>
                            </>
                        )}

                        {!!journalpost && !journalpost?.kanSendeInn && (
                            <AlertStripeAdvarsel>
                                <FormattedMessage id="fordeling.kanikkesendeinn" />
                            </AlertStripeAdvarsel>
                        )}
                    </SkjemaGruppe>
                </div>
                <OpprettJournalpostInngang />
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
    lukkJournalpostOppgave: (journalpostid: string) => dispatch(lukkJournalpostOppgaveAction(journalpostid)),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
});

export const SearchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent));
