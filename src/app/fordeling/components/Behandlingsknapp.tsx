import React from 'react';

import { Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { RootStateType } from 'app/state/RootState';
import { IFordelingProps } from '../Fordeling';
import { ISakstypePunch } from '../../models/Sakstype';
import { Sakstype } from '../../models/enums';

type BehandlingsknappProps = Pick<IFordelingProps, 'omfordel' | 'journalpost' | 'lukkJournalpostOppgave'> & {
    norskIdent: string;
    gosysKategoriJournalforing: string;
    sakstypeConfig?: ISakstypePunch;
};

const Behandlingsknapp: React.FC<BehandlingsknappProps> = ({
    journalpost,
    norskIdent,
    sakstypeConfig,
    gosysKategoriJournalforing,
    omfordel,
    lukkJournalpostOppgave,
}) => {
    const navigate = useNavigate();
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);

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
