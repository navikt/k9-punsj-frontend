import { SoknaderVisningStep } from '../enums/SoknaderVisningStep';

export interface ISoknaderVisningState {
    step: SoknaderVisningStep;
    ident: string;
}
