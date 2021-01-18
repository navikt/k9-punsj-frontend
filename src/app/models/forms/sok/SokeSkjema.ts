import {fødselsnummervalidator, IFeltValidator, påkrevd, validerSkjema} from "../../../rules/valideringer";
import {IntlShape} from "react-intl";

export interface ISokeSkjema {
    identitetsnummer: string;
}

const fnrFeltValidator: IFeltValidator<string, ISokeSkjema> = {
    feltPath: 'identitetsnummer',
    validatorer: [fødselsnummervalidator],
};

export const validerSokeSkjema = (intl: IntlShape) =>
    validerSkjema<ISokeSkjema>(
        [fnrFeltValidator],
        intl
    );
