import { IPeriode, Periode } from './Periode';
import { Periodeinfo } from './Periodeinfo';
import { berikMedKey } from 'app/utils/listeUtils';

export interface IUtenlandsOpphold {
    land?: string;

    innleggelsesperioder?: { periode?: IPeriode; årsak?: string | null }[];
}

export class UtenlandsOpphold implements Required<Periodeinfo<IUtenlandsOpphold>> {
    periode: Periode;

    land: string;

    innleggelsesperioder: { periode?: IPeriode; årsak?: string | null }[];

    key: string;

    constructor(periodeinfo: Periodeinfo<IUtenlandsOpphold>) {
        this.periode = new Periode(periodeinfo.periode || {});
        this.land = periodeinfo.land || '';
        this.innleggelsesperioder = periodeinfo.innleggelsesperioder || [];
        this.key = periodeinfo.key || berikMedKey([{}])[0].key;
    }

    values(): Required<Periodeinfo<IUtenlandsOpphold>> {
        return {
            periode: this.periode.values(),
            land: this.land,
            innleggelsesperioder: this.innleggelsesperioder,
            key: this.key,
        };
    }
}
