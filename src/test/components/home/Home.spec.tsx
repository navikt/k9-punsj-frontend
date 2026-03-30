import React from 'react';

import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';

import { Home } from 'app/home/Home';
import { renderWithIntl } from '../../testUtils';

describe('Home', () => {
    it('shows generic error alert when journalpost request error has no message', () => {
        const store = createStore(() => ({
            felles: {
                dedupKey: 'dedup-key',
                journalpostRequestError: {
                    statusText: 'Nettverksfeil',
                },
            },
            fordelingState: {
                lukkOppgaveDone: false,
            },
        }));

        renderWithIntl(
            <Provider store={store}>
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Noe gikk galt')).toBeInTheDocument();
    });
});
