import React, {ReactNode} from 'react';
import {Sakstype}         from './enums';

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
    stepOrder: number;
    getComponent: (props: any) => ReactNode
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
