import { PunchStep } from 'app/models/enums';

export interface IPunchState {
    step: PunchStep;
    søkerId: string;
    pleietrengendeId: string | null;
}
