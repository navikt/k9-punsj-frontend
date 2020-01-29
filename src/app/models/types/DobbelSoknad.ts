import {IInputError}                                                        from 'app/models/types/InputError';
import {Locale}                                                             from 'app/models/types/Locale';
import {Periode}                                                            from 'app/models/types/Periode';
import {Arbeid, Barn, ISoknad, Soknad, Tilleggsinformasjon, Tilsynsordning} from 'app/models/types/Soknad';

export type ISoknadFelles = Pick<ISoknad, 'barn' | 'periode' | 'beredskap' | 'nattevaak' | 'tilsynsordning'>;
export type ISoknadIndividuelt = Pick<ISoknad, 'arbeid' | 'spraak'>;

interface IMangler {mangler?: IInputError[]}
export type ISoknadFellesMedMangler = ISoknadFelles & IMangler;
export type ISoknadIndividueltMedMangler = ISoknadIndividuelt & IMangler;
export type SoknadFellesMedMangler = SoknadFelles & IMangler;
export type SoknadIndividueltMedMangler = SoknadIndividuelt & IMangler;

export interface IDobbelSoknad {
    felles: ISoknadFellesMedMangler;
    soker1: ISoknadIndividueltMedMangler;
    soker2: ISoknadIndividueltMedMangler | null;
}

export class DobbelSoknad implements IDobbelSoknad {

    felles: SoknadFellesMedMangler;
    soker1: SoknadIndividueltMedMangler;
    soker2: SoknadIndividueltMedMangler | null;
    harToSokere: boolean;

    constructor(
        felles: SoknadFellesMedMangler,
        soker1: SoknadIndividueltMedMangler,
        soker2?: SoknadIndividueltMedMangler
    ) {
        this.felles = felles;
        this.soker1 = soker1;
        this.soker2 = soker2 || null;
        this.harToSokere = !!soker2;
    }

    soknad1(): Soknad {
        return new Soknad({...this.felles, ...this.soker1});
    }

    soknad2(): Soknad {
        return new Soknad({...this.felles, ...this.soker2});
    }

    soknad(nr: 1 | 2): Soknad {
        return nr === 1 ? this.soknad1() : this.soknad2();
    }
}

export class SoknadFelles implements Required<ISoknadFelles> {

    barn: Barn;
    periode: Periode;
    beredskap: Tilleggsinformasjon[];
    nattevaak: Tilleggsinformasjon[];
    tilsynsordning: Tilsynsordning;

    constructor(soknadFelles: ISoknadFellesMedMangler) {
        this.barn = new Barn(soknadFelles.barn || {});
        this.periode = new Periode(soknadFelles.periode || {});
        this.beredskap = (soknadFelles.beredskap || []).map(b => new Tilleggsinformasjon(b));
        this.nattevaak = (soknadFelles.nattevaak || []).map(n => new Tilleggsinformasjon(n));
        this.tilsynsordning = new Tilsynsordning(soknadFelles.tilsynsordning || {});
    }
}

export class SoknadIndividuelt implements Required<ISoknadIndividuelt> {

    spraak: Locale;
    arbeid: Arbeid;

    constructor(soknadIndividuelt: ISoknadIndividueltMedMangler) {
        this.arbeid = new Arbeid(soknadIndividuelt.arbeid || {});
        this.spraak = soknadIndividuelt.spraak || 'nb';
    }
}