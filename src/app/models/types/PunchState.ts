import { PunchStep } from 'app/models/enums';

export interface IPleiepengerPunchState {
  step: PunchStep;
  ident1: string;
  ident2: string | null;
}
