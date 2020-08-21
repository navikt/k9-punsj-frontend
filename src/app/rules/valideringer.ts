import {IdentRules} from './IdentRules';

export type Validator<VerdiType, Skjema> = (
  verdi: VerdiType,
  skjema?: Skjema
) => string | undefined;

export function påkrevd<VerdiType>(verdi: VerdiType) {
  return !!verdi ? undefined : 'skjema.validering.påkrevd';
}

export function fødselsnummervalidator(verdi: string) {
  return IdentRules.hasIdent11Digits(verdi) ? undefined : 'Validator.11Siffer';
}
