import { JaNei } from '../../../enums';
import { IntlShape } from 'react-intl';
import {
  fødselsnummervalidator,
  IFeltValidator,
  minstEn,
  påkrevd,
  validerSkjema,
} from '../../../../rules/valideringer';

export enum Mottaker {
  Ektefelle = 'Ektefelle',
  Samboer = 'Samboer',
}

export interface IOverføringPunchSkjema {
  arbeidssituasjon: {
    erArbeidstaker: boolean;
    erFrilanser: boolean;
    erSelvstendigNæringsdrivende: boolean;
    metaHarFeil: null;
  };
  aleneOmOmsorgen: JaNei | null;
  fosterbarn: {
    harFosterbarn: JaNei | null;
    fødselsnummer?: string;
  };
  omsorgenDelesMed: {
    fødselsnummer: string;
    mottaker: Mottaker | null;
    antallOverførteDager: number;
  };
}

const fnrDelesMedValidator: IFeltValidator<string, IOverføringPunchSkjema> = {
  feltPath: 'omsorgenDelesMed.fødselsnummer',
  validatorer: [påkrevd, fødselsnummervalidator],
};

const arbeidssituasjonValidator: IFeltValidator<
  boolean,
  IOverføringPunchSkjema
> = {
  feltPath: 'arbeidssituasjon.metaHarFeil',
  validatorer: [(verdi, { arbeidssituasjon }) => minstEn(arbeidssituasjon)],
};

const aleneomOmsorgenValidator: IFeltValidator<
  JaNei,
  IOverføringPunchSkjema
> = {
  feltPath: 'aleneOmOmsorgen',
  validatorer: [påkrevd],
};

const harFosterbarnValidator: IFeltValidator<JaNei, IOverføringPunchSkjema> = {
  feltPath: 'fosterbarn.harFosterbarn',
  validatorer: [påkrevd],
};

export const validatePunch = (intl: IntlShape) =>
  validerSkjema<IOverføringPunchSkjema>(
    [
      fnrDelesMedValidator,
      arbeidssituasjonValidator,
      aleneomOmsorgenValidator,
      harFosterbarnValidator,
    ],
    intl
  );
