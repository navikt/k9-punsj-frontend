import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button, Modal } from '@navikt/ds-react';

interface Props {
    children: JSX.Element | null;
    dataTestId: string;
    videre: () => void;
    avbryt: () => void;
}

const ForhåndsvisSøknadModal = ({ children, dataTestId, videre, avbryt }: Props) => (
    <Modal key="validertSoknadModal" aria-label="validertSoknadModal" data-test-id={dataTestId} onClose={avbryt} open>
        <Modal.Body>{children}</Modal.Body>

        <Modal.Footer>
            <Button size="small" className="validertSoknadOppsummeringContainer_knappVidere" onClick={videre}>
                <FormattedMessage id="fordeling.knapp.videre" />
            </Button>

            <Button
                variant="secondary"
                size="small"
                className="validertSoknadOppsummeringContainer_knappTilbake"
                onClick={avbryt}
            >
                <FormattedMessage id="skjema.knapp.avbryt" />
            </Button>
        </Modal.Footer>
    </Modal>
);

export default ForhåndsvisSøknadModal;
