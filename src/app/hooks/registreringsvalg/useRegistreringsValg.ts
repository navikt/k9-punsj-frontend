import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { ROUTES } from 'app/constants/routes';
import { IdentRules } from 'app/rules';
import { DokumenttypeForkortelse } from 'app/models/enums/FordelingDokumenttype';
import { SOKNAD_CONFIGS } from './config';
import { fetchEksisterendeSoknader, createSoknad } from './api';
import { hentAlleJournalposterPerIdent } from 'app/api/api';
import { RegistreringsValgParams, RegistreringsValgResult, trengerIkkeEkstraIdent } from './types';

export const useRegistreringsValg = (
    soknadType: DokumenttypeForkortelse,
    params: RegistreringsValgParams,
): RegistreringsValgResult => {
    const navigate = useNavigate();
    const location = useLocation();
    const config = SOKNAD_CONFIGS[soknadType];

    const { journalpostid, søkerId, pleietrengendeId, annenPart, k9saksnummer } = params;

    // Redirect tilbake ved side reload hvis ingen søkerId
    useEffect(() => {
        if (!søkerId) {
            navigate(location.pathname.replace('soknader/', ''));
        }
    }, [søkerId, location.pathname, navigate]);

    // Hent eksisterende søknader
    const {
        data: eksisterendeSoknader,
        isLoading: isEksisterendeSoknaderLoading,
        error: eksisterendeSoknaderError,
    } = useQuery({
        queryKey: [config.queryKey, søkerId, pleietrengendeId, annenPart],
        queryFn: () => fetchEksisterendeSoknader(config, søkerId, pleietrengendeId),
        enabled:
            !!søkerId &&
            (trengerIkkeEkstraIdent(config.type) || IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId ?? null)),
    });

    // Hent journalposter per ident
    const {
        data: journalposter,
        isLoading: isJournalposterLoading,
        error: journalposterError,
    } = useQuery({
        queryKey: ['hentJournalposter', søkerId],
        queryFn: () => hentAlleJournalposterPerIdent(søkerId),
        enabled: !!søkerId,
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
    }, [isEksisterendeSoknaderLoading, eksisterendeSoknader?.søknader?.length, createSoknadMutation]);

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

    // Hjelpefunksjon for å navigere tilbake
    const handleTilbake = () => {
        navigate(location.pathname.replace('soknader/', ''));
    };

    return {
        // Data
        eksisterendeSoknader,
        søknader: eksisterendeSoknader?.søknader || [],
        journalposter: journalposter?.poster || [],

        // Laste tilstander
        isEksisterendeSoknaderLoading,
        isJournalposterLoading,
        isCreatingSoknad: createSoknadMutation.isPending,

        // Feil
        eksisterendeSoknaderError,
        journalposterError,
        createSoknadError: createSoknadMutation.error,

        // Funksjoner
        createSoknad: createSoknadMutation.mutate,
        kanStarteNyRegistrering,
        handleTilbake,

        // Parametere
        journalpostid,
        søkerId,
        pleietrengendeId,
        annenPart,
        k9saksnummer,
    };
};
