import React, { ReactNode } from 'react';
import { Sakstype } from './enums';

export interface ISakstypeDefault {
  navn: Sakstype;
}

export interface ISakstypeOmfordeling extends ISakstypeDefault {}

export interface ISakstypeComponentProps {
  journalpostid: string;
  punchPath: string;
}

interface IStepComponentProps {
  gåTilNesteSteg: (stegParams?: any) => void;
  gåTilForrigeSteg: (stegParams?: any) => void;
  sendInn: (values: any) => void;
  initialValues: any;
}

export interface ISakstypeStep {
  path: string;
  stepName: string;
  reducer?: (state: any, action: any) => any;
  stepOrder: number;
  getComponent: (stepProps: IStepComponentProps) => ReactNode;
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
