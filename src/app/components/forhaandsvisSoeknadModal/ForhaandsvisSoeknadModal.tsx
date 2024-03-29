import classNames from 'classnames';
import React from 'react';
import { IntlShape } from 'react-intl';

import { Button, Modal } from '@navikt/ds-react';

import intlHelper from 'app/utils/intlUtils';

type OwnProps = {
    children: JSX.Element | null;
    videre: () => void;
    avbryt: () => void;
    intl: IntlShape;
};

const ForhaandsvisSoeknadModal = ({ videre, avbryt, intl, children }: OwnProps) => (
    <Modal
        key="validertSoknadModal"
        className="validertSoknadModal"
        onClose={avbryt}
        aria-label="validertSoknadModal"
        open
    >
        <Modal.Body>
            <div className={classNames('validertSoknadOppsummeringContainer')}>{children}</div>
            <div className={classNames('validertSoknadOppsummeringContainerKnapper')}>
                <Button size="small" className="validertSoknadOppsummeringContainer_knappVidere" onClick={videre}>
                    {intlHelper(intl, 'fordeling.knapp.videre')}
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    className="validertSoknadOppsummeringContainer_knappTilbake"
                    onClick={avbryt}
                >
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Button>
            </div>
        </Modal.Body>
    </Modal>
);

export default ForhaandsvisSoeknadModal;
