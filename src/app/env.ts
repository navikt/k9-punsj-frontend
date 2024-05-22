import { ApiPath } from './apiConfig';

interface EnvVariable {
    key: string;
    value: string;
}

interface EnvVariables {
    OIDC_AUTH_PROXY: string;
    K9_LOS_URL: string;
    APP_K9SAK_FAGSAK_FRONTEND_URL: string;
    OMP_KS_ENABLED: string;
    PLS_ENABLED: string;
    OMP_MA_FEATURE_TOGGLE: string;
    OMP_UT_FEATURE_TOGGLE: string;
    SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE: string;
    OLP_ENABLED: string;
    OMP_AO_ENABLED: string;
}

interface EnvVariable {
    key: string;
    value: string;
}

export interface EnvVariables {
    IS_LOCAL: string;
    K9_LOS_URL: string;
    APP_K9SAK_FAGSAK_FRONTEND_URL: string;
    OMP_KS_ENABLED: string;
    PLS_ENABLED: string;
    OMP_MA_FEATURE_TOGGLE: string;
    OMP_UT_FEATURE_TOGGLE: string;
    SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE: string;
    OLP_ENABLED: string;
    OMP_AO_ENABLED: string;
}

export default async function setEnvVariables(): Promise<void> {
    const response = await fetch(ApiPath.ENV_VARIABLES);
    const data: EnvVariable[] = await response.json();
    const envVariables = data.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}) as EnvVariables;
    const appSettings = {
        IS_LOCAL: envVariables.IS_LOCAL,
        K9_LOS_URL: envVariables.K9_LOS_URL,
        APP_K9SAK_FAGSAK_FRONTEND_URL: envVariables.APP_K9SAK_FAGSAK_FRONTEND_URL,
        OMP_KS_ENABLED: envVariables.OMP_KS_ENABLED,
        PLS_ENABLED: envVariables.PLS_ENABLED,
        OMP_MA_FEATURE_TOGGLE: envVariables.OMP_MA_FEATURE_TOGGLE,
        OMP_UT_FEATURE_TOGGLE: envVariables.OMP_UT_FEATURE_TOGGLE,
        SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE: envVariables.SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE,
        OLP_ENABLED: envVariables.OLP_ENABLED,
        OMP_AO_ENABLED: envVariables.OMP_AO_ENABLED,
    };
    (window as any).appSettings = JSON.parse(JSON.stringify(appSettings));
}
