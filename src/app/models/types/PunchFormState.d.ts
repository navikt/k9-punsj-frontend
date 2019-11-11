import {JaNeiVetikke} from "app/models/enums";
import {ISoknad} from "./Soknad";

export interface IPunchFormState {
    tilsyn?: JaNeiVetikke;
    soknad: ISoknad;
}