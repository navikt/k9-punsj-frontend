import {fødselsnummervalidator, gyldigDato, IFeltValidator, påkrevd, validerSkjema} from "../../rules/valideringer";
import {IntlShape} from "react-intl";
import {useFormikContext} from "formik";

export interface IPunchFormSkjema {
    identitetsnummer: string;
    fraOgMed: string;
    tilOgMed: string;
}

const fnrFeltValidator: IFeltValidator<string, IPunchFormSkjema> = {
    feltPath: 'identitetsnummer',
    validatorer: [fødselsnummervalidator],
};

const periodeFraValidator: IFeltValidator<string, IPunchFormSkjema> = {
    feltPath: 'fraOgMed',
    validatorer: [påkrevd, gyldigDato],
};

const timerValidator: IFeltValidator<string, IPunchFormSkjema> = {
    feltPath: 'timer',
    validatorer: [påkrevd],
};

export const validerPunchForm = (intl: IntlShape) =>
    validerSkjema<IPunchFormSkjema>(
        [fnrFeltValidator,
            periodeFraValidator, timerValidator],
        intl
    );

export const usePunchFormContext = () =>
    useFormikContext<IPunchFormSkjema>();
