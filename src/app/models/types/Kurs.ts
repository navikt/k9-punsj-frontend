import { Periode } from './Periode';

export interface Kursholder {
    institusjonsUuid?: string;
    holder: string;
}

export interface Kursperiode {
    periode: Periode;
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
        this.kursHolder = kurs.kursHolder || null;
        this.kursperioder = kurs.kursperioder || [];
        this.reise = kurs.reise || { reisedager: [], reisedagerBeskrivelse: '' };
    }
}
