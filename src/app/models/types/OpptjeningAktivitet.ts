import { IArbeidstaker } from './Arbeidstaker';
import { IFrilanserOpptjening } from './FrilanserOpptjening';
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
