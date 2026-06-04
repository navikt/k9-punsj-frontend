import React from 'react';

import { Form, Formik } from 'formik';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Periodepanel } from '../../../app/søknader/korrigeringAvInntektsmelding/components/Periodepanel';
import { getFormErrors } from '../../../app/søknader/korrigeringAvInntektsmelding/containers/korrigeringAvFormValidering';
import { KorrigeringAvInntektsmeldingFormFields } from '../../../app/søknader/korrigeringAvInntektsmelding/types/KorrigeringAvInntektsmeldingFormFieldsValues';
import { renderWithIntl } from '../../testUtils';

const initialValues = {
    OpplysningerOmKorrigering: { dato: '2026-02-01', klokkeslett: '10:00' },
    Virksomhet: '999999999',
    ArbeidsforholdId: '',
    Trekkperioder: [{ fom: '', tom: '' }],
    PerioderMedRefusjonskrav: [{ fom: '', tom: '' }],
    DagerMedDelvisFravær: [{ dato: '', timer: '' }],
};

const renderPeriodepanel = () =>
    renderWithIntl(
        <Formik initialValues={initialValues} validate={getFormErrors} onSubmit={() => undefined}>
            <Form>
                <Periodepanel name={KorrigeringAvInntektsmeldingFormFields.Trekkperioder} />
                <button type="submit">Send inn</button>
            </Form>
        </Formik>,
    );

describe('KorrigeringAvInntektsmelding Periodepanel', () => {
    it('does not show the TOM error while the user is only typing the FOM field', async () => {
        const user = userEvent.setup();

        renderPeriodepanel();

        const fomInput = screen.getByLabelText('Fra og med');
        await user.type(fomInput, '01.03.2020');

        expect(screen.queryByText('Til og med (TOM) må være satt.')).not.toBeInTheDocument();
    });

    it('shows the TOM error text after submit when only the FOM field is filled', async () => {
        const user = userEvent.setup();

        renderPeriodepanel();

        const fomInput = screen.getByLabelText('Fra og med');
        await user.type(fomInput, '01.03.2020');
        await user.click(screen.getByRole('button', { name: 'Send inn' }));

        expect(await screen.findByText('Til og med (TOM) må være satt.')).toBeInTheDocument();
    });
});
