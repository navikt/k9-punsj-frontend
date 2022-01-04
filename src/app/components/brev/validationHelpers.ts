/* eslint-disable import/prefer-default-export */
const invalidTextMessage = (text: string) => `Feltet inneholder ugyldige tegn: ${text}`;

const textRegex =
    /^[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-‐–‑/%§!?@_()#+:;,="&\s<>~*]*$/;
const textGyldigRegex =
    /[0-9a-zA-ZæøåÆØÅAaÁáBbCcČčDdĐđEeFfGgHhIiJjKkLlMmNnŊŋOoPpRrSsŠšTtŦŧUuVvZzŽžéôèÉöüäÖÜÄ .'\-‐–‑/%§!?@_()#+:;,="&\s<>~*]*/g;

const hasValidText = (text?: string): true | string => {
    if (!text) {
        return 'Feltet er påkrevd';
    }
    if (!textRegex.test(text)) {
        const illegalChars = text.replace(textGyldigRegex, '');
        return invalidTextMessage(illegalChars.replace(/[\t]/g, 'Tabulatortegn'));
    }
    return true;
};

export const validateBrevmalkode = (value: string) => {
    if (!value) {
        return 'Må fylles ut';
    }
    return undefined;
};

export const validateMottaker = (value: string) => {
    if (!value) {
        return 'Må fylles ut';
    }
    return undefined;
};

export const validateText = (value: string, maxLength: number) => {
    if (!value) {
        return 'Må fylles ut';
    }
    if (value.length < 3) {
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
