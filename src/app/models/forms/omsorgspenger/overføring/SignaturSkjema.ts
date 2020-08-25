import {JaNei} from '../../../enums';
import {fødselsnummervalidator, påkrevd, Validator} from '../../../../rules/valideringer';
import {IntlShape} from 'react-intl';
import {FormikErrors} from 'formik';
import intlHelper from '../../../../utils/intlUtils';

export interface ISignaturSkjema {
  fødselsnummer: string;
  signert: JaNei | null;
}

const fødselsnummerValideringer: Validator<
  string | undefined,
  ISignaturSkjema
  >[] = [påkrevd, fødselsnummervalidator];

export const validerSignaturSkjema = (intl: IntlShape) => ({
  fødselsnummer,
  signert,
}: ISignaturSkjema): FormikErrors<ISignaturSkjema> => {
  const errors: FormikErrors<ISignaturSkjema> = {};

  const fødselsnummerError = fødselsnummerValideringer
    .map((validering) => validering(fødselsnummer))
    .find((resultat) => resultat);

  if (fødselsnummerError) {
    errors.fødselsnummer = intlHelper(intl, fødselsnummerError);
  }

  const signaturError = [påkrevd]
    .map((validering) => validering(signert))
    .find((resultat) => resultat);

  if (signaturError) {
    errors.signert = intlHelper(intl, signaturError);
  }

  return errors;
};
