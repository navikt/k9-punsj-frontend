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
    soknad2: Soknad;

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
        this.soknad2 = new Soknad({...this.felles, ...this.soker2});
    }

    soknad(nr: 1 | 2): Soknad {
        return nr === 1 ? this.soknad1 : this.soknad2;
    }

    getFom(): string | null {
        return [this.soknad1.getFom(), this.soknad2.getFom()].sort()[0];
    }

    getTom(): string | null {
        return [this.soknad1.getTom(), this.soknad2.getTom()].sort()[1];
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