import { PunchStep } from 'app/models/enums';

export interface IPunchState {
    step: PunchStep;
    ident1: string;
    ident2: string | null;
}
