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

    const handleKopier = () => {
        setKopierLoading(true);

        dispatch(
            kopierJournalpostTilSammeSøker(søkerId, pleietrengendeId, journalpostId, dedupkey, ytelseForKopiering),
        );

        setKopierLoading(false);
    };

    const disabled = ['loading'].includes(status);

    return (
        <Modal open onClose={lukkModal} aria-labelledby="modal-heading">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading">
                    <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.tittel" />
                </Heading>
            </Modal.Header>

            <Modal.Body>
                <>
                    <div>
                        <FormattedMessage
                            id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.info"
                            values={{ fagsakId: fagsakId, pleietrengendeId: pleietrengendeId }}
                        />
                    </div>

                    <JournalPostKopiFelmeldinger fellesState={fellesState} />

                    {isSuccess && (
                        <div>
                            <Alert size="small" variant="success">
                                <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.success" />
                            </Alert>
                        </div>
                    )}

                    {!!error && (
                        <div>
                            <Alert size="small" variant="warning">
                                <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.error" />
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
                        <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.kopier.tilbaketilLOS.btn" />
                    </Button>
                ) : (
                    <>
                        <Button type="button" disabled={kopierLoading} onClick={handleKopier} size="small">
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.kopier.btn" />
                        </Button>

                        <Button
                            type="button"
                            onClick={lukkModal}
                            disabled={kopierLoading}
                            size="small"
                            variant="secondary"
                        >
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.kopier.avbryt.btn" />
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default KopierModal;
