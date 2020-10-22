import React from 'react';
import {connect, useDispatch, useSelector} from 'react-redux';

import {JaNei, PunchStep, Sakstype} from "../../models/enums";
import {Knapp} from "nav-frontend-knapper";
import {FormattedMessage, injectIntl, WrappedComponentProps} from "react-intl";
import {opprettGosysOppgave} from "../../state/actions/GosysOppgaveActions";
import {RootStateType} from "../../state/RootState";
import {IJournalpost, ISignaturState} from "../../models/types";
import {setSignaturAction, setStepAction, usignert, usignertResetAction} from "../../state/actions";
import {IdentComponent} from "../pleiepenger/Ident";
import {IPunchPageComponentState} from "../pleiepenger/PunchPage";

export interface IOpprettOppgaveStateProps {
    journalpost?: IJournalpost;
}

export interface IIdentDispatchProps {
    opprettGosysOppgave: typeof opprettGosysOppgave;
}

type IOpprettOppgaveProps = IOpprettOppgaveStateProps &
    IIdentDispatchProps &
    WrappedComponentProps;


const OpprettGosysOppgaveContainer: React.FunctionComponent<IOpprettOppgaveProps> = (props: IOpprettOppgaveProps) => {
    return (
        <Knapp htmlType="button" type="hoved" onClick={() => props.opprettGosysOppgave(props.journalpost!.journalpostId)}>
            <FormattedMessage id="opprettGosysOppgave" />
        </Knapp>
    );
};

const mapStateToProps = (state: RootStateType): IOpprettOppgaveStateProps => ({
    journalpost: state.felles.journalpost,
});

const mapDispatchToProps = (dispatch: any) => ({
    opprettGosysOppgave: (journalpostid: string) => dispatch(opprettGosysOppgave(journalpostid)),
});

export const OpprettGosysOppgave = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(OpprettGosysOppgaveContainer)
);

