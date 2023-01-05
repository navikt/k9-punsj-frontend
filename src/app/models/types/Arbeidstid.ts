import { Arbeidstaker, IArbeidstaker } from './Arbeidstaker';
import { ArbeidstidInfo, IArbeidstidInfo } from './ArbeidstidInfo';

export interface IArbeidstid {
    arbeidstakerList?: IArbeidstaker[];
    frilanserArbeidstidInfo?: IArbeidstidInfo | null;
    selvstendigNæringsdrivendeArbeidstidInfo?: IArbeidstidInfo | null;
}
export class Arbeidstid implements Required<IArbeidstid> {
    arbeidstakerList: Arbeidstaker[];

    frilanserArbeidstidInfo: ArbeidstidInfo | null;

    selvstendigNæringsdrivendeArbeidstidInfo: ArbeidstidInfo | null;

    constructor(a: IArbeidstid) {
        this.arbeidstakerList = a.arbeidstakerList ? a.arbeidstakerList.map((ab) => new Arbeidstaker(ab)) : [];
        this.frilanserArbeidstidInfo = a.frilanserArbeidstidInfo ? new ArbeidstidInfo(a.frilanserArbeidstidInfo) : null;
        this.selvstendigNæringsdrivendeArbeidstidInfo = a.selvstendigNæringsdrivendeArbeidstidInfo
            ? new ArbeidstidInfo(a.selvstendigNæringsdrivendeArbeidstidInfo)
            : null;
    }
}
