import {IQueryResponse} from "./QueryResponse";

export interface IMappe extends IQueryResponse {
    mappe_id: string;
    innsendinger?: string[];
    innhold?: IInnhold;
}

interface IInnhold {
    søker?: ISoker;
}

interface ISoker {
    fødselsnummer?: string;
}