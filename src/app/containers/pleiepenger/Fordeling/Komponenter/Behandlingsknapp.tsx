import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { Button } from '@navikt/ds-react';

import { RootStateType } from 'app/state/RootState';

import { ISakstypePunch } from '../../../../models/Sakstype';
import { Sakstype } from '../../../../models/enums';
import { IFordelingProps } from '../Fordeling';
import KlassifiserModal from './KlassifiserModal';

type BehandlingsknappProps = Pick<IFordelingProps, 'omfordel' | 'journalpost' | 'lukkJournalpostOppgave'> & {
    norskIdent: string;
    sakstypeConfig?: ISakstypePunch;
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
    const navigate = useNavigate();
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    if (!sakstypeConfig || !journalpost) {
        return null;
    }

    if (sakstypeConfig?.punchPath) {
        return (
            <Button size="small" onClick={() => navigate(sakstypeConfig.punchPath)}>
                <FormattedMessage id="fordeling.knapp.punsj" />
            </Button>
        );
    }

    // TODO slette denne
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
