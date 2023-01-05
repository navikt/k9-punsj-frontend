import { ISelvstendigNaerinsdrivende, SelvstendigNaerinsdrivende } from 'app/models/types/SelvstendigNaerinsdrivende';

export interface ISelvstendigNaeringsdrivendeOpptjening {
    virksomhetNavn?: string | null;
    organisasjonsnummer?: string | null;
    info?: ISelvstendigNaerinsdrivende | null;
}

export class SelvstendigNaeringsdrivendeOpptjening implements Required<ISelvstendigNaeringsdrivendeOpptjening> {
    virksomhetNavn: string;

    organisasjonsnummer: string;

    info: SelvstendigNaerinsdrivende | null;

    constructor(s: ISelvstendigNaeringsdrivendeOpptjening) {
        this.virksomhetNavn = s.virksomhetNavn || '';
        this.organisasjonsnummer = s.organisasjonsnummer || '';
        this.info = s.info ? new SelvstendigNaerinsdrivende(s.info) : null;
    }
}
