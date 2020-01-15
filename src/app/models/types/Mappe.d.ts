import {IInputError} from 'app/models/types/InputError';
import {ISoknad}     from 'app/models/types/Soknad';

export interface IMappe {
    mappe_id?: string;
    norsk_ident?: string;
    innsendinger?: string[];
    personlig?: {
        [key: string]: {
            innsendinger?: string[],
            journalpost_id?: string,
            innhold?: ISoknad,
            mangler?: IInputError[]
            [key: string]: any;
        }
    };
    [key: string]: any;
}