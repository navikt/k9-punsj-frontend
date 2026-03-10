import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LegacyJaNeiRadioGroup } from 'app/components/legacy-form-compat/radio';
import { JaNei } from 'app/models/enums';
import { renderWithIntl } from '../../testUtils';

describe('LegacyJaNeiRadioGroup', () => {
    it('changes selected value in controlled mode', async () => {
        const user = userEvent.setup();

        const ControlledGroup = () => {
            const [checked, setChecked] = React.useState<JaNei>(JaNei.NEI);

            return (
                <LegacyJaNeiRadioGroup
                    name="ja-nei-group"
                    legend="Er søker riktig?"
                    checked={checked}
                    onChange={(_, value) => setChecked(value)}
                />
            );
        };

        renderWithIntl(<ControlledGroup />);

        const yes = screen.getByLabelText('Ja') as HTMLInputElement;
        const no = screen.getByLabelText('Nei') as HTMLInputElement;

        expect(no.checked).toBe(true);
        expect(yes.checked).toBe(false);

        await user.click(yes);
        expect(yes.checked).toBe(true);
        expect(no.checked).toBe(false);
    });

    it('supports disabling nei and preserves data-test-id prefix', () => {
        renderWithIntl(
            <LegacyJaNeiRadioGroup
                name="ja-nei-group-disabled"
                legend="Er søker riktig?"
                checked={JaNei.JA}
                disabledNei
                dataTestIdPrefix="bekreftSøker"
                onChange={() => undefined}
            />,
        );

        const yes = document.querySelector('[data-test-id="bekreftSøker-ja"]') as HTMLInputElement;
        const no = document.querySelector('[data-test-id="bekreftSøker-nei"]') as HTMLInputElement;

        expect(yes).toBeTruthy();
        expect(no).toBeTruthy();
        expect(no.disabled).toBe(true);
    });
});
