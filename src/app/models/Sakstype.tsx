import React, {ReactNode}        from 'react';
import OmsorgspengerFordelRouter from '../sakstype/omsorgspenger/OmsorgspengerFordelRouter';
import PleiepengerRouter         from '../sakstype/pleiepenger/PleiepengerRouter';
import {Sakstype}          from './enums';

export enum Behandlingsvalg {
    Punch,
    Omfordeling
}

export interface ISakstypeDefault {
    navn: Sakstype;
}

export interface ISakstypeOmfordeling extends ISakstypeDefault {}

export interface ISakstypePunch extends ISakstypeDefault {
    punchPath: string;
    getComponent: (props: ISakstypeComponentProps) => ReactNode;
}

export interface ISakstyper {
    punchSakstyper: ISakstypePunch[];
    omfordelingssakstyper: ISakstypeOmfordeling[];
}

export interface ISakstypeComponentProps {
    journalpostid: string;
}

export interface ISakstype {
    navn: Sakstype;
    behandlingsvalg: Behandlingsvalg;
    punchConfig?: {
        path: string;
        getComponent: (props: ISakstypeComponentProps) => ReactNode;
    }
}

export const Pleiepenger: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_SYKT_BARN,
    punchPath: '/pleiepenger',
    getComponent: ({ journalpostid }) => <PleiepengerRouter journalpostid={journalpostid} />,
};

export const OmsorgspengerFordeling: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_FORDELING,
    punchPath: '/fordel-omsorgsdager',
    getComponent: () => <OmsorgspengerFordelRouter />
};

export const OmsorgspengerOverføring: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_OVERFØRING
}

export const OmsorgspengerUtvidetRett: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_UTVIDET_RETT
};

export const OmsorgspengerLegeerklæring: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_LEGEERKLÆRING
};

export const OmsorgspengerAleneomsorg: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_ALENE_OM_OMSORG
};

export const OmsorgspengerSelvstendigFrilans: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_SELVST_FRILANS
};

export const OmsorgspengerArbeidsgiverIkkeBetaler: ISakstypeOmfordeling = {
    navn: Sakstype.OMSORGSPENGER_ARBEIDSGIVER_IKKE_BETALER
};

export const Opplæringspenger: ISakstypeOmfordeling = {
    navn: Sakstype.OPPLAERINGSPENGER
};

export const PleiepengerLivetsSluttfase: ISakstypeOmfordeling = {
    navn: Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE
};

export const Annet: ISakstypeOmfordeling = {
    navn: Sakstype.ANNET
}

export const Sakstyper: ISakstyper = {
    punchSakstyper: [
        Pleiepenger,
        OmsorgspengerFordeling
    ],
    omfordelingssakstyper: [
        OmsorgspengerOverføring,
        OmsorgspengerUtvidetRett,
        OmsorgspengerLegeerklæring,
        OmsorgspengerAleneomsorg,
        OmsorgspengerSelvstendigFrilans,
        OmsorgspengerArbeidsgiverIkkeBetaler,
        Opplæringspenger,
        PleiepengerLivetsSluttfase,
        Annet
    ]
}
