import { IdentRules } from './IdentRules';
import { IntlShape } from 'react-intl';
import { FormikErrors } from 'formik';
import _ from 'lodash';
import intlHelper from '../utils/intlUtils';

export type Validator<VerdiType, Skjema> = (
  verdi: VerdiType,
  skjema: Skjema
) => string | undefined;

export interface IFeltValidator<FeltType, SkjemaType> {
  feltPath: string;
  validatorer: Validator<FeltType, SkjemaType>[];
}

export function validerSkjema<SkjemaType>(
  feltvalidatorer: IFeltValidator<any, SkjemaType>[],
  intl: IntlShape
) {
  return (skjema: SkjemaType): FormikErrors<SkjemaType> =>
    feltvalidatorer.reduce((tempErrors, { feltPath, validatorer }) => {
      const feltError = validatorer
        .map((validator) => validator(_.get(skjema, feltPath), skjema))
        .find((error) => error);
      if (feltError) {
        return _.set(tempErrors, feltPath, intlHelper(intl, feltError));
      }
      return tempErrors;
    }, {});
}

export function påkrevd<VerdiType>(verdi: VerdiType) {
  return !!verdi ? undefined : 'skjema.validering.påkrevd';
}

export function fødselsnummervalidator(verdi: string) {
  return IdentRules.hasIdent11Digits(verdi)
    ? undefined
    : 'skjema.validering.11siffer';
}

export function minstEn<VerdiType>(verdi: VerdiType) {
  return Object.values(verdi).some((subVerdi) => subVerdi)
    ? undefined
    : 'skjema.validering.minstEn';
}

export function positivtHeltall(verdi: number) {
  const positivtHeltallPattern = /^[1-9]\d*$/;
  return positivtHeltallPattern.test(`${verdi}`)
    ? undefined
    : 'skjema.validering.positivtheltall';
}
