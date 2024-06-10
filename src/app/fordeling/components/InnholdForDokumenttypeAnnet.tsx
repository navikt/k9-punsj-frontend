import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { Alert, Button, TextField } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction } from 'app/state/actions';
import { opprettGosysOppgave } from 'app/state/actions/GosysOppgaveActions';
import intlHelper from 'app/utils/intlUtils';

import { GosysGjelderKategorier } from './GoSysGjelderKategorier';

interface IInnholdForDokumenttypeAnnetProps {
    showComponent: boolean;
    journalpost: IJournalpost;
    kanJournalforingsoppgaveOpprettesiGosys: boolean;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    handleSøkerIdChange: (event: any) => void;
    handleSøkerIdBlur: (event: any) => void;
    sokersIdent: string;
    identState: IIdentState;
    fordelingState: IFordelingState;
    omfordel: typeof opprettGosysOppgave;
}

const InnholdForDokumenttypeAnnet: React.FC<IInnholdForDokumenttypeAnnetProps> = ({
    showComponent,
    journalpost,
    kanJournalforingsoppgaveOpprettesiGosys,
    lukkJournalpostOppgave,
    handleSøkerIdChange,
    handleSøkerIdBlur,
    sokersIdent,
    identState,
    fordelingState,
    omfordel,
}): JSX.Element | null => {
    const intl = useIntl();
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);

    if (!showComponent) {
        return null;
    }

    if (!kanJournalforingsoppgaveOpprettesiGosys) {
        return (
            <div>
                <Alert size="small" variant="info" className="fordeling-page__kanIkkeOppretteJPIGosys">
                    <FormattedMessage id="fordeling.kanIkkeOppretteJPIGosys.info" />
                </Alert>
                <Button
                    variant="secondary"
                    onClick={() => lukkJournalpostOppgave(journalpost?.journalpostId, sokersIdent, fagsak)}
                >
                    <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                </Button>
            </div>
        );
    }

    return (
        <div>
            <TextField
                label={intlHelper(intl, 'ident.identifikasjon.felt')}
                onChange={handleSøkerIdChange}
                onBlur={handleSøkerIdBlur}
                value={sokersIdent}
                className="bold-label ident-soker-1"
                maxLength={11}
                error={
                    IdentRules.erUgyldigIdent(identState.søkerId)
                        ? intlHelper(intl, 'ident.feil.ugyldigident')
                        : undefined
                }
            />
            <VerticalSpacer eightPx />
            <GosysGjelderKategorier />
            <Button
                size="small"
                disabled={IdentRules.erUgyldigIdent(identState.søkerId) || !fordelingState.valgtGosysKategori}
                onClick={() =>
                    omfordel(journalpost?.journalpostId, identState.søkerId, fordelingState.valgtGosysKategori)
                }
                data-test-id="oppretteGosysOppgaveBtn"
            >
                <FormattedMessage id="fordeling.sakstype.ANNET" />
            </Button>
        </div>
    );
};

export default InnholdForDokumenttypeAnnet;
