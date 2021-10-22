import React from 'react';
import { Sakstype } from '../models/enums';
import { ISakstypeOmfordeling, ISakstypePunch, ISakstyper } from '../models/Sakstype';

import PleiepengerRouter from './pleiepenger/PleiepengerRouter';
import OverføringPunchContainer from './omsorgspenger/overforing/OverføringPunchContainer';
import OverføringIdentSjekkContainer from './omsorgspenger/overforing/OverføringIdentSjekkContainer';
import { ApiPath } from '../apiConfig';
import { OpprettGosysOppgavePanel } from './omsorgspenger/OpprettGosysOppgave';
import {SplitView} from "./omsorgspenger/korrigeringAvInntektsmelding/SplitView"
import KorrigeringAvInntektsmeldingContainer from './omsorgspenger/korrigeringAvInntektsmelding/KorrigeringAvInntektsmeldingContainer';

export const Pleiepenger: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_SYKT_BARN,
    punchPath: '/pleiepenger',
    getComponent: ({ journalpostid, punchPath }) => (
        <PleiepengerRouter journalpostid={journalpostid} punchPath={punchPath} />
    ),
    steps: [], // TODO: implementert annerledes - konverter hvis nødvendig
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
    steps: [
        {
            path: '/punch',
            stepName: 'punch',
            getComponent: () => <KorrigeringAvInntektsmeldingContainer />,
            stepOrder: 0,
        },
    ],
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

export const OmsorgspengerUtvidetRett: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_UTVIDET_RETT,
};

export const OmsorgspengerLegeerklæring: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_LEGEERKLÆRING,
};

export const OmsorgspengerAleneomsorg: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_ALENE_OM_OMSORG,
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

export const SkalIkkePUnsjes: ISakstypeOmfordeling = {
    navn: Sakstype.SKAL_IKKE_PUNSJES,
};

export const Sakstyper: ISakstyper = {
    punchSakstyper: [Pleiepenger, OmsorgspengerFordeling, OmsorgspengerOverføring],
    omfordelingssakstyper: [
        OmsorgspengerUtvidetRett,
        OmsorgspengerLegeerklæring,
        OmsorgspengerAleneomsorg,
        OmsorgspengerSelvstendigFrilans,
        OmsorgspengerArbeidsgiverIkkeBetaler,
        Opplæringspenger,
        PleiepengerLivetsSluttfase,
        Annet,
        SkalIkkePUnsjes,
    ],
};
