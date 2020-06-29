import {IPeriode} from 'app/models/types/Periode';

export type Periodeinfo<T> = {
    periode?: IPeriode;
} & T;

export interface IPeriodeinfoExtension {
    [key: string]: any;
}

export interface IPeriodeinfo {
    periode?: IPeriode;
    [key: string]: any;
};