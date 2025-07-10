import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button, Heading, Modal } from '@navikt/ds-react';

interface Props {
    children: JSX.Element | null;
    dataTestId: string;
    videre: () => void;
    avbryt: () => void;
}

const ForhåndsvisSøknadModal = ({ children, dataTestId, videre, avbryt }: Props) => (
    <Modal key="validertSoknadModal" aria-label="validertSoknadModal" data-test-id={dataTestId} onClose={avbryt} open>
        <Modal.Header closeButton={false}>
            <Heading size="medium" level="1">
                <FormattedMessage id="skjema.kvittering.oppsummering" />
            </Heading>
        </Modal.Header>

        <Modal.Body>{children}</Modal.Body>

        <Modal.Footer>
            <Button size="small" onClick={videre}>
                <FormattedMessage id="skjema.knapp.videre" />
            </Button>

            <Button variant="secondary" size="small" onClick={avbryt}>
                <FormattedMessage id="skjema.knapp.avbryt" />
            </Button>
        </Modal.Footer>
    </Modal>
);

export default ForhåndsvisSøknadModal;
