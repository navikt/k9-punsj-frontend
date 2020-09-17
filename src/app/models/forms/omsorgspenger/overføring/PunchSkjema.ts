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

interface IBarn {
  identitetsnummer: string | null;
  fødselsdato: Dato | null;
}

export interface IOverføringPunchSkjema {
  identitetsnummer: string | null;
  arbeidssituasjon: {
    erArbeidstaker: boolean;
    erFrilanser: boolean;
    erSelvstendigNæringsdrivende: boolean;
    metaHarFeil: null;
  };
  borINorge: JaNei | null;
  aleneOmOmsorgen: JaNei | null;
  barn: IBarn[];
  omsorgenDelesMed: {
    identitetsnummer: string;
    mottaker: Mottaker | null;
    antallOverførteDager: number;
    samboerSiden: Dato | null;
  };
  mottaksdato: Dato | null;
}

export const tomtSkjema: IOverføringPunchSkjema = {
  identitetsnummer: null,
  arbeidssituasjon: {
    erArbeidstaker: false,
    erFrilanser: false,
    erSelvstendigNæringsdrivende: false,
    metaHarFeil: null,
  },
  borINorge: null,
  omsorgenDelesMed: {
    identitetsnummer: '',
    antallOverførteDager: 0,
    mottaker: null,
    samboerSiden: null,
  },
  aleneOmOmsorgen: null,
  barn: [
    {
      identitetsnummer: null,
      fødselsdato: null,
    },
  ],
  mottaksdato: null,
};

const fnrDelesMedValidator: IFeltValidator<string, IOverføringPunchSkjema> = {
  feltPath: 'omsorgenDelesMed.identitetsnummer',
  validatorer: [påkrevd, fødselsnummervalidator],
};

const aleneomOmsorgenValidator: IFeltValidator<
  JaNei,
  IOverføringPunchSkjema
> = {
  feltPath: 'aleneOmOmsorgen',
  validatorer: [påkrevd],
};

const borINorgeValidator: IFeltValidator<JaNei, IOverføringPunchSkjema> = {
  feltPath: 'borINorge',
  validatorer: [påkrevd],
};

const barnFnr: IFeltValidator<string, IOverføringPunchSkjema> = {
  feltPath: 'barn[].identitetsnummer',
  validatorer: [påkrevd, fødselsnummervalidator],
  arrayInPath: true,
};

const barnFødselsdato: IFeltValidator<string, IOverføringPunchSkjema> = {
  feltPath: 'barn[].fødselsdato',
  validatorer: [påkrevd, gyldigDato],
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
      barnFødselsdato,
      mottaksdatoValidator,
      samboerSidenValidator,
      borINorgeValidator,
    ],
    intl
  );

export const useOverføringPunchSkjemaContext = () =>
  useFormikContext<IOverføringPunchSkjema>();
