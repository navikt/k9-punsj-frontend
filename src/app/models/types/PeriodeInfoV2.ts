import {IPeriode} from 'app/models/types/Periode';
import {IPeriodeV2} from "./PeriodeV2";

export type PeriodeinfoV2<T> = {
    periode?: IPeriodeV2;
} & T;

export interface IPeriodeinfoExtensionV2 {
    [key: string]: any;
}

export interface IPeriodeinfoV2 {
    periode?: IPeriodeV2;
    [key: string]: any;
};
