/* eslint-disable import/prefer-default-export */
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
