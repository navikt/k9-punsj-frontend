import {
    convertNumberToUkedag,
    durationToString,
    hoursFromString,
    isWeekdayWithinPeriod,
    minutesFromString,
} from '../../app/utils/timeUtils';

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

describe('isWeekdayWithinPeriod', () => {
    const mandag = 0;
    const tirsdag = 1;
    const onsdag = 2;
    const torsdag = 3;
    const fredag = 4;
    const lordag = 5;
    const sondag = 6;

    const periodeSomErLengreEnnEnUke = { fom: '2019-12-01', tom: '2020-01-31' };
    const fraTirsdagTilTorsdag = { fom: '2019-12-31', tom: '2020-01-02' };
    const fraLordagTilTirsdag = { fom: '2020-01-04', tom: '2020-01-07' };
    const bareTorsdag = { fom: '2020-01-02', tom: '2020-01-02' };

    it('Blir sann når fullstendig periode ikke er oppgitt', () => {
        expect(isWeekdayWithinPeriod(torsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, {})).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, { fom: '2020-01-01' })).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, { fom: '2020-01-01', tom: '' })).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, { tom: '2020-01-01' })).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, { fom: '', tom: '2020-01-01' })).toBeTruthy();
    });

    it('Blir usann når periode ikke er gyldig', () => {
        expect(isWeekdayWithinPeriod(torsdag, { fom: '2020-01-02', tom: '2019-12-31' })).toBeFalsy();
    });

    it('Blir sann når gitt ukedag inngår i perioden', () => {
        expect(isWeekdayWithinPeriod(mandag, periodeSomErLengreEnnEnUke)).toBeTruthy();
        expect(isWeekdayWithinPeriod(tirsdag, periodeSomErLengreEnnEnUke)).toBeTruthy();
        expect(isWeekdayWithinPeriod(onsdag, periodeSomErLengreEnnEnUke)).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, periodeSomErLengreEnnEnUke)).toBeTruthy();
        expect(isWeekdayWithinPeriod(fredag, periodeSomErLengreEnnEnUke)).toBeTruthy();
        expect(isWeekdayWithinPeriod(lordag, periodeSomErLengreEnnEnUke)).toBeTruthy();
        expect(isWeekdayWithinPeriod(sondag, periodeSomErLengreEnnEnUke)).toBeTruthy();
        expect(isWeekdayWithinPeriod(tirsdag, fraTirsdagTilTorsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(onsdag, fraTirsdagTilTorsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, fraTirsdagTilTorsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(lordag, fraLordagTilTirsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(sondag, fraLordagTilTirsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(mandag, fraLordagTilTirsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(tirsdag, fraLordagTilTirsdag)).toBeTruthy();
        expect(isWeekdayWithinPeriod(torsdag, bareTorsdag)).toBeTruthy();
    });

    it('Blir usann når gitt ukedag ikke inngår i periden', () => {
        expect(isWeekdayWithinPeriod(mandag, fraTirsdagTilTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(fredag, fraTirsdagTilTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(lordag, fraTirsdagTilTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(sondag, fraTirsdagTilTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(onsdag, fraLordagTilTirsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(torsdag, fraLordagTilTirsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(fredag, fraLordagTilTirsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(mandag, bareTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(tirsdag, bareTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(onsdag, bareTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(fredag, bareTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(lordag, bareTorsdag)).toBeFalsy();
        expect(isWeekdayWithinPeriod(sondag, bareTorsdag)).toBeFalsy();
    });
});
