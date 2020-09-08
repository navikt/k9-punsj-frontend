import React, { ReactNode } from 'react';
import { Sakstype } from './enums';

export interface ISakstypeDefault {
  navn: Sakstype;
}

export interface ISakstypeOmfordeling extends ISakstypeDefault {}

export interface ISakstypeComponentProps {
  journalpostid: string;
}

export interface ISakstypeStep {
  path: string;
  stepName: string;
  reducer?: (state: any, action: any) => any;
  stepOrder: number;
  getComponent: (gåTilNesteSteg: (stegParams?: any) => void) => ReactNode;
}

export interface ISakstypePunch extends ISakstypeDefault {
  punchPath: string;
  getComponent?: (props: ISakstypeComponentProps) => ReactNode;
  steps: ISakstypeStep[];
}

export interface ISakstyper {
  punchSakstyper: ISakstypePunch[];
  omfordelingssakstyper: ISakstypeOmfordeling[];
}
