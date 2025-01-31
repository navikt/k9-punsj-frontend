import { IdentRules } from 'app/rules';

const validateSøkerIdentitetsnummer = (value: string) => {
    if (IdentRules.erUgyldigIdent(value)) return 'Ugyldig fødselsnummer';
    return undefined;
};

const validateNottatTittel = (value: string) => {
    if (!value) return 'Dette feltet er påkrevd';
    if (value.length < 3) return 'Tittel må være minst 3 tegn';
    return undefined;
};

const validateNotatText = (value: string) => {
    if (!value) return 'Dette feltet er påkrevd';
    if (value.length < 3) return 'Notat må være minst 3 tegn';
    if (value.length > 100000) return 'Notat kan ikke være lengre enn 10 000 tegn';
    return undefined;
};

export { validateSøkerIdentitetsnummer, validateNottatTittel, validateNotatText };
