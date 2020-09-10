import { IntlShape } from 'react-intl';
import { useFormikContext } from 'formik';
import { JaNei } from '../../../enums';
import {
  fødselsnummervalidator,
  IFeltValidator,
  minstEn,
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

export interface IOverføringPunchSkjema {
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
  };
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

const antallDelteDagerValidator: IFeltValidator<
  number,
  IOverføringPunchSkjema
> = {
  feltPath: 'omsorgenDelesMed.antallOverførteDager',
  validatorer: [positivtHeltall],
};

export const validatePunch = (intl: IntlShape) =>
  validerSkjema<IOverføringPunchSkjema>(
    [
      fnrDelesMedValidator,
      aleneomOmsorgenValidator,
      mottakerValidator,
      antallDelteDagerValidator,
      barnFnr,
    ],
    intl
  );

export const useOverføringPunchSkjemaContext = () =>
  useFormikContext<IOverføringPunchSkjema>();
