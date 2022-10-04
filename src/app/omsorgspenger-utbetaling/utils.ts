import { get, omit, pick, set } from 'lodash';
import { aktivitetsFravær } from './konstanter';
import { IOMPUTSoknad, IOMPUTSoknadBackend } from './types/OMPUTSoknad';

export const frontendTilBackendMapping = (soknad: Partial<IOMPUTSoknad>): Partial<IOMPUTSoknadBackend> => {
    const frilanser = soknad?.opptjeningAktivitet?.frilanser;
    const selvstendigNaeringsdrivende = soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende;
    const arbeidstaker = soknad?.opptjeningAktivitet?.arbeidstaker;
    const fraevaersperioderSelvstendigNaeringsdrivende =
        soknad?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.fravaersperioder || [];
    const fravaersperioderFrilanser = frilanser?.fravaersperioder || [];
    const fravaersperioderArbeidstaker =
        arbeidstaker
            ?.map((at) =>
                at.fravaersperioder.map((fravaersperiode) => ({
                    ...fravaersperiode,
                    organisasjonsnummer: at.organisasjonsnummer || '',
                }))
            )
            ?.flat() || [];

    const fravaersperioderMappet = [
        ...fravaersperioderArbeidstaker,
        ...fraevaersperioderSelvstendigNaeringsdrivende,
        ...fravaersperioderFrilanser,
    ];
    const opptjeningAktivitetUtenFravaersperioder = {
        arbeidstaker: (arbeidstaker && arbeidstaker.map((at) => omit(at, ['fravaersperioder']))) || null,
        frilanser: frilanser && Object.keys(frilanser).length ? omit(frilanser, ['fravaersperioder']) : null,
        selvstendigNaeringsdrivende:
            selvstendigNaeringsdrivende && Object.keys(selvstendigNaeringsdrivende).length
                ? {
                      ...omit(selvstendigNaeringsdrivende, 'fravaersperioder'),
                      info: {
                          ...selvstendigNaeringsdrivende.info,
                          virksomhetstyper: selvstendigNaeringsdrivende.info.virksomhetstyper.length
                              ? [selvstendigNaeringsdrivende.info.virksomhetstyper]
                              : [],
                      },
                  }
                : null,
    };
    return {
        ...soknad,
        opptjeningAktivitet: opptjeningAktivitetUtenFravaersperioder,
        barn: soknad.barn?.map((barn) => ({ foedselsdato: barn.foedselsdato, norskIdent: barn.norskIdent })),
        fravaersperioder: fravaersperioderMappet,
    };
};

export const backendTilFrontendMapping = (soknad: IOMPUTSoknadBackend): Partial<IOMPUTSoknad> => {
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
        ...soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende,
        info: {
            ...soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info,
            virksomhetstyper: get(
                soknad,
                'opptjeningAktivitet.selvstendigNaeringsdrivende.info.virksomhetstyper',
                []
            )[0],
        },
        fravaersperioder: fraevaersperioderSelvstendigNaeringsdrivende,
    };
    const frilanser = { ...soknad.opptjeningAktivitet?.frilanser, fravaersperioder: fravaersperioderFrilanser };
    return {
        ...omit(soknad, 'fravaersperioder'),
        opptjeningAktivitet: soknad.opptjeningAktivitet
            ? {
                  selvstendigNaeringsdrivende,
                  frilanser,
                  arbeidstaker,
              }
            : undefined,
    };
};

export const filtrerVerdierFoerInnsending = (soknad: IOMPUTSoknad): Partial<IOMPUTSoknad> => {
    const { opptjeningAktivitet } = soknad;
    const { arbeidsforhold } = soknad.metadata;
    const filtrertOpptjeningAktivitet = pick(
        opptjeningAktivitet,
        Object.keys(arbeidsforhold).filter((key) => arbeidsforhold[key])
    );

    return { ...soknad, opptjeningAktivitet: filtrertOpptjeningAktivitet };
};

export const utenOpptjeningAktivitet = (soknad: Partial<IOMPUTSoknadBackend>): Partial<IOMPUTSoknadBackend> =>
    omit(soknad, 'opptjeningAktivitet');
