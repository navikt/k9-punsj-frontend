import { IntlShape } from 'react-intl';

import { IFeltValidator, fødselsnummervalidator, påkrevd, validerSkjema } from '../../../../rules/valideringer';
import { JaNei } from '../../../enums';

export interface ISignaturSkjema {
    identitetsnummer: string;
    signert: JaNei | null;
    sammeIdentSomRegistrert: JaNei | null;
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
    validerSkjema<ISignaturSkjema>([fnrFeltValidator, signaturFeltValidator], intl);
