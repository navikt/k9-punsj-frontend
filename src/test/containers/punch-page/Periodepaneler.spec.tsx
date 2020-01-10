import {IPeriodepanelerProps, PeriodeComponent, Periodepaneler} from 'app/containers/punch-page/Periodepaneler';
import {Periodeinfo}                                            from 'app/models/types';
import intlHelper                                               from 'app/utils/intlUtils';
import {configure, shallow}                                     from 'enzyme';
import Adapter                                                  from 'enzyme-adapter-react-16';
import {Input}                                                  from 'nav-frontend-skjema';
import * as React                                               from 'react';
import {createIntl, IntlShape}                                  from 'react-intl';
import {mocked}                                                 from 'ts-jest/utils';

configure({adapter: new Adapter()});

jest.mock('react-intl');
jest.mock('app/utils/intlUtils');

interface ITestperiodeinfo {
    test: string;
}

type Testperiodeinfo = Periodeinfo<ITestperiodeinfo>;

const testperiode0: Testperiodeinfo = {periode: {fraOgMed: '2020-01-01', tilOgMed: '2020-01-31'}, test: 'abc'};
const testperiode1: Testperiodeinfo = {periode: {fraOgMed: '2020-02-01', tilOgMed: '2020-02-29'}, test: 'bca'};
const testperiode2: Testperiodeinfo = {periode: {fraOgMed: '2020-03-01', tilOgMed: '2020-03-31'}, test: 'cab'};

const testperioder: Testperiodeinfo[] = [
    testperiode0,
    testperiode1,
    testperiode2
];

const testinputid = (periodeindex: number) => `testperiode_${periodeindex}_testinput`;

const testkomponent: PeriodeComponent<ITestperiodeinfo> = (info: Testperiodeinfo,
                                                           periodeindex: number,
                                                           updatePeriodeinfoInSoknad: (info: Partial<Testperiodeinfo>) => any,
                                                           updatePeriodeinfoInSoknadState: (info: Partial<Testperiodeinfo>) => any,
                                                           feilkodeprefiksMedIndeks?: string) => {
    return <Input
        label=""
        id={testinputid(periodeindex)}
        className="testinput"
        value={info.test}
        onChange={event => updatePeriodeinfoInSoknadState({test: event.target.value})}
        onBlur={event => updatePeriodeinfoInSoknad({test: event.target.value})}
        feil={feilkodeprefiksMedIndeks ? {feilmelding: `Feilmelding med kode ${feilkodeprefiksMedIndeks}`} : undefined}
    />;
};

const initialperiodetest: Testperiodeinfo = {periode: {fraOgMed: '2020-04-01', tilOgMed: '2020-04-30'}, test: 'cba'};

