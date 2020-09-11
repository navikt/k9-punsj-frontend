import { IntlShape } from 'react-intl';
import { useFormikContext } from 'formik';
import { JaNei } from '../../../enums';
import {
  fødselsnummervalidator,
  gyldigDato,
  IFeltValidator,
  positivtHeltall,
  påkrevd,
  validerSkjema,
} from '../../../../rules/valideringer';

export enum Innsendingsstatus {
  IkkeSendtInn = 'IkkeSendtInn',
  SenderInn = 'SenderInn',
  SendtInn = 'SendtInn',
  Innsendingsfeil = 'Innsendingsfeil',
}
export enum Mottaker {
  Ektefelle = 'Ektefelle',
  Samboer = 'Samboer',
}

type Dato = string;

export interface IOverføringPunchSkjema {
  avsender: {
    fødselsnummer: string | null;
  };
  arbeidssituasjon: {
    erArbeidstaker: boolean;
    erFrilanser: boolean;
    erSelvstendigNæringsdrivende: boolean;
    metaHarFeil: null;
  };
  aleneOmOmsorgen: JaNei | null;
  barn: {
    fødselsnummer: string | null;
  }[];
  omsorgenDelesMed: {
    fødselsnummer: string;
    mottaker: Mottaker | null;
    antallOverførteDager: number;
    samboerSiden: Dato | null;
  };
  mottaksdato: Dato | null;
}

const fnrDelesMedValidator: IFeltValidator<string, IOverføringPunchSkjema> = {
  feltPath: 'omsorgenDelesMed.fødselsnummer',
  validatorer: [påkrevd, fødselsnummervalidator],
};

const aleneomOmsorgenValidator: IFeltValidator<
  JaNei,
  IOverføringPunchSkjema
> = {
  feltPath: 'aleneOmOmsorgen',
  validatorer: [påkrevd],
};

const barnFnr: IFeltValidator<string, IOverføringPunchSkjema> = {
  feltPath: 'barn[].fødselsnummer',
  validatorer: [påkrevd, fødselsnummervalidator],
  arrayInPath: true,
};

const mottakerValidator: IFeltValidator<JaNei, IOverføringPunchSkjema> = {
  feltPath: 'omsorgenDelesMed.mottaker',
  validatorer: [påkrevd],
};

const samboerSidenValidator: IFeltValidator<Dato, IOverføringPunchSkjema> = {
  feltPath: 'omsorgenDelesMed.samboerSiden',
  validatorer: [
    (verdi, skjema) =>
      skjema.omsorgenDelesMed?.mottaker === Mottaker.Samboer
        ? påkrevd(verdi)
        : undefined,
    (verdi, skjema) =>
      skjema.omsorgenDelesMed?.mottaker === Mottaker.Samboer
        ? gyldigDato(verdi)
        : undefined,
  ],
};

const antallDelteDagerValidator: IFeltValidator<
  number,
  IOverføringPunchSkjema
> = {
  feltPath: 'omsorgenDelesMed.antallOverførteDager',
  validatorer: [positivtHeltall],
};

const mottaksdatoValidator: IFeltValidator<Dato, IOverføringPunchSkjema> = {
  feltPath: 'mottaksdato',
  validatorer: [påkrevd, gyldigDato],
};

export const validatePunch = (intl: IntlShape) =>
  validerSkjema<IOverføringPunchSkjema>(
    [
      fnrDelesMedValidator,
      aleneomOmsorgenValidator,
      mottakerValidator,
      antallDelteDagerValidator,
      barnFnr,
      mottaksdatoValidator,
      samboerSidenValidator,
    ],
    intl
  );

export const useOverføringPunchSkjemaContext = () =>
  useFormikContext<IOverføringPunchSkjema>();
