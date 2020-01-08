import {
    convertNumberToUkedag,
    durationToString,
    hoursFromString,
    minutesFromString
} from 'app/utils';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/apiUtils');

describe('durationToString', () => {
    it('Skal konvertere timer og minutter til ISO 8601-format', () => {
        expect(durationToString(4, 40)).toEqual('PT4H40M');
    });
});

describe('hoursFromString', () => {
    it('Skal hente antall timer fra varighet i ISO 8601-format', () => {
        expect(hoursFromString('PT4H40M')).toEqual(4);
    });
});

describe('minutesFromString', () => {
    it('Skal hente antall minutter fra varighet i ISO 8601-format', () => {
        expect(minutesFromString('PT4H40M')).toEqual(40);
    });
});

describe('convertNumberToUkedag', () => {
    it('Skal konvertere UkedagNumber til Ukedag', () => {
        expect(convertNumberToUkedag(0)).toEqual('mandag');
        expect(convertNumberToUkedag(1)).toEqual('tirsdag');
        expect(convertNumberToUkedag(2)).toEqual('onsdag');
        expect(convertNumberToUkedag(3)).toEqual('torsdag');
        expect(convertNumberToUkedag(4)).toEqual('fredag');
        expect(convertNumberToUkedag(5)).toEqual('lørdag');
        expect(convertNumberToUkedag(6)).toEqual('søndag');
    });
});