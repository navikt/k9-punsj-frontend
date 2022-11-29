import { IPeriode, Periode } from '../Periode';
import { Periodeinfo } from './Periodeinfo';

export interface IUtenlandsOpphold {
    land?: string;

    innleggelsesperioder?: { periode?: IPeriode; årsak?: string | null }[];
}

export class UtenlandsOpphold implements Required<Periodeinfo<IUtenlandsOpphold>> {
    periode: Periode;

    land: string;

    innleggelsesperioder: { periode?: IPeriode; årsak?: string | null }[];

    constructor(periodeinfo: Periodeinfo<IUtenlandsOpphold>) {
        this.periode = new Periode(periodeinfo.periode || {});
        this.land = periodeinfo.land || '';
        this.innleggelsesperioder = periodeinfo.innleggelsesperioder || [];
    }

    values(): Required<Periodeinfo<IUtenlandsOpphold>> {
        return {
            periode: this.periode.values(),
            land: this.land,
            innleggelsesperioder: this.innleggelsesperioder,
        };
    }
}
