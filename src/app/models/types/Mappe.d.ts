import {IQueryResponse} from "./QueryResponse";
import {ISoknad} from "./Soknad";

export interface IMappe extends Partial<IQueryResponse> {
    mappe_id: string;
    norsk_ident?: string;
    innsendinger?: string[];
    personlig?: {
        [key: string]: {
            innsendinger: string[],
            innhold: ISoknad,
            mangler: {
                attributt: string,
                melding: string
            }[]
        };
    };
}