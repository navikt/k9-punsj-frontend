import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button, Modal } from '@navikt/ds-react';
import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';

import { getEnvironmentVariable } from '../../utils';
import { initializeDate } from '../../utils/timeUtils';

import './okGåTilLosModal.less';

interface Props {
    meldingId: string;
    onClose: () => void;
}

const getDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

const utledMelding = (mld: string) => {
    if (mld === 'modal.settpaavent.til') {
        return <FormattedMessage id={mld} values={{ dato: getDate() }} />;
    }
    return <FormattedMessage id={mld} />;
};

const OkGåTilLosModal = ({ meldingId, onClose }: Props) => {
    return (
        <Modal
            key="settpaaventokmodal"
            onClose={onClose}
            aria-label="settpaaventokmodal"
            data-test-id="okGåTilLosModal"
            open
        >
            <Modal.Body>
                <div className="ok-gaa-til-los" data-testid="ok-gaa-til-los-modal">
                    <CheckmarkCircleFillIcon className="successIcon-gå-to-los" title="check" />

                    <div className="vl-gå-to-los" />

                    <div className="info-gå-to-los" data-test-id="okGåTilLosModalInfo">
                        <div>{utledMelding(meldingId)}</div>

                        <FormattedMessage id="modal.okgaatillos.tillos" />
                    </div>

                    <Button
                        className="okknapp-gå-to-los"
                        size="small"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                        data-test-id="okGåTilLosModalOKBtn"
                    >
                        <FormattedMessage id="modal.okgaatillos.ok" />
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default OkGåTilLosModal;
