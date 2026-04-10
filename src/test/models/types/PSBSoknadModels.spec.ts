import { IPSBSoknad, PSBSoknad } from '../../../app/models/types/PSBSoknad';
import { IPSBSoknadUt, PSBSoknadUt } from '../../../app/models/types/PSBSoknadUt';

const minimalPsbSoknad = (): IPSBSoknad => ({
    soekerId: '01017012345',
    barn: { norskIdent: '02017012345', foedselsdato: '' },
    journalposter: new Set<string>(),
    soeknadsperiode: [],
    opptjeningAktivitet: {},
    harInfoSomIkkeKanPunsjes: false,
    harMedisinskeOpplysninger: false,
});

const minimalPsbSoknadUt = (): IPSBSoknadUt => ({
    soekerId: '01017012345',
    barn: { norskIdent: '02017012345', foedselsdato: '' },
    opptjeningAktivitet: {},
});

describe('PSB begrunnelse defaults', () => {
    it('does not create default empty begrunnelseForInnsending in PSBSoknad', () => {
        const soknad = new PSBSoknad(minimalPsbSoknad());
        expect(soknad.begrunnelseForInnsending).toBeUndefined();
    });

    it('does not create default empty begrunnelseForInnsending in PSBSoknadUt', () => {
        const soknad = new PSBSoknadUt(minimalPsbSoknadUt());
        expect(soknad.begrunnelseForInnsending).toBeUndefined();
    });

    it('keeps explicit begrunnelseForInnsending when provided', () => {
        const soknad = new PSBSoknadUt({
            ...minimalPsbSoknadUt(),
            begrunnelseForInnsending: { tekst: 'Forklaring' },
        });

        expect(soknad.begrunnelseForInnsending).toEqual({ tekst: 'Forklaring' });
    });
});
