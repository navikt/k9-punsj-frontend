import React from 'react';

import { Form, Formik } from 'formik';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LegacyJaNeiIkkeOpplystRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeOpplystRadioGroupFormik';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { renderWithIntl } from '../../testUtils';

describe('LegacyJaNeiIkkeOpplystRadioGroupFormik', () => {
    it('updates field value', async () => {
        const user = userEvent.setup();

        renderWithIntl(
            <Formik initialValues={{ medlemskap: JaNeiIkkeOpplyst.NEI }} onSubmit={() => undefined}>
                {({ values }) => (
                    <Form>
                        <LegacyJaNeiIkkeOpplystRadioGroupFormik name="medlemskap" legend="Medlemskap" />
                        <div data-testid="value">{values.medlemskap}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe(JaNeiIkkeOpplyst.NEI);

        await user.click(screen.getByLabelText('Ikke opplyst'));
        expect(screen.getByTestId('value').textContent).toBe(JaNeiIkkeOpplyst.IKKE_OPPLYST);
    });
});
