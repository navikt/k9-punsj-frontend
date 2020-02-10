import {Locale}                                                             from 'app/models/types/Locale';
import {Periode}                                                            from 'app/models/types/Periode';
import {Arbeid, Barn, ISoknad, Soknad, Tilleggsinformasjon, Tilsynsordning} from 'app/models/types/Soknad';

export type ISoknadFelles = Pick<ISoknad, 'spraak' | 'barn' | 'beredskap' | 'nattevaak' | 'tilsynsordning'>;
export type ISoknadIndividuelt = Pick<ISoknad, 'arbeid' | 'perioder'>;

export interface IDobbelSoknad {
    felles: ISoknadFelles;
    soker1: ISoknadIndividuelt;
    soker2: ISoknadIndividuelt | null;
}

export class DobbelSoknad implements IDobbelSoknad {

    felles: SoknadFelles;
    soker1: SoknadIndividuelt;
    soker2: SoknadIndividuelt | null;
    harToSokere: boolean;
    soknad1: Soknad;
    soknad2: Soknad | null;

    constructor(
        felles: SoknadFelles,
        soker1: SoknadIndividuelt,
        soker2?: SoknadIndividuelt
    ) {
        this.felles = felles;
        this.soker1 = soker1;
        this.soker2 = soker2 || null;
        this.harToSokere = !!soker2;
        this.soknad1 = new Soknad({...this.felles, ...this.soker1});
        this.soknad2 = this.harToSokere ? new Soknad({...this.felles, ...this.soker2}) : null;
    }

    soknad(nr: 1 | 2): Soknad | null {
        return nr === 1 ? this.soknad1 : this.soknad2;
    }

    getFom(): string | null {
        const fom1 = this.soknad1.getFom();
        const fom2 = this.harToSokere && this.soknad2!.getFom();
        return fom1 && fom2 ? [fom1, fom2].sort()[0] : fom1;
    }

    getTom(): string | null {
        const tom1 = this.soknad1.getTom();
        const tom2 = this.harToSokere && this.soknad2!.getTom();
        return tom1 && tom2 ? [tom1, tom2].sort()[1] : tom1;
    }
}

export class SoknadFelles implements Required<ISoknadFelles> {

    spraak: Locale;
    barn: Barn;
    beredskap: Tilleggsinformasjon[];
    nattevaak: Tilleggsinformasjon[];
    tilsynsordning: Tilsynsordning;

    constructor(soknadFelles: ISoknadFelles) {
        this.spraak = soknadFelles.spraak || 'nb';
        this.barn = new Barn(soknadFelles.barn || {});
        this.beredskap = (soknadFelles.beredskap || []).map(b => new Tilleggsinformasjon(b));
        this.nattevaak = (soknadFelles.nattevaak || []).map(n => new Tilleggsinformasjon(n));
        this.tilsynsordning = new Tilsynsordning(soknadFelles.tilsynsordning || {});
    }
}

export class SoknadIndividuelt implements Required<ISoknadIndividuelt> {

    perioder: Periode[];
    arbeid: Arbeid;

    constructor(soknadIndividuelt: ISoknadIndividuelt) {
        this.perioder = (soknadIndividuelt.perioder || []).map(p => new Periode(p));
        this.arbeid = new Arbeid(soknadIndividuelt.arbeid || {});
    }
}