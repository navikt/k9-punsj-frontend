import { Arbeidstaker, IArbeidstaker } from './Arbeidstaker';
import { FrilanserOpptjening, IFrilanserOpptjening } from './FrilanserOpptjening';
import { SelvstendigNaeringsdrivendeOpptjening } from './SelvstendigNaeringsdrivendeOpptjening';
import { ISelvstendigNaerinsdrivende } from './SelvstendigNaerinsdrivende';

export interface IOpptjeningAktivitet {
    selvstendigNaeringsdrivende?: ISelvstendigNaeringsdrivendeOpptjening | null;
    frilanser?: IFrilanserOpptjening | null;
    arbeidstaker?: IArbeidstaker[];
}

export interface ISelvstendigNaeringsdrivendeOpptjening {
    virksomhetNavn?: string | null;
    organisasjonsnummer?: string | null;
    info?: ISelvstendigNaerinsdrivende | null;
}

export class OpptjeningAktivitet implements IOpptjeningAktivitet {
    selvstendigNaeringsdrivende: SelvstendigNaeringsdrivendeOpptjening | null;

    frilanser: FrilanserOpptjening | null;

    arbeidstaker: Arbeidstaker[];

    constructor(arbeid: IOpptjeningAktivitet) {
        this.arbeidstaker = (arbeid.arbeidstaker || []).map((at) => new Arbeidstaker(at));
        this.selvstendigNaeringsdrivende = arbeid.selvstendigNaeringsdrivende
            ? new SelvstendigNaeringsdrivendeOpptjening(arbeid.selvstendigNaeringsdrivende)
            : null;
        this.frilanser = arbeid.frilanser ? new FrilanserOpptjening(arbeid.frilanser) : null;
    }
}
