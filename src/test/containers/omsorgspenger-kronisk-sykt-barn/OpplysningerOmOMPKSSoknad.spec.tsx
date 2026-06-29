import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';

import OpplysningerOmOMPKSSoknad from 'app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OpplysningerOmSoknad/OpplysningerOmOMPKSSoknad';

const renderComponent = (showFieldErrorsAfterSubmit = false) =>
    render(
        <IntlProvider locale="nb">
            <OpplysningerOmOMPKSSoknad
                intl={{
                    formatMessage: ({ id }: { id: string }) => id,
                } as any}
                changeAndBlurUpdatesSoknad={() => ({
                    onChange: jest.fn(),
                    onBlur: jest.fn(),
                })}
                getErrorMessage={(attribute: string) => (attribute === 'klokkeslett' ? 'Påkrevd' : undefined)}
                setSignaturAction={jest.fn()}
                signert={null}
                showFieldErrorsAfterSubmit={showFieldErrorsAfterSubmit}
                soknad={
                    {
                        mottattDato: '',
                        klokkeslett: '',
                    } as any
                }
            />
        </IntlProvider>,
    );

describe('OpplysningerOmOMPKSSoknad', () => {
    it('hides klokkeslett error until blur', async () => {
        const user = userEvent.setup();

        renderComponent(false);

        expect(screen.queryByText('Påkrevd')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('skjema.mottatt.klokkeslett'));
        await user.tab();

        expect(screen.getByText('Påkrevd')).toBeInTheDocument();
    });

    it('shows klokkeslett error immediately after submit attempt', () => {
        renderComponent(true);

        expect(screen.getByText('Påkrevd')).toBeInTheDocument();
    });
});
