import {IPeriodeinfo, PeriodeinfoExtension} from 'app/models/types/Periodeinfo';

export interface ITilsyn implements PeriodeinfoExtension {
    mandag?:    string | null;
    tirsdag?:   string | null;
    onsdag?:    string | null;
    torsdag?:   string | null;
    fredag?:    string | null;
}