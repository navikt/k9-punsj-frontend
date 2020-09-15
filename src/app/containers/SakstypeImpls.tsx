import React from 'react';
import { Sakstype } from '../models/enums';
import {
  ISakstypeOmfordeling,
  ISakstypePunch,
  ISakstyper,
} from '../models/Sakstype';
import OmsorgspengerFordelingIdent from './omsorgspenger/fordeling/OmsorgspengerFordelingIdent';

import PleiepengerRouter from './pleiepenger/PleiepengerRouter';
import OverføringPunchContainer from './omsorgspenger/overforing/OverføringPunchContainer';
import OverføringIdentSjekkContainer from './omsorgspenger/overforing/OverføringIdentSjekkContainer';
import { ApiPath } from '../apiConfig';
import overføringSignaturReducer from '../state/reducers/omsorgspengeroverførdager/overføringSignaturReducer';
import overføringPunchReducer from '../state/reducers/omsorgspengeroverførdager/overføringPunchReducer';

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
      path: '/ident',
      stepName: 'ident',
      getComponent: () => <OmsorgspengerFordelingIdent />,
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
        <OverføringIdentSjekkContainer
          initialValues={initialValues}
          gåTilNesteSteg={gåTilNesteSteg}
        />
      ),
      stepOrder: 0,
      reducer: overføringSignaturReducer,
    },
    {
      path: '/punch/{ident}',
      stepName: 'punch',
      stepOrder: 1,
      reducer: overføringPunchReducer,
      getComponent: ({ gåTilForrigeSteg, initialValues }) => (
        <OverføringPunchContainer
          initialValues={initialValues}
          gåTilForrigeSteg={gåTilForrigeSteg}
        />
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

export const Sakstyper: ISakstyper = {
  punchSakstyper: [
    Pleiepenger,
    OmsorgspengerFordeling,
    OmsorgspengerOverføring,
  ],
  omfordelingssakstyper: [
    OmsorgspengerUtvidetRett,
    OmsorgspengerLegeerklæring,
    OmsorgspengerAleneomsorg,
    OmsorgspengerSelvstendigFrilans,
    OmsorgspengerArbeidsgiverIkkeBetaler,
    Opplæringspenger,
    PleiepengerLivetsSluttfase,
    Annet,
  ],
};
