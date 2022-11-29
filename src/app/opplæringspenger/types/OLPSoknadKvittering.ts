import Kvittering from 'app/models/forms/soeknader/Kvittering';
import BegrunnelseForInnsending from 'app/models/types/søknadTypes/BegrunnelseForInnsending';
import {
    Fravaersperiode,
    FrilanserAktivitet,
    SelvstendigNaeringsdrivendeAktivitet,
} from 'app/models/types/KvitteringTyper';

export interface IOLPSoknadKvittering extends Kvittering {
    ytelse: {
        type: string;
        aktivitet: {
            frilanser?: FrilanserAktivitet;
            selvstendigNæringsdrivende: SelvstendigNaeringsdrivendeAktivitet;
        };
        fraværsperioder: Fravaersperiode[];
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
