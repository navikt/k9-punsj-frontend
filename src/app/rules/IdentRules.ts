export class IdentRules {

    public static isIdentValid(ident?: any): boolean {
        return typeof ident === 'string' ? /^\d{11}$/.test(ident) : false;
    }

    public static areIdentsValid(ident1?: any, ident2?: any): boolean {
        if (typeof ident1 === 'string') {
            if (typeof ident2 === 'string') {
                return this.isIdentValid(ident1) && this.isIdentValid(ident2);
            } else if (ident2 === null || ident2 === undefined) {
                return this.isIdentValid(ident1);
            }
            return false;
        }
        return false;
    }
}