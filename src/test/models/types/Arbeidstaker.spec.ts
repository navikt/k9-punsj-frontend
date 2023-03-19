import { Arbeidstaker, IArbeidstaker } from 'app/models/types';

jest.mock('app/utils/envUtils');

const periode = { fom: '2020-01-01', tom: '2020-01-31' };
const organisasjonsnummer = '123456789';
const norskIdent = '01015012345';

const setupArbeidstaker = (arbeidstakerPartial?: Partial<IArbeidstaker>) => {
    const arbeidstaker: IArbeidstaker = {
        arbeidstidInfo: {
            perioder: [
                {
                    periode,
                    jobberNormaltTimerPerDag: '7',
                    faktiskArbeidTimerPerDag: '4',
                },
            ],
        },
        organisasjonsnummer,
        ...arbeidstakerPartial,
    };

    return new Arbeidstaker(arbeidstaker);
};

describe('Arbeidstaker.orgOrPers', () => {
    it('Skal returnere "o" når kun organisasjonsnummer er gitt', () => {
        expect(setupArbeidstaker().orgOrPers()).toEqual('o');
    });

    it('Skal returnere "p" når kun personnummer er gitt', () => {
        expect(setupArbeidstaker({ organisasjonsnummer: null, norskIdent }).orgOrPers()).toEqual('p');
    });

    it('Skal returnere "o" når verken organisasjonsnummer eller personnummer er gitt', () => {
        expect(
            setupArbeidstaker({
                organisasjonsnummer: null,
                norskIdent: null,
            }).orgOrPers(),
        ).toEqual('o');
    });
});
