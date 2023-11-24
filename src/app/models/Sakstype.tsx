import { Sakstype } from './enums';

export interface ISakstypeDefault {
    navn: Sakstype;
}

export type ISakstypeOmfordeling = ISakstypeDefault;

export interface ISakstypeComponentProps {
    journalpostid: string;
}

export interface ISakstypePunch extends ISakstypeDefault {
    punchPath: string;
}

export interface ISakstyper {
    punchSakstyper: ISakstypePunch[];
    omfordelingssakstyper: ISakstypeOmfordeling[];
}
