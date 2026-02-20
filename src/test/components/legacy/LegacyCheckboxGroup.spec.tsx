import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LegacyCheckboxGroup } from 'app/components/legacy-form-compat/checkbox';

describe('LegacyCheckboxGroup', () => {
    it('toggles multiple values in controlled mode', async () => {
        const user = userEvent.setup();

        const ControlledGroup = () => {
            const [checked, setChecked] = React.useState<string[]>(['arbeidstaker']);

            return (
                <LegacyCheckboxGroup
                    name="test-checkbox-group"
                    legend="Velg arbeidssituasjon"
                    checked={checked}
                    checkboxes={[
                        { label: 'Arbeidstaker', value: 'arbeidstaker' },
                        { label: 'Frilanser', value: 'frilanser' },
                        { label: 'Selvstendig næringsdrivende', value: 'selvstendig-naeringsdrivende' },
                    ]}
                    onChange={(_, __, checkedValues) => setChecked(checkedValues)}
                />
            );
        };

        render(<ControlledGroup />);

        const arbeidstaker = screen.getByLabelText('Arbeidstaker') as HTMLInputElement;
        const frilanser = screen.getByLabelText('Frilanser') as HTMLInputElement;
        const selvstendig = screen.getByLabelText('Selvstendig næringsdrivende') as HTMLInputElement;

        expect(arbeidstaker.checked).toBe(true);
        expect(frilanser.checked).toBe(false);
        expect(selvstendig.checked).toBe(false);

        await user.click(frilanser);
        expect(arbeidstaker.checked).toBe(true);
        expect(frilanser.checked).toBe(true);

        await user.click(arbeidstaker);
        expect(arbeidstaker.checked).toBe(false);
        expect(frilanser.checked).toBe(true);
    });

    it('calls onChange with value and checked values', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <LegacyCheckboxGroup
                name="test-checkbox-group-callback"
                legend="Velg arbeidssituasjon"
                defaultChecked={['arbeidstaker']}
                checkboxes={[
                    { label: 'Arbeidstaker', value: 'arbeidstaker' },
                    { label: 'Frilanser', value: 'frilanser' },
                ]}
                onChange={onChange}
            />,
        );

        await user.click(screen.getByLabelText('Frilanser'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(expect.any(Object), 'frilanser', ['arbeidstaker', 'frilanser']);
    });
});
