import { ReactNode } from 'react';

import { ApiPath } from '../apiConfig';
import { Sakstype } from './enums';

export interface ISakstypeDefault {
    navn: Sakstype;
}

export type ISakstypeOmfordeling = ISakstypeDefault;

export interface ISakstypeComponentProps {
    journalpostid: string;
}

interface IStepComponentProps {
    gåTilNesteSteg: (stegParams?: any) => void;
    gåTilForrigeSteg: (stegParams?: any) => void;
    initialValues: any;
}

export interface ISakstypeStep {
    path: string;
    stepName: string;
    stepOrder: number;
    getComponent: (stepProps: IStepComponentProps) => ReactNode;
}

export interface ISakstypePunch extends ISakstypeDefault {
    punchPath: string;
    apiUrl?: ApiPath;
    getComponent: (props: ISakstypeComponentProps) => ReactNode;
    steps: ISakstypeStep[];
}

export interface ISakstyper {
    punchSakstyper: ISakstypePunch[];
    omfordelingssakstyper: ISakstypeOmfordeling[];
}
