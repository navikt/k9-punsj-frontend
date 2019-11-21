import {IQueryResponse} from "./QueryResponse";
import {ISoknad} from "./Soknad";

export interface IMappe extends IQueryResponse {
    mappe_id: string;
    innsendinger?: string[];
    innhold: ISoknad;
}