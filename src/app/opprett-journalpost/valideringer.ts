import { IdentRules } from 'app/rules/IdentRules';

const ERROR_MESSAGES = {
    henteFagsak: 'Kunne ikke hente fagsaker',
    søkerId: {
        required: 'Fødselsnummer er påkrevd',
        length: 'Fødselsnummer må være 11 siffer',
        invalid: 'Ugyldig fødselsnummer',
    },
};

export const validateSøkerId = (value: string) => {
    if (value.length !== 11) {
        return ERROR_MESSAGES.søkerId.length;
    }
    if (IdentRules.erUgyldigIdent(value)) {
        return ERROR_MESSAGES.søkerId.invalid;
    }
    return undefined;
};
