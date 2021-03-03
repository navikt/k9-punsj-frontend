import {
    GetErrorMessage,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                          from 'app/containers/pleiepenger/Periodepaneler';
import {pfTilleggsinformasjon}             from 'app/containers/pleiepenger/pfTilleggsinformasjon';
import intlHelper                          from 'app/utils/intlUtils';
import {shallow}                           from 'enzyme';
import {createIntl, IntlShape}             from 'react-intl';
import {mocked}                            from 'ts-jest/utils';
import {PeriodeinfoV2} from "../../../app/models/types/PeriodeInfoV2";
import {ITilleggsinformasjonV2} from "../../../app/models/types/Soknadv2";

jest.mock('app/utils/intlUtils');

const testTekst = 'Lorem ipsum dolor sit amet';
const testPeriodeinfo: PeriodeinfoV2<ITilleggsinformasjonV2> = {
    periode: {fom: '2020-01-01', tom: '2020-12-31'},
    tilleggsinformasjon: testTekst
};
const testPeriodeindex = 0;
const testUpdatePeriodeinfoInSoknad = jest.fn();
const testUpdatePeriodeinfoInSoknadState = jest.fn();
const testFeilprefiks = 'feilprefiks';
const testGetErrorMessage = jest.fn();
const testIntl = createIntl({locale: 'nb', defaultLocale: 'nb'});
const testKodeord = 'kodeord';

const setupPfTilleggsinformasjon = (
    optionalPeriodeinfo?: PeriodeinfoV2<ITilleggsinformasjonV2>,
    optionalPeriodeindex?: number,
    optionalUpdatePeriodeinfoInSoknad?: UpdatePeriodeinfoInSoknad<ITilleggsinformasjonV2>,
    optionalUpdatePeriodeinfoInSoknadState?: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjonV2>,
    optionalFeilprefiks?: string,
    optionalGetErrorMessage?: GetErrorMessage,
    optionalIntl?: IntlShape,
    optionalKodeord?: string
) => {

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(pfTilleggsinformasjon(optionalKodeord || testKodeord)(
        optionalPeriodeinfo || testPeriodeinfo,
        optionalPeriodeindex || testPeriodeindex,
        optionalUpdatePeriodeinfoInSoknad || testUpdatePeriodeinfoInSoknad,
        optionalUpdatePeriodeinfoInSoknadState || testUpdatePeriodeinfoInSoknadState,
        optionalFeilprefiks || testFeilprefiks,
        optionalGetErrorMessage || testGetErrorMessage,
        optionalIntl || testIntl
    ));
};

describe('pfTilleggsinformasjon', () => {

    beforeEach(() => jest.resetAllMocks());

    it('Virker', () => {
        expect(pfTilleggsinformasjon(testKodeord)).toBeInstanceOf(Function);
    });

    it('Viser tekstområde', () => {
        const tilleggsinformasjon = setupPfTilleggsinformasjon();
        expect(tilleggsinformasjon.find('Textarea')).toHaveLength(1);
    });

    it('Viser riktig etikett', () => {
        const tilleggsinformasjon = setupPfTilleggsinformasjon();
        expect(tilleggsinformasjon.find('Textarea').prop('label')).toEqual(`skjema.${testKodeord}.tilleggsinfo`);
    });

    it('Viser riktig tekst i tekstområde', () => {
        const tilleggsinformasjon = setupPfTilleggsinformasjon();
        expect(tilleggsinformasjon.find('Textarea').prop('value')).toEqual(testPeriodeinfo.tilleggsinformasjon);
    });

    it('Kaller updatePeriodeinfoInSoknadState på onChange', () => {
        const tilleggsinformasjon = setupPfTilleggsinformasjon();
        const newValue = 'Integer ut ligula sed est.';
        tilleggsinformasjon.find('Textarea').simulate('change', {target: {value: newValue}});
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledTimes(1);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({tilleggsinformasjon: newValue}, false);
    });

    it('Kaller updatePeriodeinfoInSoknad på onBlur', () => {
        const tilleggsinformasjon = setupPfTilleggsinformasjon();
        const newValue = 'Integer ut ligula sed est.';
        tilleggsinformasjon.find('Textarea').simulate('blur', {target: {value: newValue}});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledTimes(1);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({tilleggsinformasjon: newValue});
    });

    it('Viser feilmelding', () => {
        const tilleggsinformasjon = setupPfTilleggsinformasjon();
        expect(testGetErrorMessage).toHaveBeenCalledTimes(1);
        expect(testGetErrorMessage).toHaveBeenCalledWith(`${testFeilprefiks}.tilleggsinformasjon`);
    });
});
