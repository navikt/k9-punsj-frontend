export interface IOmsorg {
    relasjonTilBarnet?: string;
    beskrivelseAvOmsorgsrollen?: string;
    samtykketOmsorgForBarnet?: boolean;
}

export class Omsorg implements Required<IOmsorg> {
    relasjonTilBarnet: string;

    beskrivelseAvOmsorgsrollen: string;

    samtykketOmsorgForBarnet: boolean;

    constructor(omsorg: IOmsorg) {
        this.relasjonTilBarnet = omsorg.relasjonTilBarnet || '';
        this.beskrivelseAvOmsorgsrollen = omsorg.beskrivelseAvOmsorgsrollen || '';
        this.samtykketOmsorgForBarnet = omsorg.samtykketOmsorgForBarnet || false;
    }
}
