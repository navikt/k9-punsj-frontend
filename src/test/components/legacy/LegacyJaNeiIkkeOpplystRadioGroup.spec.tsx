import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LegacyJaNeiIkkeOpplystRadioGroup } from 'app/components/legacy-form-compat/radio';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { renderWithIntl } from '../../testUtils';

describe('LegacyJaNeiIkkeOpplystRadioGroup', () => {
    it('changes selected value in controlled mode', async () => {
        const user = userEvent.setup();

        const ControlledGroup = () => {
            const [checked, setChecked] = React.useState<JaNeiIkkeOpplyst>(JaNeiIkkeOpplyst.NEI);

            return (
                <LegacyJaNeiIkkeOpplystRadioGroup
                    name="ja-nei-ikke-opplyst-group"
                    legend="Medlemskap"
                    checked={checked}
                    onChange={(_, value) => setChecked(value)}
                />
            );
        };

        renderWithIntl(<ControlledGroup />);

        const no = screen.getByLabelText('Nei') as HTMLInputElement;
        const unknown = screen.getByLabelText('Ikke opplyst') as HTMLInputElement;

        expect(no.checked).toBe(true);
        expect(unknown.checked).toBe(false);

        await user.click(unknown);
        expect(no.checked).toBe(false);
        expect(unknown.checked).toBe(true);
    });
});
