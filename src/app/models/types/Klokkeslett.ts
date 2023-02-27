export interface IKlokkeslett {
    hour?: number;
    minute?: number;
    second?: number;
    nano?: number;
}

export class Klokkeslett implements Required<IKlokkeslett> {
    hour: number;

    minute: number;

    second: number;

    nano: number;

    constructor(klokkeslett: IKlokkeslett) {
        this.hour = klokkeslett.hour || 0;
        this.minute = klokkeslett.minute || 0;
        this.second = klokkeslett.second || 0;
        this.nano = klokkeslett.nano || 0;
    }
}
