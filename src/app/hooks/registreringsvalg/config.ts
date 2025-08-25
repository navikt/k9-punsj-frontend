import { DokumenttypeForkortelse } from 'app/models/enums/FordelingDokumenttype';
import { ApiPath } from 'app/apiConfig';
import { SoknadConfig } from './types';

export const SOKNAD_CONFIGS: Record<DokumenttypeForkortelse, SoknadConfig> = {
    [DokumenttypeForkortelse.PSB]: {
        type: DokumenttypeForkortelse.PSB,
        eksisterendeSoknaderPath: ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.PSB_SOKNAD_CREATE,
        queryKey: 'psb-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.PPN]: {
        type: DokumenttypeForkortelse.PPN,
        eksisterendeSoknaderPath: ApiPath.PLS_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.PLS_SOKNAD_CREATE,
        queryKey: 'pls-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.OMP_AO]: {
        type: DokumenttypeForkortelse.OMP_AO,
        eksisterendeSoknaderPath: ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.OMP_AO_SOKNAD_CREATE,
        queryKey: 'ompao-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.OMP_UT]: {
        type: DokumenttypeForkortelse.OMP_UT,
        eksisterendeSoknaderPath: ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.OMP_UT_SOKNAD_CREATE,
        queryKey: 'omput-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.OMP_MA]: {
        type: DokumenttypeForkortelse.OMP_MA,
        eksisterendeSoknaderPath: ApiPath.OMP_MA_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.OMP_MA_SOKNAD_CREATE,
        queryKey: 'ompma-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.OMP_KS]: {
        type: DokumenttypeForkortelse.OMP_KS,
        eksisterendeSoknaderPath: ApiPath.OMP_KS_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.OMP_KS_SOKNAD_CREATE,
        queryKey: 'ompks-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.OLP]: {
        type: DokumenttypeForkortelse.OLP,
        eksisterendeSoknaderPath: ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.OLP_SOKNAD_CREATE,
        queryKey: 'olp-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.OMP]: {
        type: DokumenttypeForkortelse.OMP,
        eksisterendeSoknaderPath: ApiPath.OMS_EKSISTERENDE_SOKNADER_FIND,
        createSoknadPath: ApiPath.OMS_SOKNAD_CREATE,
        queryKey: 'omp-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.UKJENT]: {
        type: DokumenttypeForkortelse.UKJENT,
        eksisterendeSoknaderPath: '',
        createSoknadPath: '',
        queryKey: 'ukjent-eksisterende-soknader',
    },
    [DokumenttypeForkortelse.IKKE_DEFINERT]: {
        type: DokumenttypeForkortelse.IKKE_DEFINERT,
        eksisterendeSoknaderPath: '',
        createSoknadPath: '',
        queryKey: 'ikke-definert-eksisterende-soknader',
    },
};