const setupPeriodepaneler = (periodepanelerPropsPartial?: Partial<IPeriodepanelerProps>) => {

    const periodepanelerProps: IPeriodepanelerProps = {
        periods: testperioder,
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'}),
        initialPeriodeinfo: initialperiodetest,
        panelid: (index: number) => `testperiode_${index}`,
        component: testkomponent,
        editSoknad: jest.fn(),
        editSoknadState: jest.fn(),
        ...periodepanelerPropsPartial
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(<Periodepaneler {...periodepanelerProps}/>);
};

describe('Periodepaneler', () => {

    it('Viser riktig antall perioder', () => {
        const periodepaneler = setupPeriodepaneler();
        expect(periodepaneler.find('.periodepanel')).toHaveLength(testperioder.length);
    });

    it('Legger til en periode', () => {
        const editSoknadState = jest.fn();
        const editSoknad = jest.fn();
        const periodepaneler = setupPeriodepaneler({editSoknadState, editSoknad});
        periodepaneler.find('.leggtilperiodeknapp').simulate('click');
        expect(editSoknadState).toHaveBeenCalledTimes(1);
        expect(editSoknadState).toHaveBeenCalledWith(expect.arrayContaining([...testperioder, initialperiodetest]));
        expect(editSoknad).toHaveBeenCalledTimes(1);
        expect(editSoknad).toHaveBeenCalledWith(expect.arrayContaining([...testperioder, initialperiodetest]));
    });

    it('Fjerner en periode', () => {
        const editSoknadState = jest.fn();
        const editSoknad = jest.fn();
        const periodepaneler = setupPeriodepaneler({editSoknadState, editSoknad});
        periodepaneler.find('#testperiode_1 .fjernperiodeknapp').simulate('click');
        expect(editSoknadState).toHaveBeenCalledTimes(1);
        expect(editSoknadState).toHaveBeenCalledWith(expect.not.arrayContaining([testperiode1]));
        expect(editSoknad).toHaveBeenCalledTimes(1);
        expect(editSoknad).toHaveBeenCalledWith(expect.not.arrayContaining([testperiode1]));
    });

    it('Viser infokomponent i periode', () => {
        const periodepaneler = setupPeriodepaneler();
        expect(periodepaneler.find('.testinput')).toHaveLength(testperioder.length);
        expect(periodepaneler.find(`#${testinputid(1)}`)).toHaveLength(1);
        expect(periodepaneler.find(`#${testinputid(1)}`).prop('value')).toEqual(testperioder[1].test);
    });

    it('Viser feilmelding i infokomponent', () => {
        const feilkodeprefiks = 'test';
        const periodepaneler = setupPeriodepaneler({feilkodeprefiks});
        expect(periodepaneler.find('.testinput')).toHaveLength(testperioder.length);
        expect(periodepaneler.find(`#${testinputid(1)}`)).toHaveLength(1);
        expect(periodepaneler.find(`#${testinputid(1)}`).prop('feil'))
            .toEqual({feilmelding: `Feilmelding med kode ${feilkodeprefiks}[1]`});
    });

    it('Kaller updatePeriodeinfoInSoknadState med ny verdi', () => {
        const editSoknadState = jest.fn();
        const periodepaneler = setupPeriodepaneler({editSoknadState});
        const newValue = 'Hihihi';
        periodepaneler.find(`#${testinputid(1)}`).simulate('change', {target: {value: newValue}});
        expect(editSoknadState).toHaveBeenCalledTimes(1);
        expect(editSoknadState).toHaveBeenCalledWith(expect.arrayContaining([{...testperioder[1], test: newValue}]));
    });

    it('Kaller updatePeriodeinfoInSoknad med ny verdi', () => {
        const editSoknad = jest.fn();
        const periodepaneler = setupPeriodepaneler({editSoknad});
        const newValue = 'Hihihi';
        periodepaneler.find(`#${testinputid(1)}`).simulate('blur', {target: {value: newValue}});
        expect(editSoknad).toHaveBeenCalledTimes(1);
        expect(editSoknad).toHaveBeenCalledWith(expect.arrayContaining([{...testperioder[1], test: newValue}]));
    });

    it('Gir egendefinert klassenavn til alle periodepaneler', () => {
        const panelClassName = 'rattata';
        const periodepaneler = setupPeriodepaneler({panelClassName});
        periodepaneler.find('Panel').forEach(panel => expect(panel.prop('className')).toEqual(`periodepanel ${panelClassName}`));
    });

    it('Skal vise feilmelding for alle perioder', () => {
        const feilkodeprefiks = 'test';
        const getErrorMessage = jest.fn();
        setupPeriodepaneler({getErrorMessage, feilkodeprefiks});
        expect(getErrorMessage).toHaveBeenCalledWith(feilkodeprefiks);
    });

    it('Skal vise feilmeldinger for enkeltperioder', () => {
        const feilkodeprefiks = 'test';
        const getErrorMessage = jest.fn();
        const periodepaneler = setupPeriodepaneler({getErrorMessage, feilkodeprefiks});
        periodepaneler.find('Panel').forEach(panel => expect(getErrorMessage).toHaveBeenCalledWith(`${feilkodeprefiks}[${panel.prop('key')}]`));
    });
});