import { expect } from '@jest/globals';
import { shallow } from 'enzyme';
import { mocked } from 'jest-mock';
import { TextField } from '@navikt/ds-react';
import * as React from 'react';
import { IntlShape, createIntl } from 'react-intl';
import intlHelper from '../../../app/utils/intlUtils';
import { IListepanelerProps, ListeComponent, Listepaneler } from '../../../app/søknader/pleiepenger/Listepaneler';
// import intlHelper from 'app/utils/intlUtils';

jest.mock('react-intl');
jest.mock('app/utils/intlUtils');

interface ITestItem {
    test: string;
}

const testItem0: ITestItem = { test: 'abc' };
const testItem1: ITestItem = { test: 'bca' };
const testItem2: ITestItem = { test: 'cab' };

const testItems: ITestItem[] = [testItem0, testItem1, testItem2];

const testinputid = (itemIndex: number) => `testitem_${itemIndex}_testinput`;

const testkomponent: ListeComponent<ITestItem> = (
    info: ITestItem,
    itemIndex: number,
    updateListeinfoInSoknad: (info: Partial<ITestItem>) => any,
    updateListeinfoInSoknadState: (info: Partial<ITestItem>, showStatus: boolean) => any,
    feilkodeprefiksMedIndeks?: string,
) => (
    <TextField
        label=""
        id={testinputid(itemIndex)}
        className="testinput"
        value={info.test}
        onChange={(event) => updateListeinfoInSoknadState({ test: event.target.value }, false)}
        onBlur={(event) => updateListeinfoInSoknad({ test: event.target.value })}
        error={feilkodeprefiksMedIndeks ? `Feilmelding med kode ${feilkodeprefiksMedIndeks}` : undefined}
    />
);

const initialitemtest: ITestItem = { test: 'cba' };

const setupListepaneler = (listepanelerPropsPartial?: Partial<IListepanelerProps<ITestItem>>) => {
    const listepanelerProps: IListepanelerProps<ITestItem> = {
        items: testItems,
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
        initialItem: initialitemtest,
        panelid: (index: number) => `testitem_${index}`,
        component: testkomponent,
        editSoknad: jest.fn(),
        editSoknadState: jest.fn(),
        kanHaFlere: true,
        medSlettKnapp: true,
        ...listepanelerPropsPartial,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return shallow(<Listepaneler {...listepanelerProps} />);
};

describe('Listepaneler', () => {
    it('Viser riktig antall listeelementer', () => {
        const listepaneler = setupListepaneler();
        expect(listepaneler.find('.listepanel')).toHaveLength(testItems.length);
    });

    it('Legger til et listeelement', () => {
        const editSoknadState = jest.fn();
        const editSoknad = jest.fn();
        const listepaneler = setupListepaneler({ editSoknadState, editSoknad });
        listepaneler.find('.leggtillisteelementknapp').simulate('click');
        expect(editSoknadState).toHaveBeenCalledTimes(1);
        expect(editSoknadState).toHaveBeenCalledWith(expect.arrayContaining([...testItems, initialitemtest]));
        expect(editSoknad).toHaveBeenCalledTimes(1);
        expect(editSoknad).toHaveBeenCalledWith(expect.arrayContaining([...testItems, initialitemtest]));
    });

    it('Fjerner et listeelement', () => {
        const editSoknadState = jest.fn();
        const editSoknad = jest.fn();
        const listepaneler = setupListepaneler({ editSoknadState, editSoknad });
        listepaneler.find('#testitem_1 .fjernlisteelementknapp').simulate('click');
        expect(editSoknadState).toHaveBeenCalledTimes(1);
        expect(editSoknadState).toHaveBeenCalledWith(expect.not.arrayContaining([testItem1]));
        expect(editSoknad).toHaveBeenCalledTimes(1);
        expect(editSoknad).toHaveBeenCalledWith(expect.not.arrayContaining([testItem1]));
    });

    it('Viser infokomponent i listeelement', () => {
        const listepaneler = setupListepaneler();
        expect(listepaneler.find('.testinput')).toHaveLength(testItems.length);
        expect(listepaneler.find(`#${testinputid(1)}`)).toHaveLength(1);
        expect(listepaneler.find(`#${testinputid(1)}`).prop('value')).toEqual(testItems[1].test);
    });

    it('Viser feilmelding i infokomponent', () => {
        const feilkodeprefiks = 'test';
        const listepaneler = setupListepaneler({ feilkodeprefiks });
        expect(listepaneler.find('.testinput')).toHaveLength(testItems.length);
        expect(listepaneler.find(`#${testinputid(1)}`)).toHaveLength(1);
        expect(listepaneler.find(`#${testinputid(1)}`).prop('error')).toEqual(
            `Feilmelding med kode ${feilkodeprefiks}`,
        );
    });

    it('Kaller updateListeinfoInSoknadState med ny verdi', () => {
        const editSoknadState = jest.fn();
        const listepaneler = setupListepaneler({ editSoknadState });
        const newValue = 'Hihihi';
        listepaneler.find(`#${testinputid(1)}`).simulate('change', { target: { value: newValue } });
        expect(editSoknadState).toHaveBeenCalledTimes(1);
        expect(editSoknadState).toHaveBeenCalledWith(
            expect.arrayContaining([{ ...testItems[1], test: newValue }]),
            false,
        );
    });

    it('Kaller updateListeinfoInSoknad med ny verdi', () => {
        const editSoknad = jest.fn();
        const listepaneler = setupListepaneler({ editSoknad });
        const newValue = 'Hihihi';
        listepaneler.find(`#${testinputid(1)}`).simulate('blur', { target: { value: newValue } });
        expect(editSoknad).toHaveBeenCalledTimes(1);
        expect(editSoknad).toHaveBeenCalledWith(expect.arrayContaining([{ ...testItems[1], test: newValue }]));
    });

    it('Gir egendefinert klassenavn til alle listepaneler', () => {
        const panelClassName = 'rattata';
        const listepaneler = setupListepaneler({ panelClassName });
        listepaneler
            .find('Panel')
            .forEach((panel) => expect(panel.prop('className')).toEqual(`listepanel ${panelClassName}`));
    });

    it('Kaller onAdd når et listeelement legges til', () => {
        const onAdd = jest.fn();
        const listepaneler = setupListepaneler({ onAdd });
        listepaneler.find('.leggtillisteelementknapp').simulate('click');
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('Kaller onRemove når en periode fjernes', () => {
        const onRemove = jest.fn();
        const listepaneler = setupListepaneler({ onRemove });
        listepaneler.find('#testitem_1 .fjernlisteelementknapp').simulate('click');
        expect(onRemove).toHaveBeenCalledTimes(1);
    });
});
