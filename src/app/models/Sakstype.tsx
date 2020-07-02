import React, {ReactNode}  from 'react';
import OmsorgspengerRouter from '../sakstype/omsorgspenger/OmsorgspengerRouter';
import PleiepengerRouter   from '../sakstype/pleiepenger/PleiepengerRouter';
import {Sakstype}          from './enums';

export enum Behandlingsvalg {
    Punch,
    Omfordeling
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

export const Pleiepenger: ISakstype = {
    navn: Sakstype.PLEIEPENGER_SYKT_BARN,
    behandlingsvalg: Behandlingsvalg.Punch,
    punchConfig: {
        path: '/pleiepenger',
        getComponent: ({ journalpostid }) => <PleiepengerRouter journalpostid={journalpostid} />,
    }
}

export const OmsorgspengerOverføring: ISakstype = {
    navn: Sakstype.OMSORGSPENGER_OVERFØRING,
    behandlingsvalg: Behandlingsvalg.Punch,
    punchConfig: {
        path: '/overfoer-omsorgsdager',
        getComponent: () => <OmsorgspengerRouter />
    }
}

export const OmsorgspengerFordeling: ISakstype = {
    navn: Sakstype.OMSORGSPENGER_FORDELING,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const OmsorgspengerUtvidetRett: ISakstype = {
    navn: Sakstype.OMSORGSPENGER_UTVIDET_RETT,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const OmsorgspengerLegeerklæring: ISakstype = {
    navn: Sakstype.OMSORGSPENGER_LEGEERKLÆRING,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const OmsorgspengerAleneomsorg: ISakstype = {
    navn: Sakstype.OMSORGSPENGER_ALENE_OM_OMSORG,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const OmsorgspengerSelvstendigFrilans: ISakstype = {
    navn: Sakstype.OMSORGSPENGER_SELVST_FRILANS,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const OmsorgspengerArbeidsgiverIkkeBetaler: ISakstype = {
    navn: Sakstype.OMSORGSPENGER_ARBEIDSGIVER_IKKE_BETALER,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const Opplæringspenger: ISakstype = {
    navn: Sakstype.OPPLAERINGSPENGER,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const PleiepengerLivetsSluttfase: ISakstype = {
    navn: Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const Annet: ISakstype = {
    navn: Sakstype.ANNET,
    behandlingsvalg: Behandlingsvalg.Omfordeling
};

export const Sakstyper: ISakstype[] = [
    Pleiepenger,
    OmsorgspengerOverføring,
    OmsorgspengerFordeling,
    OmsorgspengerUtvidetRett,
    OmsorgspengerLegeerklæring,
    OmsorgspengerAleneomsorg,
    OmsorgspengerSelvstendigFrilans,
    OmsorgspengerArbeidsgiverIkkeBetaler,
    Opplæringspenger,
    PleiepengerLivetsSluttfase,
    Annet
]
