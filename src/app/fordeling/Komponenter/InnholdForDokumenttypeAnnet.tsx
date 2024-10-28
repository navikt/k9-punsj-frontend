import React, { useEffect } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Button, TextField } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { IdentRules } from 'app/rules';
import {
    hentGjelderKategorierFraGosys,
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    setValgtGosysKategoriAction,
} from 'app/state/actions';
import { opprettGosysOppgave } from 'app/state/actions/GosysOppgaveActions';
import intlHelper from 'app/utils/intlUtils';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import Fagsak from 'app/types/Fagsak';

import GosysGjelderKategorier from './GoSysGjelderKategorier';

interface Props {
    journalpost: IJournalpost;
    sokersIdent: string;
    identState: IIdentState;
    fordelingState: IFordelingState;
    kanJournalforingsoppgaveOpprettesiGosys: boolean;
    fagsakFrajournalpost?: Fagsak; // Trenger vi denne?

    handleSøkerIdChange: (event: any) => void;
    handleSøkerIdBlur: (event: any) => void;

    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    omfordel: typeof opprettGosysOppgave;
    hentGjelderKategorier: typeof hentGjelderKategorierFraGosys;
    setValgtGosysKategori: typeof setValgtGosysKategoriAction;
}

const InnholdForDokumenttypeAnnet: React.FC<Props> = ({
    journalpost,
    sokersIdent,
    identState,
    fordelingState,
    kanJournalforingsoppgaveOpprettesiGosys,
    fagsakFrajournalpost,

    handleSøkerIdChange,
    handleSøkerIdBlur,

    lukkJournalpostOppgave,
    omfordel,
    hentGjelderKategorier,
    setValgtGosysKategori,
}: Props) => {
    const intl = useIntl();

    const { gosysGjelderKategorier, isAwaitingGosysGjelderResponse, gosysGjelderKategorierError, valgtGosysKategori } =
        fordelingState;

    const harKategorierBlivitHentet =
        isAwaitingGosysGjelderResponse === false &&
        !!gosysGjelderKategorier &&
        Object.keys(gosysGjelderKategorier).length > 0;

    if (!kanJournalforingsoppgaveOpprettesiGosys) {
        return (
            <div>
                <Alert size="small" variant="info" className="fordeling-page__kanIkkeOppretteJPIGosys">
                    <FormattedMessage id="fordeling.kanIkkeOppretteJPIGosys.info" />
                </Alert>
                <Button
                    variant="secondary"
                    onClick={() =>
                        lukkJournalpostOppgave(journalpost?.journalpostId, sokersIdent, fagsakFrajournalpost)
                    }
                >
                    <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                </Button>
            </div>
        );
    }

    useEffect(() => {
        if (!harKategorierBlivitHentet) {
            hentGjelderKategorier();
        }
    }, [harKategorierBlivitHentet]);

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

            {gosysGjelderKategorierError && (
                <Alert size="small" variant="error" className="mb-4" data-test-id="gosysGjelderKategorierError">
                    <FormattedMessage id="fordeling.kategoriGosys.hentError" />
                </Alert>
            )}

            {harKategorierBlivitHentet && (
                <GosysGjelderKategorier
                    intl={intl}
                    valgtGosysKategori={valgtGosysKategori}
                    gosysGjelderKategorier={gosysGjelderKategorier}
                    setValgtGosysKategori={setValgtGosysKategori}
                />
            )}

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
