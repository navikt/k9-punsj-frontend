import { PerDag } from './PerDag';
import { Periode } from '../Periode';
import { Periodeinfo } from './Periodeinfo';

export interface IUttak {
    periode?: Periode;
    etablertTilsynTimerPerDag?: string;
    timerPleieAvBarnetPerDag?: string;
    pleieAvBarnetPerDag?: PerDag;
}

export class Uttak implements Required<Periodeinfo<IUttak>> {
    periode: Periode;

    etablertTilsynTimerPerDag: string;

    timerPleieAvBarnetPerDag: string;

    pleieAvBarnetPerDag: PerDag;

    constructor(tilsynsordning: Periodeinfo<IUttak>) {
        this.periode = new Periode(tilsynsordning.periode || {});
        this.etablertTilsynTimerPerDag = tilsynsordning.etablertTilsynTimerPerDag || '';
        this.timerPleieAvBarnetPerDag = tilsynsordning.timerPleieAvBarnetPerDag || '';
        this.pleieAvBarnetPerDag = tilsynsordning.pleieAvBarnetPerDag || {};
    }
}
