import {ISakstypeDefault, ISakstypePunch} from "../../../../models/Sakstype";
import React from "react";
import {Hovedknapp} from "nav-frontend-knapper";
import {setHash} from "../../../../utils";
import {FormattedMessage} from "react-intl";
import {Sakstype} from "../../../../models/enums";
import {IFordelingProps} from "../Fordeling";

type BehandlingsknappProps = Pick<IFordelingProps,
    'omfordel' | 'journalpost' | 'lukkJournalpostOppgave'> & {
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
    gosysKategoriJournalforing
}) => {
    if (!sakstypeConfig || !journalpost) {
        return null;
    }

    if ((sakstypeConfig as ISakstypePunch).punchPath) {
        const punchConfig = sakstypeConfig as ISakstypePunch;

        return (
            <Hovedknapp onClick={() => setHash(punchConfig.punchPath)}>
                <FormattedMessage id="fordeling.knapp.punsj"/>
            </Hovedknapp>
        );
    }

    if (sakstypeConfig.navn === Sakstype.SKAL_IKKE_PUNSJES) {
        return (
            <Hovedknapp onClick={() => lukkJournalpostOppgave(journalpost.journalpostId)}>
                <FormattedMessage id="fordeling.knapp.bekreft"/>
            </Hovedknapp>
        );
    }

    return (
        <Hovedknapp
            onClick={() => omfordel(journalpost.journalpostId, norskIdent,  gosysKategoriJournalforing.length > 0 ? gosysKategoriJournalforing : 'Annet')}
        >
            <FormattedMessage id="fordeling.knapp.bekreft"/>
        </Hovedknapp>
    );
};

export default Behandlingsknapp;