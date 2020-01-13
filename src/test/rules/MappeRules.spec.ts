import {IMappe, ISoknad} from 'app/models/types';
import {MappeRules}      from 'app/rules';

describe('MappeRules.isSoknadResponseValid', () => {

    it ('Skal være sann når søknadresponsen er gyldig', () => {
        const soknad: ISoknad = {};
        expect(MappeRules.isSoknadResponseValid(soknad)).toBeTruthy();
    });

    it ('Skal være usann når søknadresponsen ikke finnes', () => {
        expect(MappeRules.isSoknadResponseValid()).toBeFalsy();
    });
});

describe('MappeRules.isMappeResponseValid', () => {

    it ('Skal være sann når mapperesponsen er gyldig', () => {
        const mappe: IMappe = {
            mappe_id: '123',
            personlig: {
                '123': {
                    innhold: {}
                }
            }
        };
        expect(MappeRules.isMappeResponseValid(mappe)).toBeTruthy();
    });

    it ('Skal være usann når det mangler personer', () => {
        const mappe: IMappe = {
            mappe_id: '123',
            personlig: {}
        };
        expect(MappeRules.isMappeResponseValid(mappe)).toBeFalsy();
    });

    it ('Skal være usann når mappeid ikke er satt', () => {
        const mappe: IMappe = {
            personlig: {
                '123': {
                    innhold: {}
                }
            }
        };
        expect(MappeRules.isMappeResponseValid(mappe)).toBeFalsy();
    });

    it ('Skal være usann når det mangler innhold', () => {
        const mappe: IMappe = {};
        expect(MappeRules.isMappeResponseValid(mappe)).toBeFalsy();
    });
});

describe('MappeRules.isMapperResponseValid', () => {

    it('Skal være sann når alle mapper er gyldige', () => {
        const mapper: IMappe[] = [{
            mappe_id: '123',
            personlig: {
                '123': {
                    innhold: {}
                }
            }
        }];
        expect(MappeRules.isMapperResponseValid(mapper)).toBeTruthy();
    });

    it('Skal være sann når de ikke finnes noen mapper', () => {
        const mapper: IMappe[] = [];
        expect(MappeRules.isMapperResponseValid(mapper)).toBeTruthy();
    });

    it('Skal være usann når en mappe mangler personer', () => {
        const mapper: IMappe[] = [{}];
        expect(MappeRules.isMapperResponseValid(mapper)).toBeFalsy();
    });
});