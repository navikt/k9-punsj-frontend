import validator from '@navikt/fnrvalidator';

// eslint-disable-next-line import/prefer-default-export
export class IdentRules {
    public static erUgyldigIdent = (ident: string | null): boolean => {
        if (!ident || !ident.length) return true;

        const { status } = validator.idnr(ident);

        return status === 'invalid';
    };

    public static erAlleIdenterGyldige = (søkerId: string, pleietrengendeId: string | null): boolean => {
        if (!søkerId) return false;
        if (!pleietrengendeId) return !IdentRules.erUgyldigIdent(søkerId);

        return !IdentRules.erUgyldigIdent(søkerId) && !IdentRules.erUgyldigIdent(pleietrengendeId);
    };

    public static harFnr11Siffrer = (ident?: any) => (typeof ident === 'string' ? /^\d{11}$/.test(ident) : false);
}
