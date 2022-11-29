export interface Kursholder {
    holder: string;
    institusjonsidentifikator: string;
}

export interface Kursperioder {
    periode: string;
    avreise: string;
    hjemkomst: string;
}

export interface IKurs {
    kursholder?: Kursholder | null;
    formål?: string;
    kursperioder?: Kursperioder[];
}

export class Kurs implements Required<IKurs> {
    kursholder: Kursholder | null;

    formål: string;

    kursperioder: Kursperioder[];

    constructor(kurs: IKurs) {
        this.kursholder = kurs.kursholder || null;
        this.formål = kurs.formål || '';
        this.kursperioder = kurs.kursperioder || [];
    }
}
