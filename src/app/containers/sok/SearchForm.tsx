import VerticalSpacer from "../../components/VerticalSpacer";
import {FormattedMessage, injectIntl, WrappedComponentProps} from "react-intl";
import React from "react";
import SokKnapp from "../../components/knapp/SokKnapp";
import './sok.less';
import {Input, SkjemaGruppe} from "nav-frontend-skjema";
import {getJournalpost} from "../../state/reducers/FellesReducer";
import {IJournalpost} from "../../models/types";
import {connect} from "react-redux";
import {RootStateType} from "../../state/RootState";
import {AlertStripeAdvarsel, AlertStripeInfo} from "nav-frontend-alertstriper";
import {JournalpostConflictTyper} from "../../models/enums/Journalpost/JournalpostConflictTyper";
import {IJournalpostConflictResponse} from "../../models/types/Journalpost/IJournalpostConflictResponse";
import {Knapp} from "nav-frontend-knapper";
import {lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction} from "../../state/actions";
import ModalWrapper from "nav-frontend-modal";
import OkGaaTilLosModal from "../pleiepenger/OkGaaTilLosModal";

export interface ISearchFormStateProps {
    journalpost?: IJournalpost;
    notFound: boolean;
    forbidden: boolean;
    conflict: boolean | undefined;
    journalpostConflictError?: IJournalpostConflictResponse;
    lukkOppgaveDone?: boolean | undefined;
    lukkOppgaveReset: () => void;
}

export interface ISearchFormDispatchProps {
    getJournalpost: typeof getJournalpost;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
}

export interface ISearchFormComponentState {
    identitetsnummer?: string,
    journalpostid?: string;
}

type ISearchFormProps =
    WrappedComponentProps
    & ISearchFormStateProps
    & ISearchFormDispatchProps
    & ISearchFormComponentState;

export class SearchFormComponent extends React.Component<ISearchFormProps> {
    state: ISearchFormComponentState = {
        identitetsnummer: '',
        journalpostid: '',
    };

    componentDidMount(): void {
        this.setState({
            identitetsnummer: '',
            journalpostid: '',
            visMapper: false,
            sokMedFnr: false
        });
    }

    render() {
        const {journalpostid} = this.state;
        const {
            notFound,
            forbidden,
            conflict,
            journalpostConflictError,
            journalpost,
            lukkJournalpostOppgave,
            lukkOppgaveDone,
            lukkOppgaveReset
        } = this.props;

        const disabled = !journalpostid;

        const onClick = () => {
            if (journalpostid) {
                this.props.getJournalpost(journalpostid);
            }
        }

        if (journalpost?.journalpostId) {
            window.location.assign('journalpost/' + journalpostid)
        }

        if (!!lukkOppgaveDone) {
            return (
                <ModalWrapper
                    key={"lukkoppgaveokmodal"}
                    onRequestClose={() => lukkOppgaveReset()}
                    contentLabel={"settpaaventokmodal"}
                    closeButton={false}
                    isOpen={!!lukkOppgaveDone}
                >
                    <OkGaaTilLosModal melding={'fordeling.lukkoppgave.utfort'}/>
                </ModalWrapper>
            );
        }

        return (
            <div className="container">
                <h1><FormattedMessage id="søk.overskrift"/></h1>
                <SkjemaGruppe>
                    <div className={"input-rad"}>
                        <Input
                            value={journalpostid}
                            bredde="L"
                            onChange={(e) => this.setState({journalpostid: e.target.value})}
                            label={
                                <FormattedMessage id="søk.label.jpid"/>
                            }/>
                        <SokKnapp
                            onClick={onClick}
                            tekstId={"søk.knapp.label"}
                            disabled={disabled}
                        />
                        <VerticalSpacer sixteenPx={true}/>
                    </div>
                    
                    {!!notFound &&
                    <AlertStripeInfo>
                        <FormattedMessage id={'søk.jp.notfound'} values={{jpid: journalpostid}}/>
                    </AlertStripeInfo>}

                    {!!forbidden &&
                    <AlertStripeAdvarsel>
                        <FormattedMessage id={'søk.jp.forbidden'} values={{jpid: journalpostid}}/>
                    </AlertStripeAdvarsel>}

                    {!!conflict && typeof journalpostConflictError !== 'undefined' && journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET && <>
                      <AlertStripeAdvarsel><FormattedMessage id={'startPage.feil.ikkeStøttet'}/></AlertStripeAdvarsel>
                      <VerticalSpacer eightPx={true}/>
                      <Knapp onClick={() => {
                          if (typeof journalpostid !== 'undefined') lukkJournalpostOppgave(journalpostid);
                      }}>
                        <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES"/>
                      </Knapp>
                    </>}

                    {!!journalpost && !journalpost?.kanSendeInn &&
                    <AlertStripeAdvarsel><FormattedMessage id={'fordeling.kanikkesendeinn'}/></AlertStripeAdvarsel>}
                </SkjemaGruppe>
            </div>
        );
    }
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    notFound: state.felles.journalpostNotFound,
    forbidden: state.felles.journalpostForbidden,
    conflict: state.felles.journalpostConflict,
    journalpostConflictError: state.felles.journalpostConflictError,
    lukkOppgaveDone: state.fordelingState.lukkOppgaveDone
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (journalpostid: string) =>
        dispatch(getJournalpost(journalpostid)),
    lukkJournalpostOppgave: (journalpostid: string) =>
        dispatch(lukkJournalpostOppgaveAction(journalpostid)),
    lukkOppgaveReset: () =>
        dispatch(lukkOppgaveResetAction())
});

export const SearchForm = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent)
);
