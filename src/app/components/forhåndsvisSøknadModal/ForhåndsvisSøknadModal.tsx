import React from 'react';

import { Button } from '@navikt/ds-react';
import { PunsjDialog } from 'app/components/PunsjDialog';
import { FormattedMessage } from 'react-intl';

interface Props {
    children: JSX.Element | null;
    dataTestId: string;
    videre: () => void;
    avbryt: () => void;
}

const ForhåndsvisSøknadModal = ({ children, dataTestId, videre, avbryt }: Props) => (
    <PunsjDialog
        key="validertSoknadModal"
        aria-label="validertSoknadModal"
        data-testid={dataTestId}
        onOpenChange={(nextOpen) => !nextOpen && avbryt()}
        open
    >
        <PunsjDialog.Header withClosebutton={false}>
            <PunsjDialog.Title>
                <FormattedMessage id="skjema.kvittering.oppsummering" />
            </PunsjDialog.Title>
        </PunsjDialog.Header>

        <PunsjDialog.Body>{children}</PunsjDialog.Body>

        <PunsjDialog.Footer>
            <Button size="small" onClick={videre} data-testid="videreKnapp">
                <FormattedMessage id="skjema.knapp.videre" />
            </Button>

            <Button variant="secondary" size="small" onClick={avbryt} data-testid="avbrytKnapp">
                <FormattedMessage id="skjema.knapp.avbryt" />
            </Button>
        </PunsjDialog.Footer>
    </PunsjDialog>
);

export default ForhåndsvisSøknadModal;
