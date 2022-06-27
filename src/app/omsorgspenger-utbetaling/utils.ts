import { omit } from 'lodash';
import { IOMPUTSoknad } from './types/OMPUTSoknad';

export const frontendTilBackendMapping = (soknad: IOMPUTSoknad) => {
    
    const soknadUtenFravaersperioder = omit(soknad, ['fravaersperioder']);
    const fraevaersperioderSelvstendigNaeringsdrivende =
        soknad.opptjeningAktivitet.selvstendigNaeringsdrivende.fravaersperioder;
    const fravaersperioderFrilanser = soknad.opptjeningAktivitet.frilanser.fravaersperioder;
    const fravaersperioderArbeidstaker = soknad.opptjeningAktivitet.arbeidstaker.map((arbeidstaker) =>
        arbeidstaker.fravaersperioder.map((fravaersperiode) => ({
            ...fravaersperiode,
            organsisasjonsnummer: arbeidstaker.organisasjonsnummer || '',
        }))
    );

    const fravaersperioder = [
        ...fraevaersperioderSelvstendigNaeringsdrivende,
        ...fravaersperioderFrilanser,
        ...fravaersperioderArbeidstaker,
    ];

    return { ...soknadUtenFravaersperioder, fravaersperioder };
};

export const backendTilFrontendMapping = (soknad: IOMPUTSoknad) => {
    throw Error('Implementer meg');
};
