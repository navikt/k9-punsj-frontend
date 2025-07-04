import React, { useEffect, useState } from 'react';

import { Alert, Button, Heading, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { Dispatch } from 'redux';

import { lukkJournalpostEtterKopiering } from 'app/api/api';
import JournalPostKopiFelmeldinger from './JournalPostKopiFelmeldinger';
import { kopierJournalpostRedux } from 'app/state/reducers/FellesReducer';
import { RootStateType } from 'app/state/RootState';
import { getEnvironmentVariable, getForkortelseFraFordelingDokumenttype } from 'app/utils';

interface Props {
    søkerId: string;
    pleietrengendeId: string;
    journalpostId: string;
    dedupkey: string;
    fagsakId: string;

    lukkModal: () => void;
}

const KopierLukkJpModal = ({ søkerId, pleietrengendeId, journalpostId, dedupkey, fagsakId, lukkModal }: Props) => {
    const [kopierLoading, setKopierLoading] = useState(false);

    const dispatch = useDispatch<Dispatch<any>>();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const fellesState = useSelector((state: RootStateType) => state.felles);

    const lukkJournalpost = useMutation({
        mutationFn: () => lukkJournalpostEtterKopiering(journalpostId, søkerId, fellesState.journalpost?.sak),
    });

    const ytelseForKopiering =
        fordelingState.dokumenttype && getForkortelseFraFordelingDokumenttype(fordelingState.dokumenttype);

    useEffect(() => {
        if (fellesState.kopierJournalpostSuccess) {
            lukkJournalpost.mutate();
        }
    }, [fellesState.kopierJournalpostSuccess]);

    const handleKopier = () => {
        setKopierLoading(true);

        dispatch(kopierJournalpostRedux(dedupkey, søkerId, journalpostId, ytelseForKopiering, pleietrengendeId));

        setKopierLoading(false);
    };

    const handleLukkJournalpost = () => {
        lukkJournalpost.mutate();
    };

    const disabled = lukkJournalpost.isPending;

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

                    {lukkJournalpost.isSuccess && (
                        <div>
                            <Alert size="small" variant="success" data-test-id="kopierModalLukkSuccess">
                                <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.success" />
                            </Alert>
                        </div>
                    )}

                    {lukkJournalpost.isError && (
                        <div>
                            <Alert size="small" variant="warning" data-test-id="kopierModalLukkError">
                                <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.error" />
                            </Alert>
                        </div>
                    )}
                </>
            </Modal.Body>

            <Modal.Footer>
                {fellesState.kopierJournalpostSuccess ? (
                    <>
                        <Button
                            size="small"
                            disabled={disabled}
                            onClick={() => {
                                window.location.href = getEnvironmentVariable('K9_LOS_URL');
                            }}
                            data-test-id="kopierTilbakeTilLosBtn"
                        >
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.kopier.tilbaketilLOS.btn" />
                        </Button>
                        {lukkJournalpost.isError && (
                            <Button
                                size="small"
                                disabled={disabled}
                                onClick={handleLukkJournalpost}
                                data-test-id="kopierLukkBtn"
                                variant="secondary"
                            >
                                <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.kopier.lukk.btn" />
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <Button
                            type="button"
                            disabled={kopierLoading}
                            onClick={handleKopier}
                            size="small"
                            data-test-id="kopierModalKopierBtn"
                        >
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.kopier.btn" />
                        </Button>

                        <Button
                            type="button"
                            onClick={lukkModal}
                            disabled={kopierLoading}
                            size="small"
                            variant="secondary"
                            data-test-id="kopierModalAvbrytBtn"
                        >
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kopierModal.kopier.avbryt.btn" />
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default KopierLukkJpModal;
