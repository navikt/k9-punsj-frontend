import { IOMPUTSoknad } from './types/OMPUTSoknad';

export const fravaersperiodeInitialValue = {
    aktivtetsFravær: '',
    organisasjonsnummer: '',
    fraværÅrsak: '',
    søknadÅrsak: '',
    periode: {
        fom: '',
        tom: '',
    },
    faktiskTidPrDag: '',
};

export const initialValues = (soknad: Partial<IOMPUTSoknad> | undefined) => ({
    barn: soknad?.barn || [],
    soeknadId: soknad?.soeknadId || '',
    soekerId: soknad?.soekerId || '',
    mottattDato: soknad?.mottattDato || '',
    journalposter: soknad?.journalposter || new Set([]),
    klokkeslett: soknad?.klokkeslett || '',
    skjematype: '',
    fravaersperioder: [
        {
            ...fravaersperiodeInitialValue,
        },
    ],
    opptjeningAktivitet: {
        arbeidstaker: [],
    },
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});
