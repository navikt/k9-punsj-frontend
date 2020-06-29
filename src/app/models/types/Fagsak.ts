import {IPerson} from "app/models/types";

export interface IFagsak {
    fagsak_id: string;
    url?: string;
    fra_og_med?: string;
    til_og_med?: string;
    barn?: IPerson;
}