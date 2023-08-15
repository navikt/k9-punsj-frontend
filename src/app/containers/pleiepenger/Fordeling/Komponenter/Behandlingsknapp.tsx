import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { Button } from '@navikt/ds-react';

import { RootStateType } from 'app/state/RootState';

import { ISakstypeDefault, ISakstypePunch } from '../../../../models/Sakstype';
import { Sakstype } from '../../../../models/enums';
import { setHash } from '../../../../utils';
import { IFordelingProps } from '../Fordeling';
import KlassifiserModal from './KlassifiserModal';

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
    const [visKlassifiserModal, setVisKlassifiserModal] = useState(false);
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    if (!sakstypeConfig || !journalpost) {
        return null;
    }

    if ((sakstypeConfig as ISakstypePunch).punchPath) {
        const punchConfig = sakstypeConfig as ISakstypePunch;
        return (
            <Button onClick={() => setHash(punchConfig.punchPath)}>
                <FormattedMessage id="fordeling.knapp.punsj" />
            </Button>
        );
    }

    if (sakstypeConfig.navn === Sakstype.KLASSIFISER_OG_GAA_TIL_LOS) {
        return (
            <>
                {visKlassifiserModal && <KlassifiserModal lukkModal={() => setVisKlassifiserModal(false)} />}
                <Button variant="primary" onClick={() => setVisKlassifiserModal(true)}>
                    <FormattedMessage id="fordeling.knapp.bekreft" />
                </Button>
            </>
        );
    }
    if (sakstypeConfig.navn === Sakstype.SKAL_IKKE_PUNSJES) {
        return (
            <Button onClick={() => lukkJournalpostOppgave(journalpost.journalpostId, norskIdent, fagsak)}>
                <FormattedMessage id="fordeling.knapp.bekreft" />
            </Button>
        );
    }

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
