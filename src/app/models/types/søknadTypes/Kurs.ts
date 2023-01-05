import { Periode } from '../Periode';

export interface Kursholder {
    institusjonsUuid: string;
}

export interface Kursperiode {
    periode: Periode;
    avreise: string;
    hjemkomst: string;
}

export interface IKurs {
    kursHolder?: Kursholder | null;

    kursperioder?: Kursperiode[];
}

export class Kurs implements Required<IKurs> {
    kursHolder: Kursholder | null;

    kursperioder: Kursperiode[];

    constructor(kurs: IKurs) {
        this.kursHolder = kurs.kursHolder || null;
        this.kursperioder = kurs.kursperioder || [];
    }
}
