import { KorrigeringAvInntektsmeldingFormValues } from 'app/containers/omsorgspenger/korrigeringAvInntektsmelding/KorrigeringAvInntektsmeldingFormFieldsValues';
import { IPeriode } from './Periode';

export interface Fravaersperioder {
    periode: IPeriode[];
    faktiskTidPrDag: null | string;
}

const lagFraværsperioder = (values: KorrigeringAvInntektsmeldingFormValues) => {
    const fraværsperioder: Fravaersperioder[] = [];

    if (values.Trekkperioder.length > 0 && values.Trekkperioder[0].fom) {
        fraværsperioder.push({
            periode: values.Trekkperioder,
            faktiskTidPrDag: '0',
        });
    }
    if (values.PerioderMedRefusjonskrav.length > 0 && values.PerioderMedRefusjonskrav[0].fom) {
        fraværsperioder.push({
            periode: values.PerioderMedRefusjonskrav,
            faktiskTidPrDag: null,
        });
    }
    if (values.DagerMedDelvisFravær.length > 0 && values.DagerMedDelvisFravær[0].dato) {
        values.DagerMedDelvisFravær.forEach((dagMedDelvisFravær) => {
            fraværsperioder.push({
                periode: [{ fom: dagMedDelvisFravær.dato, tom: dagMedDelvisFravær.dato }],
                faktiskTidPrDag: dagMedDelvisFravær.timer,
            });
        });
    }

    return fraværsperioder;
};

export class OMSSoknadUt {
    soeknadId: string;

    soekerId: string;

    journalposter: string[];

    organisasjonsnummer: string;

    arbeidsforholdId: string;

    fravaersperioder: Fravaersperioder[];

    constructor(
        values: KorrigeringAvInntektsmeldingFormValues,
        søknadId: string,
        søkerId: string,
        journalposter: string[]
    ) {
        this.soeknadId = søknadId;
        this.soekerId = søkerId;
        this.journalposter = journalposter;
        this.organisasjonsnummer = values.Virksomhet;
        this.arbeidsforholdId = values.ArbeidsforholdId;
        this.fravaersperioder = lagFraværsperioder(values);
    }
}
