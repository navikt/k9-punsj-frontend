import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NewDateInput from '../../../app/components/skjema/NewDateInput/NewDateInput';

describe('NewDateInput', () => {
    it('commits the typed value on blur after the parent syncs the controlled value', async () => {
        const user = userEvent.setup();
        const onBlur = jest.fn();

        const TestHarness = () => {
            const [value, setValue] = React.useState('2020-10-12');

            return (
                <NewDateInput
                    label="Mottatt dato"
                    value={value}
                    onChange={setValue}
                    onBlur={onBlur}
                    dataTestId="new-date-input"
                />
            );
        };

        render(<TestHarness />);

        const input = screen.getByTestId('new-date-input');
        await user.clear(input);
        await user.type(input, '14.03.2020');
        await user.tab();

        expect(onBlur).toHaveBeenCalledTimes(1);
        expect(onBlur).toHaveBeenCalledWith('2020-03-14');
        expect(input).toHaveValue('14.03.2020');
    });
});
