import React from 'react';
import {connect, useSelector} from 'react-redux';
import {Knapp} from "nav-frontend-knapper";
import {FormattedMessage, injectIntl, WrappedComponentProps} from "react-intl";
import {opprettGosysOppgave as opprettGosysOppgaveAction} from "../../state/actions/GosysOppgaveActions";
import {RootStateType} from "../../state/RootState";
import {IJournalpost} from "../../models/types";
import {AlertStripeFeil, AlertStripeSuksess} from "nav-frontend-alertstriper";
import intlHelper from "../../utils/intlUtils";
import {IGosysOppgaveState} from "../../models/types/GosysOppgaveState";
import NavFrontendSpinner from "nav-frontend-spinner";
import {Sakstype} from "../../models/enums";

export interface IOpprettOppgaveStateProps {
    journalpost?: IJournalpost;
}

export interface IIdentDispatchProps {
    opprettGosysOppgave: typeof opprettGosysOppgaveAction;
}

type IOpprettOppgaveProps = IOpprettOppgaveStateProps &
    IIdentDispatchProps &
    WrappedComponentProps;

type OpprettGosysOppgaveKnappProps = Pick<
    IOpprettOppgaveProps,
    'opprettGosysOppgave' | 'journalpost'
    >;

const OpprettGosysOppgaveKnapp: React.FunctionComponent<OpprettGosysOppgaveKnappProps> = ({opprettGosysOppgave, journalpost}) => {

    return (
        <Knapp htmlType="button" type="hoved"
               onClick={() => opprettGosysOppgave(journalpost!.journalpostId, journalpost?.norskIdent)}>
            <FormattedMessage id="opprettGosysOppgave"/>
        </Knapp>
    );
};


const OpprettGosysOppgaveComponent: React.FunctionComponent<IOpprettOppgaveProps> = (props: IOpprettOppgaveProps) => {
    const {intl, opprettGosysOppgave, journalpost} = props;
    const { gosysOppgaveOprettet, gosysOppgaveFeil, gosysOppgaveAwaiting } = useSelector(
        (state: RootStateType) => {
            const opprettOppgaveState = state[Sakstype.OMSORGSPENGER_FORDELING].opprettIGosys;
            return {
                gosysOppgaveOprettet: opprettOppgaveState.gosysOppgaveRequestSuccess,
                gosysOppgaveFeil: opprettOppgaveState.gosysOppgaveRequestError,
                gosysOppgaveAwaiting: opprettOppgaveState.isAwaitingGosysOppgaveRequestResponse,
            };
        }
    );

    if (gosysOppgaveAwaiting) {
        return <NavFrontendSpinner />;
    }

    if (gosysOppgaveFeil) {
        return (
            <AlertStripeFeil>
                {intlHelper(intl, 'gosysOppgave.feilet')}
            </AlertStripeFeil>
        );};


    if (gosysOppgaveOprettet) {
        return (
            <AlertStripeSuksess>
                {intlHelper(intl, 'gosysOppgave.opprettet')}
            </AlertStripeSuksess>
        );};

    return (
        <OpprettGosysOppgaveKnapp
        opprettGosysOppgave={opprettGosysOppgave}
        journalpost={journalpost}/>
    );
};

const mapStateToProps = (state: RootStateType): IOpprettOppgaveStateProps => ({
    journalpost: state.felles.journalpost,
});

const mapDispatchToProps = (dispatch: any) => ({
    opprettGosysOppgave: (journalpostid: string, norskident?: string) => dispatch(opprettGosysOppgaveAction(journalpostid, norskident)),
});

export const OpprettGosysOppgavePanel = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(OpprettGosysOppgaveComponent)
);

