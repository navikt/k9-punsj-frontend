import React from 'react';

import { Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { ISakstypePunch } from 'app/models/Sakstype';
import { Sakstype } from 'app/models/enums';
import { IJournalpost } from 'app/models/types/Journalpost/Journalpost';
import { opprettGosysOppgave as omfordelAction } from 'app/state/actions/GosysOppgaveActions';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction } from 'app/state/actions';
import Fagsak from 'app/types/Fagsak';

interface Props {
    journalpost: IJournalpost;
    norskIdent: string;
    gosysKategoriJournalforing: string;
    fagsak?: Fagsak;
    sakstypeConfig?: ISakstypePunch;

    omfordel: typeof omfordelAction;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
}

const Behandlingsknapp: React.FC<Props> = ({
    journalpost,
    norskIdent,
    gosysKategoriJournalforing,
    fagsak,
    sakstypeConfig,
    omfordel,
    lukkJournalpostOppgave,
}: Props) => {
    const navigate = useNavigate();

    if (!sakstypeConfig || !journalpost) {
        return (
            <Button disabled size="small" onClick={() => null} data-test-id="bekreftKnapp">
                <FormattedMessage id="fordeling.knapp.punsj" />
            </Button>
        );
    }

    if (sakstypeConfig?.punchPath) {
        return (
            <Button size="small" onClick={() => navigate(sakstypeConfig?.punchPath)} data-test-id="bekreftKnapp">
                <FormattedMessage id="fordeling.knapp.punsj" />
            </Button>
        );
    }

    if (sakstypeConfig.navn === Sakstype.SKAL_IKKE_PUNSJES) {
        return (
            <Button onClick={() => lukkJournalpostOppgave(journalpost.journalpostId, norskIdent, fagsak)}>
                <FormattedMessage id="fordeling.knapp.bekreft" />
            </Button>
        );
    }

    // TODO: Kanskje fjerne det?
    return (
        <Button
            disabled={!gosysKategoriJournalforing}
            onClick={() => omfordel(journalpost.journalpostId, norskIdent, gosysKategoriJournalforing)}
        >
            <FormattedMessage id="fordeling.knapp.bekreft" />
        </Button>
    );
};

export default Behandlingsknapp;
