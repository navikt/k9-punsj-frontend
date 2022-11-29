import { get, omit, pick } from 'lodash';
import { aktivitetsFravær } from './konstanter';
import { Arbeidstaker, IOLPSoknadBackend } from '../models/types/søknadTypes/OLPSoknad';

// eslint-disable-next-line import/prefer-default-export
export const backendTilFrontendMapping = (soknad: IOLPSoknadBackend): Partial<IOLPSoknadBackend> => {
    const fraevaersperioderSelvstendigNaeringsdrivende = soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE
    );
    const fravaersperioderFrilanser = soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.FRILANSER
    );
    const fravaersperioderArbeidstaker = soknad.fravaersperioder?.filter(
        (periode) => periode.aktivitetsFravær === aktivitetsFravær.ARBEIDSTAKER
    );

    const korrigeringArbeidstaker: Arbeidstaker[] = [];
    fravaersperioderArbeidstaker?.forEach((fravaersperiode) => {
        const index = korrigeringArbeidstaker.findIndex(
            (arbeidstaker: Arbeidstaker) => arbeidstaker.organisasjonsnummer === fravaersperiode.organisasjonsnummer
        );
        if (index !== -1) {
            korrigeringArbeidstaker[index].fravaersperioder.push(fravaersperiode);
        }

        korrigeringArbeidstaker.push({
            organisasjonsnummer: fravaersperiode.organisasjonsnummer,
            fravaersperioder: [fravaersperiode],
        });
    });

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
            )?.[0],
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
            : {
                  selvstendigNaeringsdrivende: { fravaersperioder: fraevaersperioderSelvstendigNaeringsdrivende },
                  frilanser: { fravaersperioder: fravaersperioderFrilanser },
                  arbeidstaker: korrigeringArbeidstaker,
              },
    };
};
