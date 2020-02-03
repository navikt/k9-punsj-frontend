export class IdentRules {

    public static REGEX_FNR = /^((((0[1-9]|[12]\d|30)(0[469]|11)|(0[1-9]|[12]\d|3[01])(0[13578]|1[02])|((0[1-9]|1\d|2[0-8])02))\d{2})|2902([02468][048]|[13579][26]))\d{5}$/;
    public static REGEX_DNR = /^((((4[1-9]|[56]\d|70)(0[469]|11)|(4[1-9]|[56]\d|7[01])(0[13578]|1[02])|((4[1-9]|5\d|6[0-8])02))\d{2})|6902([02468][048]|[13579][26]))\d{5}$/;

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

    public static areIdentsValid(ident1?: any, ident2?: any): boolean {
        if (typeof ident1 === 'string') {
            if (typeof ident2 === 'string' && ident2 !== '') {
                return this.isIdentValid(ident1) && this.isIdentValid(ident2);
            } else if (!ident2) {
                return this.isIdentValid(ident1);
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

        const result = 11 - ((3 * d(0) +
                              7 * d(1) +
                              6 * d(2) +
                              d(3) +
                              8 * d(4) +
                              9 * d(5) +
                              4 * d(6) +
                              5 * d(7) +
                              2 * d(8)) % 11);

        switch (result) {
            case 11: return 0;
            case 10: return null;
            default: return result;
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

        const result = 11 - ((5 * d(0) +
                              4 * d(1) +
                              3 * d(2) +
                              2 * d(3) +
                              7 * d(4) +
                              6 * d(5) +
                              5 * d(6) +
                              4 * d(7) +
                              3 * d(8) +
                              2 * this.controlDigit1(ident)!) % 11);

        switch (result) {
            case 11: return 0;
            case 10: return null;
            default: return result;
        }
    }

    public static isControlDigit2Valid(ident: string): boolean {
        if (!this.hasIdent11Digits(ident)) {
            return false;
        }
        return Number(ident.charAt(10)) === this.controlDigit2(ident);
    }
}