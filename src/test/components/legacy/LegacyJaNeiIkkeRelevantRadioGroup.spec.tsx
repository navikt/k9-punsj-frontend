import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { renderWithIntl } from '../../testUtils';

describe('LegacyJaNeiIkkeRelevantRadioGroup', () => {
    it('changes selected value in controlled mode', async () => {
        const user = userEvent.setup();

        const ControlledGroup = () => {
            const [checked, setChecked] = React.useState<JaNeiIkkeRelevant>(JaNeiIkkeRelevant.NEI);

            return (
                <LegacyJaNeiIkkeRelevantRadioGroup
                    name="ja-nei-ikke-relevant-group"
                    legend="Signatur"
                    checked={checked}
                    onChange={(_, value) => setChecked(value)}
                />
            );
        };

        renderWithIntl(<ControlledGroup />);

        const no = screen.getByLabelText('Nei') as HTMLInputElement;
        const notRelevant = screen.getByLabelText('Ikke relevant') as HTMLInputElement;

        expect(no.checked).toBe(true);
        expect(notRelevant.checked).toBe(false);

        await user.click(notRelevant);
        expect(no.checked).toBe(false);
        expect(notRelevant.checked).toBe(true);
    });
});
