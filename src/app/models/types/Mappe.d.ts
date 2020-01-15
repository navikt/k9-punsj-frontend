import {IInputError} from 'app/models/types/InputError';
import {ISoknad}     from 'app/models/types/Soknad';

export interface IMappe {
    mappeId?: string;
    norsk_ident?: string;
    innsendinger?: string[];
    personer?: {
        [key: string]: {
            innsendinger?: string[];
            journalpostId?: string;
            soeknad?: ISoknad;
            mangler?: IInputError[];
            [key: string]: any;
        }
    };
    [key: string]: any;
}