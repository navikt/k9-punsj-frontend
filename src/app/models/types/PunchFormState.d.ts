import {JaNeiVetikke} from "app/models/enums";
import {IError}       from 'app/models/types/Error';
import {ISoknad}      from "./Soknad";

export interface IPunchFormState {
    mappe?: IMappe;
    isMappeLoading: boolean;
    error?: IError;
    //tilsyn?: JaNeiVetikke;
}