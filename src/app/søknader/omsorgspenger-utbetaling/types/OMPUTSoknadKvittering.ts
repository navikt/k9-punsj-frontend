import Kvittering from 'app/models/forms/soeknader/Kvittering';
import {
    Fravaersperiode,
    FrilanserAktivitet,
    SelvstendigNaeringsdrivendeAktivitet,
} from 'app/models/types/KvitteringTyper';

import BegrunnelseForInnsending from '../../../models/types/BegrunnelseForInnsending';

export interface IOMPUTSoknadKvittering extends Kvittering {
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
