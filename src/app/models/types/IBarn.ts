export interface IBarn {
    norskIdent?: string;
    foedselsdato?: string;
}

export class Barn implements Required<IBarn> {
    norskIdent: string;

    foedselsdato: string;

    constructor(barn: IBarn) {
        this.norskIdent = barn.norskIdent || '';
        this.foedselsdato = barn.foedselsdato || '';
    }

    values(): Required<IBarn> {
        const { norskIdent, foedselsdato } = this; // tslint:disable-line:no-this-assignment
        return { norskIdent, foedselsdato };
    }
}
