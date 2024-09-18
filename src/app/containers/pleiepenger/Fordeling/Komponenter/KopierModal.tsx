import React, { useEffect, useState } from 'react';

import { Alert, Button, Heading, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { kopierJournalpostTilSammeSøker } from 'app/state/reducers/FellesReducer';

import { lukkJournalpostEtterKopiering } from 'app/api/api';
import { useMutation } from 'react-query';
import { getEnvironmentVariable, getForkortelseFraFordelingDokumenttype } from 'app/utils';
import JournalPostKopiFelmeldinger from './JournalPostKopiFelmeldinger';
import { useDispatch, useSelector } from 'react-redux';
import { RootStateType } from 'app/state/RootState';
import { DokumenttypeForkortelse } from 'app/models/enums';
import { Dispatch } from 'redux';

interface Props {
    søkerId: string;
    pleietrengendeId: string;
    journalpostId: string;
    dedupkey: string;
    fagsakId: string;

    lukkModal: () => void;
}

const KopierModal = ({ søkerId, pleietrengendeId, journalpostId, dedupkey, fagsakId, lukkModal }: Props) => {
    const [kopierLoading, setKopierLoading] = useState(false);

    const dispatch = useDispatch<Dispatch<any>>();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const fellesState = useSelector((state: RootStateType) => state.felles);

    const { mutate, status, error, isSuccess } = useMutation({
        mutationFn: () => lukkJournalpostEtterKopiering(journalpostId, søkerId, fellesState.journalpost?.sak),
    });

    const ytelseForKopiering =
        fordelingState.dokumenttype && getForkortelseFraFordelingDokumenttype(fordelingState.dokumenttype);

    useEffect(() => {
        if (fellesState.kopierJournalpostSuccess) {
            mutate();
        }
    }, [fellesState.kopierJournalpostSuccess]);

    const kopier = () =>
        dispatch(
            kopierJournalpostTilSammeSøker(søkerId, pleietrengendeId, journalpostId, dedupkey, ytelseForKopiering),
        );

    const handleKopier = () => {
        setKopierLoading(true);
        kopier();
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
