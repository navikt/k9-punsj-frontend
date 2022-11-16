import { InputTime } from './types/InputTime';

export type KalenderDag = {
    date: Date;
    tid?: Partial<InputTime>;
    tidOpprinnelig?: Partial<InputTime>;
};
