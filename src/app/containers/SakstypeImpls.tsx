import React from 'react';

import OMPAORouter from 'app/omsorgspenger-alene-om-omsorgen/containers/OMPAORouter';

import { ApiPath } from '../apiConfig';
import { ISakstypeOmfordeling, ISakstypePunch, ISakstyper } from '../models/Sakstype';
import { Sakstype } from '../models/enums';
import OMPKSRouter from '../omsorgspenger-kronisk-sykt-barn/containers/OMPKSRouter';
import OMPMARouter from '../omsorgspenger-midlertidig-alene/containers/OMPMARouter';
import OMPUTRouter from '../omsorgspenger-utbetaling/containers/OMPUTRouter';
import OLPRouter from '../opplæringspenger/containers/OLPRouter';
import PLSRouter from '../pleiepenger-livets-sluttfase/containers/PLSRouter';
import SendBrevPåFagsak from './brev-fagsak/SendBrevPåFagsak';
import { OpprettGosysOppgavePanel } from './omsorgspenger/OpprettGosysOppgave';
import KorrigeringAvInntektsmeldingContainer from './omsorgspenger/korrigeringAvInntektsmelding/KorrigeringAvInntektsmeldingContainer';
import OverføringIdentSjekkContainer from './omsorgspenger/overforing/OverføringIdentSjekkContainer';
import OverføringPunchContainer from './omsorgspenger/overforing/OverføringPunchContainer';
import PleiepengerRouter from './pleiepenger/PleiepengerRouter';

export const Pleiepenger: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_SYKT_BARN,
    punchPath: '/pleiepenger',
    getComponent: ({ journalpostid, punchPath }) => (
        <PleiepengerRouter journalpostid={journalpostid} punchPath={punchPath} />
    ),
    steps: [],
};

export const PleiepengerILivetsSluttfase: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
    punchPath: '/pleiepenger-i-livets-sluttfase',
    getComponent: ({ journalpostid, punchPath }) => <PLSRouter journalpostid={journalpostid} punchPath={punchPath} />,
    steps: [],
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

export const OmsorgspengerFordeling: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_FORDELING,
    punchPath: '/fordeling-omsorgsdager',
    steps: [
        {
            path: '/opprett-i-gosys',
            stepName: 'opprettIGosys',
            getComponent: () => <OpprettGosysOppgavePanel />,
            stepOrder: 0,
        },
    ],
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

export const OmsorgspengerOverføring: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_OVERFØRING,
    punchPath: '/overfør-omsorgsdager',
    apiUrl: ApiPath.OMS_OVERFØR_DAGER,
    steps: [
        {
            path: '/signatur',
            stepName: 'signatur',
            getComponent: ({ gåTilNesteSteg, initialValues }) => (
                <OverføringIdentSjekkContainer initialValues={initialValues} gåTilNesteSteg={gåTilNesteSteg} />
            ),
            stepOrder: 0,
        },
        {
            path: '/punch/skjema',
            stepName: 'punch',
            stepOrder: 1,
            getComponent: ({ gåTilForrigeSteg, initialValues }) => (
                <OverføringPunchContainer initialValues={initialValues} gåTilForrigeSteg={gåTilForrigeSteg} />
            ),
        },
    ],
};

export const OpplæringspengerPunch: ISakstypePunch = {
    navn: Sakstype.OPPLAERINGSPENGER,
    punchPath: '/opplaeringspenger',
    getComponent: ({ journalpostid, punchPath }) => <OLPRouter journalpostid={journalpostid} punchPath={punchPath} />,
    steps: [],
};

export const OmsorgspengerKroniskSyktBarnOmfordeling: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN,
};

export const OmsorgspengerLegeerklæring: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_LEGEERKLÆRING,
};

export const OmsorgspengerSelvstendigFrilans: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_SELVST_FRILANS,
};

export const OmsorgspengerArbeidsgiverIkkeBetaler: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_ARBEIDSGIVER_IKKE_BETALER,
};

export const Opplæringspenger: ISakstypeOmfordeling = {
    navn: Sakstype.OPPLAERINGSPENGER,
};

export const PleiepengerLivetsSluttfase: ISakstypeOmfordeling = {
    navn: Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
};

export const Annet: ISakstypeOmfordeling = {
    navn: Sakstype.ANNET,
};

export const SkalIkkePunsjes: ISakstypeOmfordeling = {
    navn: Sakstype.SKAL_IKKE_PUNSJES,
};

export const Sakstyper: ISakstyper = {
    punchSakstyper: [
        Pleiepenger,
        PleiepengerILivetsSluttfase,
        OmsorgspengerFordeling,
        OmsorgspengerKroniskSyktBarnSakstypePunch,
        OmsorgspengerMidlertidigAlene,
        OmsorgspengerUtbetaling,
        OmsorgspengerAleneOmOmsorgen,
        OmsorgspengerOverføring,
        KorrigeringAvInntektsmelding,
        SendBrevPåEksisterendeFagsak,
        OpplæringspengerPunch,
    ],
    omfordelingssakstyper: [
        OmsorgspengerKroniskSyktBarnOmfordeling,
        OmsorgspengerLegeerklæring,
        OmsorgspengerSelvstendigFrilans,
        OmsorgspengerArbeidsgiverIkkeBetaler,
        PleiepengerLivetsSluttfase,
        Annet,
        SkalIkkePunsjes,
    ],
};
