import validator from '@navikt/fnrvalidator';

// eslint-disable-next-line import/prefer-default-export
export class IdentRules {
    public static erUgyldigIdent = (ident: string | null): boolean => {
        if (!ident || !ident.length) return true;

        const { status } = validator.idnr(ident);

        return status === 'invalid';
    };

    public static erAlleIdenterGyldige = (ident1: string, ident2: string | null): boolean => {
        if (!ident1) return false;
        if (!ident2) return !IdentRules.erUgyldigIdent(ident1);

        return !IdentRules.erUgyldigIdent(ident1) && !IdentRules.erUgyldigIdent(ident2);
    };

    public static harFnr11Siffrer = (ident?: any) => typeof ident === 'string' ? /^\d{11}$/.test(ident) : false
}
