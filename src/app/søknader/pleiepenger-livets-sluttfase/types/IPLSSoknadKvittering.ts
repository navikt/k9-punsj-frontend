import {
    FrilanserAktivitet,
    ISoknadKvitteringArbeidstid,
    ISoknadKvitteringBosteder,
    ISoknadKvitteringJournalpost,
    ISoknadKvitteringLovbestemtFerie,
    ISoknadKvitteringUtenlandsopphold,
    SelvstendigNaeringsdrivendeAktivitet,
} from 'app/models/types/KvitteringTyper';

import BegrunnelseForInnsending from '../../../models/types/BegrunnelseForInnsending';

export interface IPLSSoknadKvittering {
    mottattDato: string;
    journalposter: ISoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
        søknadsperiode: string[];
        pleietrengende: {
            norskIdentitetsnummer: string;
        };
        arbeidstid: ISoknadKvitteringArbeidstid;
        opptjeningAktivitet: {
            selvstendigNæringsdrivende?: SelvstendigNaeringsdrivendeAktivitet[];
            frilanser?: FrilanserAktivitet;
        };
        lovbestemtFerie: { perioder: ISoknadKvitteringLovbestemtFerie };
        bosteder: { perioder: ISoknadKvitteringBosteder };
        utenlandsopphold: { perioder: ISoknadKvitteringUtenlandsopphold };
        trekkKravPerioder: string[];
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
