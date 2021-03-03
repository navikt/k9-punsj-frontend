import {
    GetErrorMessage,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                       from 'app/containers/pleiepenger/Periodepaneler';
import {pfTilsyn}                       from 'app/containers/pleiepenger/pfTilsyn';
import {ITilsyn} from 'app/models/types';
import intlHelper                       from 'app/utils/intlUtils';
import {shallow}                        from 'enzyme';
import {createIntl, IntlShape}          from 'react-intl';
import {mocked}                         from 'ts-jest/utils';
import {PeriodeinfoV2} from "../../../app/models/types/PeriodeInfoV2";
import {IPeriodeV2} from "../../../app/models/types/PeriodeV2";

jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');

const testTimer = 8;
const testMinutter = 15;
const testVarighet = `PT${testTimer}H${testMinutter}M`;
const testPeriodeinfo: PeriodeinfoV2<ITilsyn> = {
    periode: {fom: '2020-01-01', tom: '2020-12-31'},
    mandag: testVarighet,
    tirsdag: testVarighet,
    onsdag: testVarighet,
    torsdag: testVarighet,
    fredag: testVarighet
};
const testPeriodeindex = 0;
const testUpdatePeriodeinfoInSoknad = jest.fn();
const testUpdatePeriodeinfoInSoknadState = jest.fn();
const testFeilprefiks = 'feilprefiks';
const testGetErrorMessage = jest.fn();
const testIntl = createIntl({locale: 'nb', defaultLocale: 'nb'});

const setupPfTilsyn = (
    optionalPeriodeinfo?: PeriodeinfoV2<ITilsyn>,
    optionalPeriodeindex?: number,
    optionalUpdatePeriodeinfoInSoknad?: UpdatePeriodeinfoInSoknad<ITilsyn>,
    optionalUpdatePeriodeinfoInSoknadState?: UpdatePeriodeinfoInSoknadState<ITilsyn>,
    optionalFeilprefiks?: string,
    optionalGetErrorMessage?: GetErrorMessage,
    optionalIntl?: IntlShape
) => {

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(pfTilsyn(
        optionalPeriodeinfo || testPeriodeinfo,
        optionalPeriodeindex || testPeriodeindex,
        optionalUpdatePeriodeinfoInSoknad || testUpdatePeriodeinfoInSoknad,
        optionalUpdatePeriodeinfoInSoknadState || testUpdatePeriodeinfoInSoknadState,
        optionalFeilprefiks || testFeilprefiks,
        optionalGetErrorMessage || testGetErrorMessage,
        optionalIntl || testIntl
    ));
};

describe('pfTilsyn', () => {

    beforeEach(() => jest.resetAllMocks());

    it('Viser nedtrekksmenyer', () => {
        const tilsyn = setupPfTilsyn();
        expect(tilsyn.find('NumberSelect')).toHaveLength(10);
        expect(tilsyn.find('NumberSelect.tilsyn-timer')).toHaveLength(5);
        tilsyn.find('NumberSelect.tilsyn-timer').forEach(select => expect(select.prop('value')).toEqual(testTimer));
        expect(tilsyn.find('NumberSelect.tilsyn-minutter')).toHaveLength(5);
        tilsyn.find('NumberSelect.tilsyn-minutter').forEach(select => expect(select.prop('value')).toEqual(testMinutter));
    });

    it('Kaller updatePeriodeinfoInSoknadState og updatePeriodeinfoInSoknad på onChange av timer', () => {
        const tilsyn = setupPfTilsyn();
        const newTimer = 7;
        const newVarighet = `PT${newTimer}H${testMinutter}M`;
        tilsyn.find('NumberSelect.tilsyn-timer').forEach(select => select.simulate('change', {target: {value: newTimer}}));
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledTimes(5);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({mandag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({tirsdag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({onsdag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({torsdag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({fredag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledTimes(5);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({mandag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({tirsdag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({onsdag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({torsdag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({fredag: newVarighet});
    });

    it('Kaller updatePeriodeinfoInSoknadState og updatePeriodeinfoInSoknad på onChange av minutter', () => {
        const tilsyn = setupPfTilsyn();
        const newMinutter = 30;
        const newVarighet = `PT${testTimer}H${newMinutter}M`;
        tilsyn.find('NumberSelect.tilsyn-minutter').forEach(select => select.simulate('change', {target: {value: newMinutter}}));
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledTimes(5);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({mandag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({tirsdag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({onsdag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({torsdag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({fredag: newVarighet}, true);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledTimes(5);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({mandag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({tirsdag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({onsdag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({torsdag: newVarighet});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({fredag: newVarighet});
    });

    it('Deaktiverer minutter når timer er satt til 24', () => {
        const periodeinfo: PeriodeinfoV2<ITilsyn> = {
            ...testPeriodeinfo,
            mandag: 'PT24H'
        };
        const tilsyn = setupPfTilsyn(periodeinfo);
        expect(tilsyn.find('NumberSelect.tilsyn-minutter').first().prop('disabled')).toBeTruthy();
    });

    it('Deaktiverer ukedager som ikke inngår i perioden', () => {
        const fraTirsdagTilTorsdag: IPeriodeV2 = {fom: '2020-01-14', tom: '2020-01-16'};
        const periodeinfo: PeriodeinfoV2<ITilsyn> = {
            ...testPeriodeinfo,
            periode: fraTirsdagTilTorsdag
        };
        const tilsyn = setupPfTilsyn(periodeinfo);
        tilsyn.find('NumberSelect.tilsyn-timer').forEach((select, i) => expect(select.prop('disabled')).toEqual(i === 0 || i === 4));
        tilsyn.find('NumberSelect.tilsyn-minutter').forEach((select, i) => expect(select.prop('disabled')).toEqual(i === 0 || i === 4));
    });

    it('Viser feilmeldinger', () => {
        const tilsyn = setupPfTilsyn();
        expect(testGetErrorMessage).toHaveBeenCalledTimes(5);
    });
});
