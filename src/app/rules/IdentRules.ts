// eslint-disable-next-line import/prefer-default-export
import validator from "@navikt/fnrvalidator";

export class IdentRules {

    public static REGEX_FNR =
        /^((((0[1-9]|[12]\d|30)(0[469]|11)|(0[1-9]|[12]\d|3[01])(0[13578]|1[02])|((0[1-9]|1\d|2[0-8])02))\d{2})|2902([02468][048]|[13579][26]))\d{5}$/;

    public static REGEX_DNR =
        /^((((4[1-9]|[56]\d|70)(0[469]|11)|(4[1-9]|[56]\d|7[01])(0[13578]|1[02])|((4[1-9]|5\d|6[0-8])02))\d{2})|6902([02468][048]|[13579][26]))\d{5}$/;

    public static CONTROL_KEY_1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];

    public static CONTROL_KEY_2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    public static erUgyldigIdent = (ident: string | null): boolean => {
        if (!ident || !ident.length) return true;

        const { status } = validator.idnr(ident);

        return status === 'invalid';
    };

    // string array eller null array
    public static erAlleIdenterGyldige = (ident1: string, ident2?: string, annenSokerIdent?: string): boolean => {
        if (ident1) {
            if (ident2) {
                return !IdentRules.erUgyldigIdent(ident1) && !IdentRules.erUgyldigIdent(ident2);
            } 
            return !IdentRules.erUgyldigIdent(ident1);
            

            if (!annenSokerIdent) {
                return !IdentRules.erUgyldigIdent(annenSokerIdent)
            }
            return false;
        }
        return false;
    };

    public static hasIdent11Digits(ident?: any) {
        return typeof ident === 'string' ? /^\d{11}$/.test(ident) : false;
    }

    public static isIdentValid(ident: string): boolean {
        return this.isIdentFormatValid(ident) && this.areControlDigitsValid(ident);
    }

    public static isIdentFormatValid(ident: string) {
        return this.REGEX_FNR.test(ident) || this.REGEX_DNR.test(ident);
    }

    public static areControlDigitsValid(ident: string) {
        return this.isControlDigit1Valid(ident) && this.isControlDigit2Valid(ident);
    }

    public static areIdentsValid(ident1?: any, ident2?: any, annenSokerIdent?: any): boolean {
        if (typeof ident1 === 'string') {
            if (typeof ident2 === 'string' && ident2 !== '') {
                return this.isIdentValid(ident1) && this.isIdentValid(ident2);
            }
            if (!ident2) {
                return this.isIdentValid(ident1);
            }
            if (typeof annenSokerIdent === 'string' && annenSokerIdent !== '') {
                return this.isIdentValid(annenSokerIdent);
            }
            return false;
        }
        return false;
    }

    public static controlDigit1(ident: string): number | null {
        if (!this.hasIdent11Digits(ident)) {
            return null;
        }

        const d = (index: number) => Number(ident!.charAt(index));
        const result = 11 - (this.CONTROL_KEY_1.reduce((s, f, i) => s + f * d(i), 0) % 11);

        switch (result) {
            case 11:
                return 0;
            case 10:
                return null;
            default:
                return result;
        }
    }

    public static isControlDigit1Valid(ident: string): boolean {
        if (!this.hasIdent11Digits(ident)) {
            return false;
        }
        return Number(ident.charAt(9)) === this.controlDigit1(ident);
    }

    public static controlDigit2(ident: string): number | null {
        if (!this.hasIdent11Digits(ident)) {
            return null;
        }

        const d = (index: number) => Number(ident!.charAt(index));
        const result = 11 - (this.CONTROL_KEY_2.reduce((s, f, i) => s + f * d(i), 0) % 11);

        switch (result) {
            case 11:
                return 0;
            case 10:
                return null;
            default:
                return result;
        }
    }

    public static isControlDigit2Valid(ident: string): boolean {
        if (!this.hasIdent11Digits(ident)) {
            return false;
        }
        return Number(ident.charAt(10)) === this.controlDigit2(ident);
    }
}
