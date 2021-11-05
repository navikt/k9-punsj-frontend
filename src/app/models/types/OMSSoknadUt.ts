import { KorrigeringAvInntektsmeldingFormValues } from 'app/containers/omsorgspenger/korrigeringAvInntektsmelding/KorrigeringAvInntektsmeldingFormFieldsValues';
import { IPeriode } from './Periode';

export interface Fravaersperioder {
    periode: IPeriode;
    faktiskTidPrDag: null | string;
}

const lagFraværsperioder = (values: KorrigeringAvInntektsmeldingFormValues) => {
    const fraværsperioder: Fravaersperioder[] = [];

    if (values.Trekkperioder.length > 0 && values.Trekkperioder[0].fom) {
        values.Trekkperioder.forEach((trekkperiode) => {
            fraværsperioder.push({
                periode: trekkperiode,
                faktiskTidPrDag: '0',
            });
        });
    }
    if (values.PerioderMedRefusjonskrav.length > 0 && values.PerioderMedRefusjonskrav[0].fom) {
        values.PerioderMedRefusjonskrav.forEach((periodeMedRefusjonskrav) => {
            fraværsperioder.push({
                periode: periodeMedRefusjonskrav,
                faktiskTidPrDag: null,
            });
        });
    }
    if (values.DagerMedDelvisFravær.length > 0 && values.DagerMedDelvisFravær[0].dato) {
        values.DagerMedDelvisFravær.forEach((dagMedDelvisFravær) => {
            if (dagMedDelvisFravær.dato || dagMedDelvisFravær.timer) {
                fraværsperioder.push({
                    periode: { fom: dagMedDelvisFravær.dato, tom: dagMedDelvisFravær.dato },
                    faktiskTidPrDag: dagMedDelvisFravær.timer,
                });
            }
        });
    }

    return fraværsperioder;
};

const trimString = (string: string) => string.replace(/\s+/g, '');

export class OMSSoknadUt {
    mottattDato: string;

    klokkeslett: string;

    soeknadId: string;

    soekerId: string;

    journalposter: string[];

    organisasjonsnummer: string;

    arbeidsforholdId: string | null;

    fravaersperioder: Fravaersperioder[];

    constructor(
        values: KorrigeringAvInntektsmeldingFormValues,
        søknadId: string,
        søkerId: string,
        journalposter: string[]
    ) {
        this.mottattDato = values.OpplysningerOmSøknaden.dato;
        this.klokkeslett = values.OpplysningerOmSøknaden.klokkeslett;
        this.soeknadId = søknadId;
        this.soekerId = søkerId;
        this.journalposter = journalposter;
        this.organisasjonsnummer = values.Virksomhet;
        this.arbeidsforholdId = values.ArbeidsforholdId ? trimString(values.ArbeidsforholdId) : null;
        this.fravaersperioder = lagFraværsperioder(values);
    }
}
