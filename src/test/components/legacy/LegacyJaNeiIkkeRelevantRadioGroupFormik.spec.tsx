import React from 'react';

import { Form, Formik } from 'formik';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LegacyJaNeiIkkeRelevantRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiIkkeRelevantRadioGroupFormik';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { renderWithIntl } from '../../testUtils';

describe('LegacyJaNeiIkkeRelevantRadioGroupFormik', () => {
    it('updates field value', async () => {
        const user = userEvent.setup();

        renderWithIntl(
            <Formik initialValues={{ signatur: JaNeiIkkeRelevant.NEI }} onSubmit={() => undefined}>
                {({ values }) => (
                    <Form>
                        <LegacyJaNeiIkkeRelevantRadioGroupFormik name="signatur" legend="Signatur" />
                        <div data-testid="value">{values.signatur}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe(JaNeiIkkeRelevant.NEI);

        await user.click(screen.getByLabelText('Ikke relevant'));
        expect(screen.getByTestId('value').textContent).toBe(JaNeiIkkeRelevant.IKKE_RELEVANT);
    });
});
