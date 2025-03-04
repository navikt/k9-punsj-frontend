import { FormikValues } from 'formik';
import * as yup from 'yup';

import dayjs from 'dayjs';
import { initializeDate } from './timeUtils';
import { capitalize } from './utils';

const invalidTextMessage = (text: string) => `Feltet inneholder ugyldige tegn: ${text}`;

const textRegex =
    /^[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-‐–‑/%§!?@_()#+:;,="&\s<>~*]*$/;
const textGyldigRegex =
    /[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-‐–‑/%§!?@_()#+:;,="&\s<>~*]*/g;

export const hasValidText = (text?: string): true | string => {
    if (!text) {
        return 'Feltet er påkrevd';
    }
    if (!textRegex.test(text)) {
        const illegalChars = text.replace(textGyldigRegex, '');
        return invalidTextMessage(illegalChars.replace(/[\t]/g, 'Tabulatortegn'));
    }
    return true;
};

export const requiredValue = (value: string) => {
    if (!value) {
        return 'Må fylles ut';
    }
    return undefined;
};

export const validateText = (value: string, maxLength: number, exactLength?: boolean) => {
    if (!value) {
        return 'Må fylles ut';
    }
    if (exactLength && value.length !== maxLength) {
        return `Feltet må være ${maxLength} tegn`;
    }
    if (value.trim().length < 3) {
        return 'Du må skrive minst 3 tegn';
    }
    if (value.length > maxLength) {
        return `Feltet må være mindre eller lik ${maxLength} tegn`;
    }
    if (hasValidText(value) !== true) {
        return hasValidText(value);
    }
    return undefined;
};

export const feilFraYup = (schema: yup.AnyObjectSchema, soknad: FormikValues, context?: any) => {
    try {
        schema.validateSync(soknad, { abortEarly: false, context });
        return [];
    } catch (error) {
        if (!error.inner) {
            return [];
        }
        const errors = error.inner?.map(
            ({ message, params: { path } }: { message: string; params: { path: string } }) => ({
                message: capitalize(message),
                path,
            }),
        );
        return errors;
    }
};

export const erYngreEnn18år = (fødselsnummer: string) => {
    const individnummerFraFødselsnummer = fødselsnummer.substring(6, 9);
    const århundreFraFødselsnummer = +individnummerFraFødselsnummer < 500 ? '19' : '20';
    const søkerFødselsdato = initializeDate(
        `${fødselsnummer.substring(0, 4)}${århundreFraFødselsnummer}${fødselsnummer.substring(4, 6)}`,
        ['DDMMYYYY'],
    );
    return dayjs().diff(søkerFødselsdato, 'years') < 18;
};
