import React from 'react';
import { Hovedknapp } from 'nav-frontend-knapper';
import { FormattedMessage } from 'react-intl';
import { ISakstypeDefault, ISakstypePunch } from '../../../../models/Sakstype';
import { setHash } from '../../../../utils';
import { Sakstype } from '../../../../models/enums';
import { IFordelingProps } from '../Fordeling';

type BehandlingsknappProps = Pick<IFordelingProps, 'omfordel' | 'journalpost' | 'lukkJournalpostOppgave'> & {
    norskIdent: string;
    sakstypeConfig?: ISakstypeDefault;
    gosysKategoriJournalforing: string;
};

const Behandlingsknapp: React.FunctionComponent<BehandlingsknappProps> = ({
    norskIdent,
    omfordel,
    lukkJournalpostOppgave,
    journalpost,
    sakstypeConfig,
    gosysKategoriJournalforing,
}) => {
    if (!sakstypeConfig || !journalpost) {
        return null;
    }

    if ((sakstypeConfig as ISakstypePunch).punchPath) {
        const punchConfig = sakstypeConfig as ISakstypePunch;
        return (
            <Hovedknapp onClick={() => setHash(punchConfig.punchPath)}>
                <FormattedMessage id="fordeling.knapp.punsj" />
            </Hovedknapp>
        );
    }

    if (sakstypeConfig.navn === Sakstype.SKAL_IKKE_PUNSJES) {
        return (
            <Hovedknapp onClick={() => lukkJournalpostOppgave(journalpost.journalpostId)}>
                <FormattedMessage id="fordeling.knapp.bekreft" />
            </Hovedknapp>
        );
    }

    return (
        <Hovedknapp
            disabled={!gosysKategoriJournalforing}
            onClick={() => omfordel(journalpost.journalpostId, norskIdent, gosysKategoriJournalforing)}
        >
            <FormattedMessage id="fordeling.knapp.bekreft" />
        </Hovedknapp>
    );
};

export default Behandlingsknapp;
