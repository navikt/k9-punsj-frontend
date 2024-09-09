import React, { useEffect, useState } from 'react';

import { Alert, Button, Heading, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { IFellesState } from 'app/state/reducers/FellesReducer';

import { lukkJournalpostEtterKopiering } from 'app/api/api';
import { useMutation } from 'react-query';
import { getEnvironmentVariable } from 'app/utils';
import JournalPostKopiFelmeldinger from './JournalPostKopiFelmeldinger';

interface OwnProps {
    søkerId: string;
    pleietrengendeId: string;
    journalpostId: string;
    dedupkey: string;
    fellesState: IFellesState;
    fagsakId: string;
    kopiereJournalpostTilSammeSøker: (
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
    fellesState,
    fagsakId,
    kopiereJournalpostTilSammeSøker,
    lukkModal,
}: OwnProps) => {
    const [kopierLoading, setKopierLoading] = useState(false);

    const { mutate, status, error, isSuccess } = useMutation({
        mutationFn: () => lukkJournalpostEtterKopiering(journalpostId, søkerId, fellesState.journalpost?.sak),
    });

    useEffect(() => {
        if (fellesState.kopierJournalpostSuccess) {
            mutate();
        }
    }, [fellesState.kopierJournalpostSuccess]);

    const handleKopier = () => {
        setKopierLoading(true);
        kopiereJournalpostTilSammeSøker(søkerId, pleietrengendeId, journalpostId, dedupkey);
        setKopierLoading(false);
    };

    const disabled = ['loading'].includes(status);

    return (
        <Modal open onClose={lukkModal} aria-labelledby="modal-heading">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading">
                    Vil du kopiere og lukke journalposten?
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <>
                    <div>
                        Den nye Journalposten vil bli kopiert og journalført mot eksisterende fagsak {fagsakId} for
                        pleietrengende med id: {pleietrengendeId}. Denne journalposten vil bli lukket.
                    </div>
                    <JournalPostKopiFelmeldinger fellesState={fellesState} />
                    {isSuccess && (
                        <div>
                            <Alert size="small" variant="success">
                                Journalposten ble lukket
                            </Alert>
                        </div>
                    )}
                    {!!error && (
                        <div>
                            <Alert size="small" variant="warning">
                                Error ved lukking av journalpost
                            </Alert>
                        </div>
                    )}
                </>
            </Modal.Body>
            <Modal.Footer>
                {fellesState.kopierJournalpostSuccess ? (
                    <Button
                        size="small"
                        disabled={disabled}
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        <FormattedMessage id="tilbaketilLOS" />
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
