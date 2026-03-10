import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LegacyRadioGroup } from 'app/components/legacy-form-compat/radio';

describe('LegacyRadioGroup', () => {
    it('changes selected value between options in controlled mode', async () => {
        const user = userEvent.setup();

        const ControlledGroup = () => {
            const [checked, setChecked] = React.useState('nei');

            return (
                <LegacyRadioGroup
                    name="test-radio-group"
                    legend="Er dokumentet signert?"
                    retning="horisontal"
                    checked={checked}
                    radios={[
                        { label: 'Ja', value: 'ja' },
                        { label: 'Nei', value: 'nei' },
                    ]}
                    onChange={(_, value) => setChecked(value)}
                />
            );
        };

        render(<ControlledGroup />);

        const yes = screen.getByLabelText('Ja') as HTMLInputElement;
        const no = screen.getByLabelText('Nei') as HTMLInputElement;

        expect(no.checked).toBe(true);
        expect(yes.checked).toBe(false);

        await user.click(yes);
        expect(yes.checked).toBe(true);
        expect(no.checked).toBe(false);

        await user.click(no);
        expect(no.checked).toBe(true);
        expect(yes.checked).toBe(false);
    });

    it('changes selected value between options in horizontal three-option setup', async () => {
        const user = userEvent.setup();

        const ControlledGroup = () => {
            const [checked, setChecked] = React.useState('nei');

            return (
                <LegacyRadioGroup
                    name="test-radio-group-three"
                    legend="Har søker opphold i utlandet?"
                    retning="horisontal"
                    checked={checked}
                    radios={[
                        { label: 'Ja', value: 'ja' },
                        { label: 'Nei', value: 'nei' },
                        { label: 'Ikke opplyst', value: 'ikke-opplyst' },
                    ]}
                    onChange={(_, value) => setChecked(value)}
                />
            );
        };

        render(<ControlledGroup />);

        const yes = screen.getByLabelText('Ja') as HTMLInputElement;
        const no = screen.getByLabelText('Nei') as HTMLInputElement;
        const unknown = screen.getByLabelText('Ikke opplyst') as HTMLInputElement;

        expect(no.checked).toBe(true);

        await user.click(yes);
        expect(yes.checked).toBe(true);
        expect(no.checked).toBe(false);

        await user.click(unknown);
        expect(unknown.checked).toBe(true);
        expect(yes.checked).toBe(false);
    });
});
