import { IPeriode } from './Periode';

export type Periodeinfo<T> = {
    periode?: IPeriode;
    key?: string;
} & T;

export interface IPeriodeinfoExtension {
    [key: string]: any;
}

export interface IPeriodeinfo {
    periode?: IPeriode;
    key?: string;
    [key: string]: any;
}
