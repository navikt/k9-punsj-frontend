import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from '@navikt/ds-react';
import { IntlShape, createIntl } from 'react-intl';
import intlHelper from '../../../app/utils/intlUtils';
import { IListepanelerProps, ListeComponent, Listepaneler } from '../../../app/components/Listepaneler';
import '@testing-library/jest-dom';

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

const renderListepaneler = (propsPartial: Partial<IListepanelerProps<ITestItem>> = {}) => {
    const props: IListepanelerProps<ITestItem> = {
        items: testItems,
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
        initialItem: initialitemtest,
        panelid: (index: number) => `testitem_${index}`,
        component: testkomponent,
        editSoknad: jest.fn(),
        editSoknadState: jest.fn(),
        kanHaFlere: true,
        medSlettKnapp: true,
        ...propsPartial,
    };

    jest.mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return render(<Listepaneler {...props} />);
};

describe('Listepaneler', () => {
    it('displays the correct number of list elements', () => {
        renderListepaneler();
        expect(screen.getAllByRole('textbox')).toHaveLength(testItems.length);
    });

    it('adds a list element', async () => {
        const editSoknadState = jest.fn();
        const editSoknad = jest.fn();
        renderListepaneler({ editSoknadState, editSoknad });
        const addButton = screen.getByTestId('leggtillisteelementknapp');

        await userEvent.click(addButton);

        expect(editSoknadState).toHaveBeenCalledWith(expect.arrayContaining([...testItems, initialitemtest]));
        expect(editSoknad).toHaveBeenCalledWith(expect.arrayContaining([...testItems, initialitemtest]));
    });

    it('removes a list element', async () => {
        const editSoknadState = jest.fn();
        const editSoknad = jest.fn();
        const { container } = renderListepaneler({ editSoknadState, editSoknad });

        const element = container.querySelector('#testitem_1');

        const removeButton = within(element as HTMLElement).getByTestId('fjernlisteelementknapp');

        await userEvent.click(removeButton);

        expect(editSoknadState).toHaveBeenCalledWith(expect.not.arrayContaining([testItem1]));
        expect(editSoknad).toHaveBeenCalledWith(expect.not.arrayContaining([testItem1]));
    });

    it('displays the correct error message in the component', () => {
        const feilkodeprefiks = 'test';
        const { container } = renderListepaneler({ feilkodeprefiks });

        const input = container.querySelector(`#${testinputid(1)}`);

        expect(input).toHaveAttribute('aria-invalid', 'true');

        const errorMessages = screen.getAllByText(`Feilmelding med kode ${feilkodeprefiks}`);

        expect(errorMessages.length).toBeGreaterThan(0);

        errorMessages.forEach((errorMessage) => {
            expect(errorMessage).toBeInTheDocument();
        });
    });

    it('calls updateListeinfoInSoknadState with a new value', async () => {
        const editSoknadState = jest.fn();
        const { container } = renderListepaneler({ editSoknadState });

        const input = container.querySelector(`#${testinputid(1)}`) as HTMLInputElement;
        const newValue = 'Hihihi';

        // Simulate user changing the input value in a single step
        fireEvent.change(input, { target: { value: newValue } });

        // Validate the function call
        expect(editSoknadState).toHaveBeenCalledTimes(1);
        expect(editSoknadState).toHaveBeenCalledWith(
            expect.arrayContaining([{ ...testItems[0] }, { ...testItems[1], test: newValue }, { ...testItems[2] }]),
            false,
        );
    });

    // it('adds a custom class name to all panels', () => {

    it('calls onAdd when a list element is added', async () => {
        const onAdd = jest.fn();
        renderListepaneler({ onAdd });

        const addButton = screen.getByTestId('leggtillisteelementknapp');
        await userEvent.click(addButton);

        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove when a list element is removed', async () => {
        const onRemove = jest.fn();
        const { container } = renderListepaneler({ onRemove });
        const element = container.querySelector('#testitem_1');

        const removeButton = within(element as HTMLElement).getByTestId('fjernlisteelementknapp');

        await userEvent.click(removeButton);

        expect(onRemove).toHaveBeenCalledTimes(1);
    });
});
