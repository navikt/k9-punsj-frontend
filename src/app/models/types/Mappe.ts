import {
    DobbelSoknad,
    SoknadFelles,
    SoknadIndividuelt
}                        from 'app/models/types/DobbelSoknad';
import {IInputError}     from 'app/models/types/InputError';
import {ISoknad, Soknad} from 'app/models/types/Soknad';

export interface IMappe {
    mappeId?: string;
    innsendinger?: string[];
    personer?: {[key: string]: IPersonlig};
    [key: string]: any;
}

export class Mappe implements IMappe {

    mappeId: string;
    personer: {[key: string]: Personlig};
    idents: string[];

    constructor(mappe: IMappe) {
        this.mappeId = mappe.mappeId || '';
        this.personer = {};
        this.idents = [];
        Object.keys(mappe.personer || [])
              .forEach(k => {
                  this.personer[k] = new Personlig(mappe.personer![k] || {});
                  this.idents.push(k);
              });
    }

    genererDobbelSoknad(): DobbelSoknad {

        if (this.idents.length) {

            const personlig1 = this.personer[this.idents[0]];
            const felles: SoknadFelles = personlig1.extractFelles();
            const soker1: SoknadIndividuelt = personlig1.extractIndividuelt();

            if (this.idents.length === 1) {
                return new DobbelSoknad(felles, soker1);
            } else {
                const soker2 = this.personer[this.idents[1]].extractIndividuelt();
                return new DobbelSoknad(felles, soker1, soker2);
            }

        } else {

            const tomPersonlig = new Personlig({});
            return new DobbelSoknad(tomPersonlig.extractFelles(), tomPersonlig.extractIndividuelt());
        }
    }
}

export interface IPersonlig {
    innsendinger?: string[];
    journalpostId?: string;
    soeknad?: ISoknad;
    mangler?: IInputError[];
    [key: string]: any;
}

export class Personlig implements Required<IPersonlig> {

    innsendinger: string[];
    journalpostId: string;
    soeknad: Soknad;
    mangler: IInputError[];

    constructor(personlig: IPersonlig) {
        this.innsendinger = personlig.innsendinger || [];
        this.journalpostId = personlig.journalpostId || '';
        this.soeknad = new Soknad(personlig.soeknad || {});
        this.mangler = (personlig.mangler || []).filter(m => !!m.attributt);
    }

    extractFellesMangler(): IInputError[] {
        const propertyRegexp = Object.getOwnPropertyNames(this.soeknad.extractFelles()).join('|');
        const regexp = new RegExp(`^(${propertyRegexp})(\\..+|\\[\\d].*|)\$`);
        return this.mangler.filter(m => regexp.test(m.attributt!));
    }

    extractIndividuelleMangler(): IInputError[] {
        const propertyRegexp = Object.getOwnPropertyNames(this.soeknad.extractIndividuelt()).join('|');
        const regexp = new RegExp(`^(${propertyRegexp})(\\..+|\\[\\d].*|)\$`);
        return this.mangler.filter(m => regexp.test(m.attributt!));
    }

    extractFelles(): SoknadFelles {
        return this.soeknad.extractFelles();
    }

    extractIndividuelt(): SoknadIndividuelt {
        return  this.soeknad.extractIndividuelt();
    }
}