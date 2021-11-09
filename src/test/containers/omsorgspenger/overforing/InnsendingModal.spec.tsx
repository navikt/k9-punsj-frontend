import Modal from 'nav-frontend-modal';
import React from 'react';
import InnsendingModal from '../../../../app/containers/omsorgspenger/overforing/InnsendingModal';
import { Innsendingsstatus } from '../../../../app/models/forms/omsorgspenger/overføring/PunchSkjema';
import { renderWithIntl } from '../../../testUtils';

Modal.setAppElement(document.createElement('div'));

describe('<InnsendingModal>', () => {
    test('Viser spinner når den laster', () => {
        const { getByRole } = renderWithIntl(
            <InnsendingModal
                innsendingsstatus={Innsendingsstatus.SenderInn}
                vis
                onRequestClose={() => undefined}
            />
        );

        const spinner = getByRole('status');

        expect(spinner).toBeDefined();
    });
});
