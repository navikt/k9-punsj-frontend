import {PunchStep}             from "app/models/enums";
import {IFagsak, IJournalpost} from "app/models/types";
import {IError}                from "./Error";
import {IMappe}                from "./Mappe";

export interface IPunchState {
    step:                       PunchStep;
    ident:                      string;
    journalpost?:               IJournalpost;
    isJournalpostLoading?:      boolean;
    journalpostRequestError?:   IError;
    mapper:                     IMappe[];
    fagsaker:                   IFagsak[];
    isMapperLoading?:           boolean;
    isFagsakerLoading?:         boolean;
    mapperRequestError?:        IError;
    fagsakerRequestError?:      IError;
    chosenMappe?:               IMappe;
    chosenFagsak?:              IFagsak;
    mappeid?:                   string;
    isAwaitingMappeCreation?:   boolean;
    createMappeRequestError?:   IError;
}