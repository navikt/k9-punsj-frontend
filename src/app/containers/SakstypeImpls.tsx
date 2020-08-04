import React                                              from 'react';
import {Sakstype}                                         from '../models/enums';
import {ISakstypeOmfordeling, ISakstypePunch, ISakstyper} from '../models/Sakstype';
import OmsorgspengerFordelIdent                           from './omsorgspenger/OmsorgspengerFordelIdent';
import PleiepengerRouter                                  from './pleiepenger/PleiepengerRouter';

export const Pleiepenger: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_SYKT_BARN,
    punchPath: '/pleiepenger',
    getComponent: ({ journalpostid }) => <PleiepengerRouter journalpostid={journalpostid} />,
    steps: [] // TODO: implementert annerledes - konverter hvis nødvendig
};

export const OmsorgspengerFordeling: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_FORDELING,
    punchPath: '/fordel-omsorgsdager',
    steps: [
        {
            path: '/ident',
            stepName: 'ident',
            getComponent: () => <OmsorgspengerFordelIdent />,
            stepOrder: 0
        }
    ]
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
