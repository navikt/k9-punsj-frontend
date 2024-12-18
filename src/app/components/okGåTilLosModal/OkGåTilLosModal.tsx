import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button, Modal } from '@navikt/ds-react';
import CheckCircleSvg from '../../assets/SVG/CheckCircleSVG';
import { getEnvironmentVariable } from '../../utils';
import { initializeDate } from '../../utils/timeUtils';

import './okGåTilLosModal.less';

interface Props {
    melding: string;
    onClose: () => void;
}

const getDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

const utledMelding = (mld: string) => {
    if (mld === 'modal.settpaavent.til') {
        return <FormattedMessage id={mld} values={{ dato: getDate() }} />;
    }
    return <FormattedMessage id={mld} />;
};

const OkGåTilLosModal = ({ melding, onClose }: Props) => {
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
                    <CheckCircleSvg title="check" />

                    <div className="vl" />

                    <div className="info" data-test-id="okGåTilLosModalInfo">
                        <div className="flex flex-wrap">{utledMelding(melding)}</div>

                        <div className="flex flex-wrap">
                            <FormattedMessage id="modal.okgaatillos.tillos" />
                        </div>
                    </div>

                    <Button
                        className="okknapp"
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
