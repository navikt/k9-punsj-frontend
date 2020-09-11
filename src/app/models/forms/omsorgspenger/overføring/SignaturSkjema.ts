import { JaNei } from '../../../enums';
import {
  fødselsnummervalidator,
  IFeltValidator,
  påkrevd,
  validerSkjema,
} from '../../../../rules/valideringer';
import { IntlShape } from 'react-intl';

export interface ISignaturSkjema {
  identitetsnummer: string;
  signert: JaNei | null;
}

const fnrFeltValidator: IFeltValidator<string, ISignaturSkjema> = {
  feltPath: 'identitetsnummer',
  validatorer: [påkrevd, fødselsnummervalidator],
};

const signaturFeltValidator: IFeltValidator<JaNei, ISignaturSkjema> = {
  feltPath: 'signert',
  validatorer: [påkrevd],
};

export const validerSignaturSkjema = (intl: IntlShape) =>
  validerSkjema<ISignaturSkjema>(
    [fnrFeltValidator, signaturFeltValidator],
    intl
  );
