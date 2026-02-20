import React from 'react';

import { render, screen } from '@testing-library/react';

import { LegacyRadio } from 'app/components/legacy-form-compat/radio';

describe('LegacyRadio', () => {
    it('sets checked state on input when checked prop is true', () => {
        render(
            <LegacyRadio
                name="legacy-radio-single"
                value="ja"
                label="Ja"
                checked
                onChange={() => undefined}
            />,
        );

        const input = screen.getByLabelText('Ja') as HTMLInputElement;
        expect(input.checked).toBe(true);
    });
});
