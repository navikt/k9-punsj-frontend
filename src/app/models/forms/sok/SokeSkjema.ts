import {fødselsnummervalidator, gyldigDato, IFeltValidator, påkrevd, validerSkjema} from "../../../rules/valideringer";
import {IntlShape} from "react-intl";
import {IOverføringPunchSkjema} from "../omsorgspenger/overføring/PunchSkjema";

export interface ISokeSkjema {
    identitetsnummer: string;
    fraOgMed: string;
    tilOgMed: string;
}

const fnrFeltValidator: IFeltValidator<string, ISokeSkjema> = {
    feltPath: 'identitetsnummer',
    validatorer: [fødselsnummervalidator],
};

const periodeFraValidator: IFeltValidator<string, ISokeSkjema> = {
    feltPath: 'fraOgMed',
    validatorer: [påkrevd, gyldigDato],
};

const periodeTilValidator: IFeltValidator<string, ISokeSkjema> = {
    feltPath: 'tilOgMed',
    validatorer: [påkrevd, gyldigDato],
};

export const validerSokeSkjema = (intl: IntlShape) =>
    validerSkjema<ISokeSkjema>(
        [fnrFeltValidator,
            periodeFraValidator,
            periodeTilValidator],
        intl
    );
