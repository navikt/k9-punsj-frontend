import { IdentRules } from '../../app/validation/IdentRules';

const gyldigeFnr = [
    '18410162721',
    '17420373147',
    '24420167209',
    '18410162721',
    '17420373147',
    '24420167209',
    '18410162721',
    '17420373147',
    '24420167209',
    '18410162721',
    '17420373147',
    '24420167209',
    '18410162721',
    '17420373147',
];

const gyldigeDnr = [
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
    '53488838241',
];

const gyldigeFnrOgDnr = gyldigeFnr.concat(gyldigeDnr);

const fnrMedFeilFormat = ['39010000045', '29020900103', '00031800218', '26142700300', '32053600475', '31064500514'];

const dnrMedFeilFormat = ['79010000039', '69020920122', '40031800201', '66142730392', '72053600469', '71064500508'];

const fnrMedFeilKontrollnumre = [
    '29010000075',
    '28020900184',
    '27031800212',
    '26042700352',
    '25053600412',
    '24064500549',
    '23075401677',
    '22086303783',
    '21097203856',
    '20108103939',
    '19119011023',
    '31129921144',
    '29029200102',
    '01010050035',
];

const dnrMedFeilKontrollnumre = [
    '69010000069',
    '68020900178',
    '67031800206',
    '66042700346',
    '65053620431',
    '64064500533',
    '63075401647',
    '62086323726',
    '61097203828',
    '60108103945',
    '59119211017',
    '71129921170',
    '69029200123',
    '41010050038',
];

const ugyldigeFnrOgDnr = fnrMedFeilFormat
    .concat(dnrMedFeilFormat)
    .concat(fnrMedFeilKontrollnumre)
    .concat(dnrMedFeilKontrollnumre);

describe('IdentRules', () => {
    describe('IdentRules.isIdentValid', () => {
        it('Blir sann når ident er gyldig', () => {
            gyldigeFnr.forEach((fnr) => expect(IdentRules.erUgyldigIdent(fnr)).toBeFalsy());
            gyldigeDnr.forEach((dnr) => expect(IdentRules.erUgyldigIdent(dnr)).toBeFalsy());
        });

        it('Blir usann når ident ikke er gyldig', () => {
            fnrMedFeilFormat.forEach((fnr) => expect(IdentRules.erUgyldigIdent(fnr)).toBeTruthy());
            dnrMedFeilFormat.forEach((dnr) => expect(IdentRules.erUgyldigIdent(dnr)).toBeTruthy());
            fnrMedFeilKontrollnumre.forEach((fnr) => expect(IdentRules.erUgyldigIdent(fnr)).toBeTruthy());
            dnrMedFeilKontrollnumre.forEach((dnr) => expect(IdentRules.erUgyldigIdent(dnr)).toBeTruthy());
        });
    });

    describe('IdentRules.areIdentsValid', () => {
        it('Blir sann når kun ett identitetsnummer er oppgitt og dette er gyldig', () => {
            expect(IdentRules.erAlleIdenterGyldige(gyldigeFnrOgDnr[0], null)).toBeTruthy();
        });

        it('Blir sann når to gyldige identitetsnumre er oppgitt', () => {
            expect(IdentRules.erAlleIdenterGyldige(gyldigeFnrOgDnr[0], gyldigeFnrOgDnr[1])).toBeTruthy();
        });

        it('Blir usann når minst ett identitetsnummer ikke er gyldig', () => {
            expect(IdentRules.erAlleIdenterGyldige(ugyldigeFnrOgDnr[0], null)).toBeFalsy();
            expect(IdentRules.erAlleIdenterGyldige(gyldigeFnrOgDnr[0], ugyldigeFnrOgDnr[0])).toBeFalsy();
            expect(IdentRules.erAlleIdenterGyldige(ugyldigeFnrOgDnr[0], gyldigeFnrOgDnr[0])).toBeFalsy();
            expect(IdentRules.erAlleIdenterGyldige(ugyldigeFnrOgDnr[0], ugyldigeFnrOgDnr[1])).toBeFalsy();
        });
    });
});
