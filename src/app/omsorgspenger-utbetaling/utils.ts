import { omit } from 'lodash';
import { aktivitetsFravær } from './konstanter';
import { IOMPUTSoknad, IOMPUTSoknadBackend } from './types/OMPUTSoknad';

export const frontendTilBackendMapping = (soknad: IOMPUTSoknad): IOMPUTSoknadBackend => {
    const { arbeidstaker, selvstendigNaeringsdrivende, frilanser } = soknad.opptjeningAktivitet;
    const fraevaersperioderSelvstendigNaeringsdrivende = selvstendigNaeringsdrivende.fravaersperioder;
    const fravaersperioderFrilanser = frilanser.fravaersperioder;
    const fravaersperioderArbeidstaker = arbeidstaker
        .map((at) =>
            at.fravaersperioder.map((fravaersperiode) => ({
                ...fravaersperiode,
                organisasjonsnummer: at.organisasjonsnummer || '',
            }))
        )
        .flat();

    const fravaersperioderMappet = [
        ...fraevaersperioderSelvstendigNaeringsdrivende,
        ...fravaersperioderFrilanser,
        ...fravaersperioderArbeidstaker,
    ];

    const opptjeningAktivitetUtenFravaersperioder = {
        arbeidstaker: arbeidstaker.map((at) => omit(at, ['fravaersperioder'])),
        frilanser: omit(frilanser, ['fravaersperioder']),
        selvstendigNaeringsdrivende: omit(selvstendigNaeringsdrivende, ['fravaersperioder']),
    };
    return {
        ...soknad,
        opptjeningAktivitet: opptjeningAktivitetUtenFravaersperioder,
        fravaersperioder: fravaersperioderMappet,
    };
};

export const backendTilFrontendMapping = (soknad: IOMPUTSoknadBackend): Partial<IOMPUTSoknad> => {
    if (soknad.opptjeningAktivitet === null) {
        return omit(soknad, 'fravaersperioder');
    }
    const fraevaersperioderSelvstendigNaeringsdrivende = soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE
    );
    const fravaersperioderFrilanser = soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.FRILANSER
    );
    const fravaersperioderArbeidstaker = soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.ARBEIDSTAKER
    );

    const arbeidstaker = soknad.opptjeningAktivitet?.arbeidstaker?.map((at) => ({
        ...at,
        fravaersperioder: fravaersperioderArbeidstaker.filter(
            (fravaersperiode) => fravaersperiode.organisasjonsnummer === at.organisasjonsnummer
        ),
    }));

    const selvstendigNaeringsdrivende = {
        ...soknad.opptjeningAktivitet.selvstendigNaeringsdrivende,
        fravaersperioder: fraevaersperioderSelvstendigNaeringsdrivende,
    };
    const frilanser = { ...soknad.opptjeningAktivitet.frilanser, fravaersperioder: fravaersperioderFrilanser };

    return {
        ...omit(soknad, 'fraevaersperioder'),
        opptjeningAktivitet: {
            selvstendigNaeringsdrivende,
            frilanser,
            arbeidstaker,
        },
    };
};
