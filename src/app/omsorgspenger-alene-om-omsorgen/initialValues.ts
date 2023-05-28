import { IOMPAOSoknad } from './types/OMPAOSoknad';

export const periodeInitialValue = {
    fom: '',
    tom: '',
};

export const fieldNames = {
    soeknadsperiode: 'soeknadsperiode',
    barn: 'barn',
    begrunnelseForInnsending: 'begrunnelseForInnsending',
    harInfoSomIkkeKanPunsjes: 'harInfoSomIkkeKanPunsjes',
    harMedisinskeOpplysninger: 'harMedisinskeOpplysninger',
    soeknadId: 'soeknadId',
    soekerId: 'soekerId',
    mottattDato: 'mottattDato',
    journalposter: 'journalposter',
};

export const initialValues = (soknad: Partial<IOMPAOSoknad> | undefined): IOMPAOSoknad => {
    if (!soknad?.journalposter?.length) {
        throw Error('Mangler journalpost');
    }
    return {
        metadata: {
            signatur: soknad?.metadata?.signatur || '',
        },
        barn: soknad?.barn || [],
        soeknadId: soknad?.soeknadId || '',
        soekerId: soknad?.soekerId || '',
        mottattDato: soknad?.mottattDato || '',
        journalposter: soknad?.journalposter,
        klokkeslett: soknad?.klokkeslett || '',
        harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
        harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
        soeknadsperiode: soknad?.soeknadsperiode || periodeInitialValue,
        begrunnelseForInnsending: soknad?.begrunnelseForInnsending || '',
    };
};
