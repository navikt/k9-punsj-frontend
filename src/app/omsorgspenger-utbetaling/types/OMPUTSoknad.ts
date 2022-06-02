import { Periode, PersonEnkel } from 'app/models/types';
import { IOpptjeningAktivitet } from 'app/models/types/OpptjeningAktivitet';
import { SoeknadType } from '../../models/forms/soeknader/SoeknadType';

export enum aktivitetsFravær {
    AT = 'ARBEIDSTAKER',
    SN = 'SELVSTENDIG_NÆRINGSDRIVENDE',
    FL = 'FRILANSER',
}
type Fravaersperiode = {
    aktivitetsFravær: aktivitetsFravær;
    organisasjonsnummer: string;
    fraværÅrsak: string;
    søknadÅrsak: string;
    periode: Periode;
    faktiskTidPrDag: string;
};

export interface IOMPUTSoknad extends SoeknadType {
    skjematype: string;
    fravaersperioder: Fravaersperiode[];
    faktiskTidPrDag: string;
    opptjeningAktivitet: IOpptjeningAktivitet;
    barn: PersonEnkel[];
}
