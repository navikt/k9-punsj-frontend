import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { ROUTES } from 'app/constants/routes';
import { IdentRules } from 'app/rules';
import { DokumenttypeForkortelse } from 'app/models/enums/FordelingDokumenttype';
import { SOKNAD_CONFIGS } from './config';
import { fetchEksisterendeSoknader, createSoknad } from './api';
import { RegistreringsValgParams, RegistreringsValgResult } from './types';

export const useRegistreringsValg = (
    soknadType: DokumenttypeForkortelse,
    params: RegistreringsValgParams,
): RegistreringsValgResult => {
    const navigate = useNavigate();
    const config = SOKNAD_CONFIGS[soknadType];

    const { journalpostid, søkerId, pleietrengendeId, annenPart, k9saksnummer } = params;

    // Hent eksisterende søknader
    const {
        data: eksisterendeSoknader,
        isLoading: isEksisterendeSoknaderLoading,
        error: eksisterendeSoknaderError,
    } = useQuery({
        queryKey: [config.queryKey, søkerId, pleietrengendeId],
        queryFn: () => fetchEksisterendeSoknader(config, søkerId, pleietrengendeId),
        enabled: !!søkerId && IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId),
    });

    // Opprett ny søknad
    const createSoknadMutation = useMutation({
        mutationFn: () => createSoknad(config, params),
        onSuccess: (data) => {
            navigate(`../${ROUTES.PUNCH.replace(':id', data.soeknadId)}`);
        },
    });

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        if (!isEksisterendeSoknaderLoading && eksisterendeSoknader?.søknader?.length === 0) {
            createSoknadMutation.mutate();
        }
    }, [isEksisterendeSoknaderLoading, eksisterendeSoknader?.søknader?.length]);

    // Sjekk om bruker kan starte ny registrering
    const kanStarteNyRegistrering = () => {
        const søknader = eksisterendeSoknader?.søknader;
        if (søknader?.length) {
            return !søknader.some((soknad: any) =>
                Array.from(soknad.journalposter || []).some((jp: string) => jp === journalpostid),
            );
        }
        return true;
    };

    return {
        // Data
        eksisterendeSoknader,
        søknader: eksisterendeSoknader?.søknader || [],

        // Laste tilstander
        isEksisterendeSoknaderLoading,
        isCreatingSoknad: createSoknadMutation.isPending,

        // Feil
        eksisterendeSoknaderError,
        createSoknadError: createSoknadMutation.error,

        // Funksjoner
        createSoknad: createSoknadMutation.mutate,
        kanStarteNyRegistrering,

        // Parametere
        journalpostid,
        søkerId,
        pleietrengendeId,
        annenPart,
        k9saksnummer,
    };
};
