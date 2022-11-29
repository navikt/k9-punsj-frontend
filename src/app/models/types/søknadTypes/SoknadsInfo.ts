export interface ISoknadsInfo {
    samtidigHjemme?: boolean | null;
    harMedsøker?: boolean | null;
}

export class SoknadsInfo implements ISoknadsInfo {
    samtidigHjemme: boolean | null;

    harMedsøker: boolean | null;

    constructor(s: ISoknadsInfo) {
        this.samtidigHjemme = s.samtidigHjemme || null;
        this.harMedsøker = s.harMedsøker || null;
    }
}
