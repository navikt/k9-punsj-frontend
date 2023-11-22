import React from 'react';

import OMPAORouter from 'app/omsorgspenger-alene-om-omsorgen/containers/OMPAORouter';
import { ROUTES } from 'app/constants/routes';

import { ISakstypeOmfordeling, ISakstypePunch, ISakstyper } from '../models/Sakstype';
import { Sakstype } from '../models/enums';
import OMPKSRouter from '../omsorgspenger-kronisk-sykt-barn/containers/OMPKSRouter';
import OMPMARouter from '../omsorgspenger-midlertidig-alene/containers/OMPMARouter';
import OMPUTRouter from '../omsorgspenger-utbetaling/containers/OMPUTRouter';
import OLPRouter from '../opplæringspenger/containers/OLPRouter';
import SendBrevPåFagsak from './brev-fagsak/SendBrevPåFagsak';
import KorrigeringAvInntektsmeldingContainer from './omsorgspenger/korrigeringAvInntektsmelding/KorrigeringAvInntektsmeldingContainer';

export const Pleiepenger: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_SYKT_BARN,
    punchPath: ROUTES.PSB_ROOT,
};

export const PleiepengerILivetsSluttfase: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
    punchPath: ROUTES.PLS_ROOT,
};

export const OmsorgspengerKroniskSyktBarnSakstypePunch: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN,
    punchPath: '/omsorgspenger-kronisk-sykt-barn',
    getComponent: ({ journalpostid, punchPath }) => <OMPKSRouter journalpostid={journalpostid} punchPath={punchPath} />,
    steps: [],
};

export const OmsorgspengerMidlertidigAlene: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE,
    punchPath: '/omsorgspenger-midlertidig-alene',
    getComponent: ({ journalpostid, punchPath }) => <OMPMARouter journalpostid={journalpostid} punchPath={punchPath} />,
    steps: [],
};

export const OmsorgspengerUtbetaling: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_UTBETALING,
    punchPath: '/omsorgspenger-utbetaling',
    getComponent: ({ journalpostid, punchPath }) => <OMPUTRouter journalpostid={journalpostid} punchPath={punchPath} />,
    steps: [],
};
export const OmsorgspengerAleneOmOmsorgen: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_ALENE_OM_OMSORGEN,
    punchPath: '/omsorgspenger-alene-om-omsorgen',
    getComponent: ({ journalpostid, punchPath }) => <OMPAORouter journalpostid={journalpostid} punchPath={punchPath} />,
    steps: [],
};

export const KorrigeringAvInntektsmelding: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING,
    punchPath: '/korrigering-av-inntektsmelding',
    getComponent: () => <KorrigeringAvInntektsmeldingContainer />,
    steps: [],
};

export const SendBrevPåEksisterendeFagsak: ISakstypePunch = {
    navn: Sakstype.SEND_BREV,
    punchPath: '/send-brev-fagsak',
    getComponent: () => <SendBrevPåFagsak />,
    steps: [],
};

export const OpplæringspengerPunch: ISakstypePunch = {
    navn: Sakstype.OPPLAERINGSPENGER,
    punchPath: '/opplaeringspenger',
    getComponent: ({ journalpostid, punchPath }) => <OLPRouter journalpostid={journalpostid} punchPath={punchPath} />,
    steps: [],
};

export const Annet: ISakstypeOmfordeling = {
    navn: Sakstype.ANNET,
};

export const klassifiserDokument: ISakstypeOmfordeling = {
    navn: Sakstype.KLASSIFISER_OG_GAA_TIL_LOS,
};

export const SkalIkkePunsjes: ISakstypeOmfordeling = {
    navn: Sakstype.SKAL_IKKE_PUNSJES,
};

export const Sakstyper: ISakstyper = {
    punchSakstyper: [
        Pleiepenger,
        PleiepengerILivetsSluttfase,
        OmsorgspengerKroniskSyktBarnSakstypePunch,
        OmsorgspengerAleneOmOmsorgen,
        OmsorgspengerMidlertidigAlene,
        OmsorgspengerUtbetaling,
        KorrigeringAvInntektsmelding,
        SendBrevPåEksisterendeFagsak,
        OpplæringspengerPunch,
    ],
    omfordelingssakstyper: [Annet, SkalIkkePunsjes, klassifiserDokument],
};
