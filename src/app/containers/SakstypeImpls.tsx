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
import SignaturSkjemaContainer from './omsorgspenger/overforing/SignaturSkjemaContainer';
import { ApiPath } from '../apiConfig';
import overføringSignaturReducer from '../state/reducers/omsorgspengeroverførdager/overføringSignaturReducer';

export const Pleiepenger: ISakstypePunch = {
  navn: Sakstype.PLEIEPENGER_SYKT_BARN,
  punchPath: '/pleiepenger',
  getComponent: ({ journalpostid }) => (
    <PleiepengerRouter journalpostid={journalpostid} />
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
  steps: [
    {
      path: '/signatur',
      stepName: 'signatur',
      getComponent: ({ gåTilNesteSteg, initialValues }) => (
        <SignaturSkjemaContainer
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
      getComponent: ({ sendInn, gåTilForrigeSteg }) => (
        <OverføringPunchContainer
          initialValues={{
            arbeidssituasjon: {
              erArbeidstaker: false,
              erFrilanser: false,
              erSelvstendigNæringsdrivende: false,
              metaHarFeil: null,
            },
            omsorgenDelesMed: {
              fødselsnummer: '',
              antallOverførteDager: 0,
              mottaker: null,
            },
            aleneOmOmsorgen: null,
            fosterbarn: {
              harFosterbarn: null,
              fødselsnummer: null,
            },
          }}
          sendInn={sendInn}
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
