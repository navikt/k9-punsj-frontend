import React from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { connect, useSelector } from 'react-redux';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { IJournalpost } from '../../models/types';
import { RootStateType } from '../../state/RootState';
import { opprettGosysOppgave as opprettGosysOppgaveAction } from '../../state/actions/GosysOppgaveActions';
import intlHelper from '../../utils/intlUtils';

export interface IOpprettOppgaveStateProps {
    journalpost?: IJournalpost;
}

export interface IIdentDispatchProps {
    opprettGosysOppgave: typeof opprettGosysOppgaveAction;
}

type IOpprettOppgaveProps = IOpprettOppgaveStateProps & IIdentDispatchProps & WrappedComponentProps;

type OpprettGosysOppgaveKnappProps = Pick<IOpprettOppgaveProps, 'opprettGosysOppgave' | 'journalpost'>;

const OpprettGosysOppgaveKnapp: React.FunctionComponent<OpprettGosysOppgaveKnappProps> = ({
    opprettGosysOppgave,
    journalpost,
}) => (
    // TODO ta en runda på journalpost og optional så det ikke er !.
    <Button
        type="button"
        variant="secondary"
        onClick={() => opprettGosysOppgave(journalpost!.journalpostId, journalpost!.norskIdent!, '')}
    >
        <FormattedMessage id="opprettGosysOppgave" />
    </Button>
);
const OpprettGosysOppgaveComponent: React.FunctionComponent<IOpprettOppgaveProps> = (props: IOpprettOppgaveProps) => {
    const { intl, opprettGosysOppgave, journalpost } = props;
    const { gosysOppgaveOprettet, gosysOppgaveFeil, gosysOppgaveAwaiting } = useSelector((state: RootStateType) => {
        const opprettOppgaveState = state.opprettIGosys;
        return {
            gosysOppgaveOprettet: opprettOppgaveState.gosysOppgaveRequestSuccess,
            gosysOppgaveFeil: opprettOppgaveState.gosysOppgaveRequestError,
            gosysOppgaveAwaiting: opprettOppgaveState.isAwaitingGosysOppgaveRequestResponse,
        };
    });

    if (gosysOppgaveAwaiting) {
        return <Loader size="large" />;
    }

    if (gosysOppgaveFeil) {
        return (
            <Alert size="small" variant="error">
                {intlHelper(intl, 'gosysOppgave.feilet')}
            </Alert>
        );
    }

    if (gosysOppgaveOprettet) {
        return (
            <Alert size="small" variant="success">
                {intlHelper(intl, 'gosysOppgave.opprettet')}
            </Alert>
        );
    }

    return <OpprettGosysOppgaveKnapp opprettGosysOppgave={opprettGosysOppgave} journalpost={journalpost} />;
};

const mapStateToProps = (state: RootStateType): IOpprettOppgaveStateProps => ({
    journalpost: state.felles.journalpost,
});

const mapDispatchToProps = (dispatch: any) => ({
    opprettGosysOppgave: (journalpostid: string, norskident: string) =>
        dispatch(opprettGosysOppgaveAction(journalpostid, norskident, '')),
});

export const OpprettGosysOppgavePanel = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(OpprettGosysOppgaveComponent),
);
