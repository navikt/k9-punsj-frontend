import {IPeriodeinfo} from 'app/models/types/Periodeinfo';

export interface ITilsyn extends IPeriodeinfo {
    mandag?:    string | null;
    tirsdag?:   string | null;
    onsdag?:    string | null;
    torsdag?:   string | null;
    fredag?:    string | null;
}