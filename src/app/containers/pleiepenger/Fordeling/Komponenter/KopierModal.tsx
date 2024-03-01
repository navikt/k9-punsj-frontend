import React, { useState } from 'react';

import { Button, Heading, Modal } from '@navikt/ds-react';
import { FormattedMessage, IntlShape } from 'react-intl';

import { IFellesState } from 'app/state/reducers/FellesReducer';
import JournalPostKopiFelmeldinger from './JournalPostKopiFelmeldinger';

interface OwnProps {
    søkerId: string;
    pleietrengendeId: string;
    journalpostId: string;
    dedupkey: string;
    intl: IntlShape;
    fellesState: IFellesState;
    kopiereJournalpostUtenBarn: (
        søkerId: string,
        pleietrengendeId: string,
        journalpostId: string,
        dedupkey: string,
    ) => void;
    lukkModal: () => void;
}

const KopierModal = ({
    søkerId,
    pleietrengendeId,
    journalpostId,
    dedupkey,
    intl,
    fellesState,
    kopiereJournalpostUtenBarn,
    lukkModal,
}: OwnProps) => {
    const [kopierLoading, setKopierLoading] = useState(false);

    const handleKopier = () => {
        setKopierLoading(true);
        kopiereJournalpostUtenBarn(søkerId, pleietrengendeId, journalpostId, dedupkey);
        // TODO
        setKopierLoading(false);
    };

    return (
        <Modal open onBeforeClose={lukkModal} aria-labelledby="modal-heading">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading">
                    <FormattedMessage id="fordeling.klassifiserModal.tittel" />
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <>
                    <div>
                        Den nye Journalposten vil bli kopiert og journalført mot eksisterende fagsak (id) for
                        pleietrengende med id: {pleietrengendeId} Denne journalposten vil bli lukket.
                    </div>
                    <JournalPostKopiFelmeldinger fellesState={fellesState} intl={intl} />
                </>
            </Modal.Body>
            <Modal.Footer>
                {fellesState.kopierJournalpostSuccess ? (
                    <Button size="small" onClick={lukkModal}>
                        Ok
                    </Button>
                ) : (
                    <>
                        <Button type="button" disabled={kopierLoading} onClick={handleKopier} size="small">
                            Kopier
                        </Button>
                        <Button
                            type="button"
                            onClick={lukkModal}
                            disabled={kopierLoading}
                            size="small"
                            variant="secondary"
                        >
                            <FormattedMessage id="fordeling.klassifiserModal.btn.avbryt" />
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default KopierModal;
