import {
    GetErrorMessage,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                                                       from 'app/containers/punch-page/Periodepaneler';
import {pfArbeidstaker}                                                 from 'app/containers/punch-page/pfArbeidstaker';
import {IPunchFormComponentState}                                       from 'app/containers/punch-page/PunchForm';
import {Arbeidstaker, IArbeidstaker, ITilleggsinformasjon, Periodeinfo} from 'app/models/types';
import intlHelper                                                       from 'app/utils/intlUtils';
import {configure, shallow}                                             from 'enzyme';
import Adapter                                                          from 'enzyme-adapter-react-16';
import {RadioProps}                                                     from 'nav-frontend-skjema';
import {createIntl, IntlShape}                                          from 'react-intl';
import {mocked}                                                         from 'ts-jest/utils';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');

configure({adapter: new Adapter()});

const testArbeidstaker: IArbeidstaker = {
    organisasjonsnummer: '345678912',
    norskIdent: null,
    skalJobbeProsent: 100.0
};
const testPeriodeinfo: Periodeinfo<IArbeidstaker> = {
    periode: {fraOgMed: '2020-01-01', tilOgMed: '2020-12-31'},
    ...testArbeidstaker
};
const testPeriodeindex = 0;
const testUpdatePeriodeinfoInSoknad = jest.fn();
const testUpdatePeriodeinfoInSoknadState = jest.fn();
const testFeilprefiks = 'feilprefiks';
const testGetErrorMessage = jest.fn();
const testIntl = createIntl({locale: 'nb', defaultLocale: 'nb'});
const testTgString = '100,0';
const testTgStrings = [testTgString];
const testPunchFormComponentState: IPunchFormComponentState = {
    dobbelSoknad: {
        soker1: {
            arbeid: {
                arbeidstaker: [testPeriodeinfo]
            }
        },
        soker2: null,
        felles: {}
    },
    tgStrings1: testTgStrings,
    tgStrings2: [],
    isFetched: true,
    showStatus: false
};
const testSetTgStringsInParentState = jest.fn();
const testGenerateTgStrings = jest.fn();
const testSokernr = 1;

const setupPfArbeidstaker = (
    optionalPeriodeinfo?: Periodeinfo<IArbeidstaker>,
    optionalPeriodeindex?: number,
    optionalUpdatePeriodeinfoInSoknad?: UpdatePeriodeinfoInSoknad<ITilleggsinformasjon>,
    optionalUpdatePeriodeinfoInSoknadState?: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjon>,
    optionalFeilprefiks?: string,
    optionalGetErrorMessage?: GetErrorMessage,
    optionalIntl?: IntlShape,
    optionalTgStrings?: string[],
    optionalSetTgStringsInParentState?: (tgStrings: string[]) => any,
    optionalGenerateTgStrings?: () => string[],
    optionalSokernr?: 1 | 2
) => {

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(pfArbeidstaker(
        optionalTgStrings || testTgStrings,
        optionalSetTgStringsInParentState || testSetTgStringsInParentState,
        optionalGenerateTgStrings || testGenerateTgStrings,
        optionalSokernr || testSokernr
    )(
        new Arbeidstaker(optionalPeriodeinfo || testPeriodeinfo),
        optionalPeriodeindex || testPeriodeindex,
        optionalUpdatePeriodeinfoInSoknad || testUpdatePeriodeinfoInSoknad,
        optionalUpdatePeriodeinfoInSoknadState || testUpdatePeriodeinfoInSoknadState,
        optionalFeilprefiks || testFeilprefiks,
        optionalGetErrorMessage || testGetErrorMessage,
        optionalIntl || testIntl
    ));
};

describe('pfArbeidstaker', () => {

    beforeEach(() => jest.resetAllMocks());

    it('Virker', () => {
        expect(pfArbeidstaker(
            testTgStrings,
            testSetTgStringsInParentState,
            testGenerateTgStrings,
            testSokernr
        )).toBeInstanceOf(Function);
    });

    it('Viser radioknapper for arbeidsgivertype', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        expect(tilleggsinformasjon.find('RadioPanelGruppe')).toHaveLength(1);
        expect(tilleggsinformasjon.find('RadioPanelGruppe').prop('radios')).toHaveLength(2);
        expect((tilleggsinformasjon.find('RadioPanelGruppe').prop('radios') as RadioProps[])[0].value).toEqual('o');
        expect((tilleggsinformasjon.find('RadioPanelGruppe').prop('radios') as RadioProps[])[1].value).toEqual('p');
    });

    it('Kaller updatePeriodeinfoInSoknadState og updatePeriodeinfoInSoknad på onChange', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        tilleggsinformasjon.find('RadioPanelGruppe').simulate('change', {target: {value: 'o'}});
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledTimes(1);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledTimes(1);
    });

    it('Kan endre arbeidsgivertype til organisasjon', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        tilleggsinformasjon.find('RadioPanelGruppe').simulate('change', {target: {value: 'o'}});
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({organisasjonsnummer: '', norskIdent: null});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({organisasjonsnummer: '', norskIdent: null});
    });

    it('Kan endre arbeidsgivertype til person', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        tilleggsinformasjon.find('RadioPanelGruppe').simulate('change', {target: {value: 'p'}});
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({organisasjonsnummer: null, norskIdent: ''});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({organisasjonsnummer: null, norskIdent: ''});
    });

    it('Viser tilstedværelsesgradsfelt', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        expect(tilleggsinformasjon.find('.arbeidstaker-tilstedevaerelse')).toHaveLength(1);
        expect(tilleggsinformasjon.find('.arbeidstaker-tilstedevaerelse').prop('value')).toEqual(testTgString);
    });

    it('Kjører updatePeriodeinfoInSoknadState og setTgStringsInParentState på onChange av tilstedeværelsesgrad', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        const newTgString = '66,7';
        tilleggsinformasjon.find('.arbeidstaker-tilstedevaerelse').simulate('change', {target: {value: newTgString}});
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledTimes(1);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledWith({skalJobbeProsent: 66.7});
        expect(testSetTgStringsInParentState).toHaveBeenCalledTimes(1);
        expect(testSetTgStringsInParentState).toHaveBeenCalledWith([newTgString]);
    });

    it('Kjører updatePeriodeinfoInSoknad og setTgStringsInParentState på onBlur av tilstedeværelsesgrad', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        const newTgString = '66,7';
        tilleggsinformasjon.find('.arbeidstaker-tilstedevaerelse').simulate('blur', {target: {value: newTgString}});
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledTimes(1);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({skalJobbeProsent: 66.7});
        expect(testSetTgStringsInParentState).toHaveBeenCalledTimes(1);
        expect(testGenerateTgStrings).toHaveBeenCalledTimes(1);
    });

    it('Viser organisasjonsnummerfelt når arbeidsgiver er organisasjon', () => {
        const periodeInfo: Periodeinfo<IArbeidstaker> = {
            ...testPeriodeinfo,
            organisasjonsnummer: '987654321',
            norskIdent: null
        };
        const tilleggsinformasjon = setupPfArbeidstaker(periodeInfo);
        expect(tilleggsinformasjon.find('.arbeidstaker-organisasjonsnummer')).toHaveLength(1);
        expect(tilleggsinformasjon.find('.arbeidstaker-norskIdent')).toHaveLength(0);
    });

    it('Viser personnummerfelt når arbeidsgiver er person', () => {
        const periodeInfo: Periodeinfo<IArbeidstaker> = {
            ...testPeriodeinfo,
            organisasjonsnummer: null,
            norskIdent: '3219876543'
        };
        const tilleggsinformasjon = setupPfArbeidstaker(periodeInfo);
        expect(tilleggsinformasjon.find('.arbeidstaker-organisasjonsnummer')).toHaveLength(0);
        expect(tilleggsinformasjon.find('.arbeidstaker-norskIdent')).toHaveLength(1);
    });

    it('Viser feilmeldinger', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        expect(testGetErrorMessage).toHaveBeenCalledWith(`${testFeilprefiks}.skalJobbeProsent`);
        expect(testGetErrorMessage).toHaveBeenCalledWith(`${testFeilprefiks}.organisasjonsnummer`);
        expect(testGetErrorMessage).toHaveBeenCalledWith(`${testFeilprefiks}.norskIdent`);
        expect(testGetErrorMessage).toHaveBeenCalledTimes(3);
    });
});