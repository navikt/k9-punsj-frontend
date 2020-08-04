import {
    GetErrorMessage,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                                                                               from 'app/containers/pleiepenger/Periodepaneler';
import {pfArbeidstaker}                                                                         from 'app/containers/pleiepenger/pfArbeidstaker';
import {IPunchFormComponentState}                                                               from 'app/containers/pleiepenger/PunchForm';
import {Arbeidstaker, IArbeidstaker, ITilleggsinformasjon, ITilstedevaerelsesgrad, Periodeinfo} from 'app/models/types';
import intlHelper
                                                                                                from 'app/utils/intlUtils';
import {shallow}                                                                                from 'enzyme';
import {RadioProps}                                                                             from 'nav-frontend-skjema';
import {createIntl, IntlShape}                                                                  from 'react-intl';
import {mocked}                                                                                 from 'ts-jest/utils';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');


const testTilstedevaerelsesgrad: ITilstedevaerelsesgrad = {
    grad: 100.0
};
const testPeriodeinfo: Periodeinfo<ITilstedevaerelsesgrad> = {
    periode: {fraOgMed: '2020-01-01', tilOgMed: '2020-12-31'},
    ...testTilstedevaerelsesgrad
};
const testArbeidstaker: IArbeidstaker = {
    organisasjonsnummer: '345678912',
    norskIdent: null,
    skalJobbeProsent: [testPeriodeinfo]
};
const testPeriodeindex = 0;
const testUpdatePeriodeinfoInSoknad = jest.fn();
const testUpdatePeriodeinfoInSoknadState = jest.fn();
const testFeilprefiks = 'feilprefiks';
const testGetErrorMessage = jest.fn();
const testIntl = createIntl({locale: 'nb', defaultLocale: 'nb'});
const testTgString = '100,0';
const testTgStrings = [[testTgString]];
const testPunchFormComponentState: IPunchFormComponentState = {
    dobbelSoknad: {
        soker1: {
            arbeid: {
                arbeidstaker: [testArbeidstaker]
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
    optionalTgStrings?: string[][],
    optionalSetTgStringsInParentState?: (tgStrings: string[][]) => any,
    optionalGenerateTgStrings?: () => string[][],
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

    it('Viser periodepaneer', () => {
        const tilleggsinformasjon = setupPfArbeidstaker();
        expect(tilleggsinformasjon.find('Periodepaneler')).toHaveLength(1);
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
        setupPfArbeidstaker();
        expect(testGetErrorMessage).toHaveBeenCalledTimes(2);
    });
});
