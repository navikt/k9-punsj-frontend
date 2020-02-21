import {Arbeidstaker, IArbeidstaker} from 'app/models/types';
import {createIntl}                  from 'react-intl';

jest.mock('app/utils/envUtils');

const periode = {fraOgMed: '2020-01-01', tilOgMed: '2020-01-31'};
const tilstedevaerelsesgrad = 50.0;
const organisasjonsnummer = '123456789';
const norskIdent = '01015012345';

const setupArbeidstaker = (arbeidstakerPartial?: Partial<IArbeidstaker>) => {

    const arbeidstaker: IArbeidstaker = {
        skalJobbeProsent: [{
            grad: tilstedevaerelsesgrad,
            periode
        }],
        organisasjonsnummer,
        ...arbeidstakerPartial
    };

    return new Arbeidstaker(arbeidstaker);
};

describe ('Arbeidstaker.generateTgString', () => {

    const intl = createIntl({locale: 'nb', defaultLocale: 'nb'});

    it("Skal konvertere tilstedeværelsesgrad til en string", () => {
        expect(setupArbeidstaker().skalJobbeProsent[0].generateTgString(intl)).toEqual("50,0");
    });
});

describe('Arbeidstaker.orgOrPers', () => {

    it('Skal returnere "o" når kun organisasjonsnummer er gitt', () => {
        expect(setupArbeidstaker().orgOrPers()).toEqual('o');
    });

    it('Skal returnere "p" når kun personnummer er gitt', () => {
        expect(setupArbeidstaker({organisasjonsnummer: null, norskIdent}).orgOrPers()).toEqual('p');
    });

    it('Skal returnere "o" når verken organisasjonsnummer eller personnummer er gitt', () => {
        expect(setupArbeidstaker({organisasjonsnummer: null, norskIdent: null}).orgOrPers()).toEqual('o');
    });
});