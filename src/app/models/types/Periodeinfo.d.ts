import {IPeriode} from './Periode';

export type Periodeinfo<T> = {
    periode?: IPeriode;
} & T;

export interface PeriodeinfoExtension {
    [key: string]: any;
}

export interface IPeriodeinfo {
    periode?: IPeriode;
    [key: string]: any;
};