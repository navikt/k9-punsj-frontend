import { PunchStep } from 'app/models/enums';
import { IPath } from 'app/models/types';

export interface IPunchPath extends IPath {
    step: PunchStep;
}
