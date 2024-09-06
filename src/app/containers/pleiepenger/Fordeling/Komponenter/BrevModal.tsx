import React from 'react';

import { Button, Heading, Modal } from '@navikt/ds-react';
import BrevComponent from 'app/components/brev/BrevComponent';
import { DokumenttypeForkortelse } from 'app/models/enums';
import { FormattedMessage } from 'react-intl';

interface Props {
    open: boolean;
    journalpostId: string;
    fagsakId: string;
    søkerId: string;
    sakstype: DokumenttypeForkortelse; //TODO sjekk type

    onClose: () => void;
}

const BrevModal: React.FC<Props> = ({ open, journalpostId, fagsakId, søkerId, sakstype, onClose }: Props) => {
    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                    <FormattedMessage id="fordeling.brevModal.tittel" />
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <div className="min-w-[624px] max-w-[624px]">
                    <BrevComponent
                        søkerId={søkerId}
                        sakstype={sakstype}
                        fagsakId={fagsakId}
                        journalpostId={journalpostId}
                        brevSendtCallback={() => null}
                        sendBrevUtenModal={true}
                        brevFraModal={true}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" onClick={onClose} size="small" variant="secondary" data-test-id="brevModalAvbryt">
                    <FormattedMessage id="fordeling.journalført.brevModal.avbryt.btn" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BrevModal;
