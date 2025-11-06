import { berikMedKey } from 'app/utils/listeUtils';
import { Periode } from './Periode';

export interface Kursholder {
    institusjonsUuid?: string | null;
    holder: string;
}

export interface Kursperiode {
    periode: Periode;
    key: string;
}

export interface IKurs {
    kursHolder?: Kursholder | null;

    kursperioder?: Kursperiode[];

    reise?: Reise;
}

export interface Reise {
    reisedager: string[];
    reisedagerBeskrivelse: string;
}

export class Kurs implements Required<Omit<IKurs, 'reise'>> {
    kursHolder: Kursholder | null;

    kursperioder: Kursperiode[];

    reise: Reise;

    constructor(kurs: IKurs) {
        const kursperioder = kurs.kursperioder?.map((kursperiode) => ({
            periode: new Periode(kursperiode.periode),
            key: kursperiode.key,
        }));
        this.kursHolder = kurs.kursHolder || null;
        this.kursperioder = berikMedKey(kursperioder || []);
        this.reise = kurs.reise || { reisedager: [], reisedagerBeskrivelse: '' };
    }
}
