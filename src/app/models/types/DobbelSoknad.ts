import {IInputError} from 'app/models/types/InputError';
import {Soknad}      from 'app/models/types/Soknad';

export type SoknadFelles = Pick<Soknad, 'barn' | 'periode' | 'beredskap' | 'nattevaak' | 'tilsynsordning'>;
export type SoknadIndividuelt = Pick<Soknad, 'arbeid' | 'spraak'>;

interface IMangler {mangler?: IInputError[]}
export type SoknadFellesMedMangler = SoknadFelles & IMangler;
export type SoknadIndividueltMedMangler = SoknadIndividuelt & IMangler;

export class DobbelSoknad {

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
}