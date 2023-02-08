import React, { useState } from 'react';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useSelector } from 'react-redux';
import { RootStateType } from 'app/state/RootState';
import { Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { ISakstypeDefault, ISakstypePunch } from '../../../../models/Sakstype';
import { setHash } from '../../../../utils';
import { Sakstype } from '../../../../models/enums';
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
            <Hovedknapp onClick={() => setHash(punchConfig.punchPath)}>
                <FormattedMessage id="fordeling.knapp.punsj" />
            </Hovedknapp>
        );
    }

    if (sakstypeConfig.navn === Sakstype.KLASSIFISER_OG_GAA_TIL_LOS) {
        return (
            <>
                {visKlassifiserModal && <KlassifiserModal lukkModal={() => setVisKlassifiserModal(false)} />}
                <Hovedknapp onClick={() => setVisKlassifiserModal(true)}>
                    <FormattedMessage id="fordeling.knapp.bekreft" />
                </Hovedknapp>
            </>
        );
    }
    if (sakstypeConfig.navn === Sakstype.SKAL_IKKE_PUNSJES) {
        return (
            <Hovedknapp onClick={() => lukkJournalpostOppgave(journalpost.journalpostId, norskIdent, fagsak)}>
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
