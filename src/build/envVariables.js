const envVariables = () => [
    {
        key: 'OIDC_AUTH_PROXY',
        value: process.env.OIDC_AUTH_PROXY,
    },
    {
        key: 'K9_PUNSJ_API_URL',
        value: process.env.K9_PUNSJ_API_URL,
    },
    {
        key: 'K9_LOS_URL',
        value: process.env.K9_LOS_URL,
    },
    {
        key: 'OMP_KS_ENABLED',
        value: process.env.OMP_KS_ENABLED,
    },
    {
        key: 'PLS_ENABLED',
        value: process.env.PLS_ENABLED,
    },
    {
        key: 'OMP_MA_FEATURE_TOGGLE',
        value: process.env.OMP_MA_FEATURE_TOGGLE,
    },
    {
        key: 'OMP_UT_FEATURE_TOGGLE',
        value: process.env.OMP_UT_FEATURE_TOGGLE,
    },
    {
        key: 'SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE',
        value: process.env.SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE,
    },
    {
        key: 'OLP_ENABLED',
        value: process.env.OLP_ENABLED,
    },
    {
        key: 'OMP_AO_ENABLED',
        value: process.env.OMP_AO_ENABLED,
    },
    {
        key: 'POSTMOTTAK_TOGGLE',
        value: process.env.POSTMOTTAK_TOGGLE,
    },
];

export default envVariables;
