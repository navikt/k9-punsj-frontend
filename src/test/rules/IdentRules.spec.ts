import { IdentRules } from '../../app/validation/IdentRules';

const gyldigIdent = '18410162721';
const gyldigDnrOgHnr = '53488838241';
const identMedFeilLengde = '123';
const identMedFeilKontrollnumre = `${gyldigIdent.slice(0, -1)}0`;

describe('IdentRules', () => {
    describe('IdentRules.isIdentValid', () => {
        it.each([gyldigIdent, gyldigDnrOgHnr])('Blir usann når ident %s er gyldig', (ident) => {
            expect(IdentRules.erUgyldigIdent(ident)).toBeFalsy();
        });

        it.each([null, '', identMedFeilLengde, identMedFeilKontrollnumre])(
            'Blir sann når ident %s ikke er gyldig',
            (ident) => {
                expect(IdentRules.erUgyldigIdent(ident)).toBeTruthy();
            },
        );

        it('Validerer 11 sifre separat fra ident-regelen', () => {
            expect(IdentRules.harFnr11Siffrer(identMedFeilLengde)).toBeFalsy();
            expect(IdentRules.harFnr11Siffrer(identMedFeilKontrollnumre)).toBeTruthy();
        });
    });

    describe('IdentRules.areIdentsValid', () => {
        it('Blir sann når kun ett identitetsnummer er oppgitt og dette er gyldig', () => {
            expect(IdentRules.erAlleIdenterGyldige(gyldigIdent, null)).toBeTruthy();
        });

        it('Blir sann når to gyldige identitetsnumre er oppgitt', () => {
            expect(IdentRules.erAlleIdenterGyldige(gyldigIdent, gyldigDnrOgHnr)).toBeTruthy();
        });

        it('Blir usann når minst ett identitetsnummer ikke er gyldig', () => {
            expect(IdentRules.erAlleIdenterGyldige(identMedFeilKontrollnumre, null)).toBeFalsy();
            expect(IdentRules.erAlleIdenterGyldige(gyldigIdent, identMedFeilKontrollnumre)).toBeFalsy();
            expect(IdentRules.erAlleIdenterGyldige(identMedFeilKontrollnumre, gyldigIdent)).toBeFalsy();
            expect(
                IdentRules.erAlleIdenterGyldige(identMedFeilKontrollnumre, identMedFeilLengde),
            ).toBeFalsy();
        });
    });
});
