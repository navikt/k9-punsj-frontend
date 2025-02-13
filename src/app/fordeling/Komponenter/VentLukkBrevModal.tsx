import React, { useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { Alert, Button, ErrorMessage, Heading, Modal } from '@navikt/ds-react';

import { lukkJournalpostEtterKopiering, settJournalpostPaaVentUtenSøknadId } from 'app/api/api';
import { RootStateType } from 'app/state/RootState';
import { finnForkortelseForDokumenttype, getEnvironmentVariable, initializeDate } from 'app/utils';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import BrevContainer from 'app/components/brev/BrevContainer';

interface Props {
    open: boolean;
    onClose: () => void;
}

const VentLukkBrevModal: React.FC<Props> = ({ open, onClose }: Props) => {
    const [sattPåVent, setSattPåVent] = useState(false);
    const [visLukkOppgave, setVisLukkOppgave] = useState(false);
    const [jpLukket, setJpLukket] = useState(false);

    const søkerId = useSelector((state: RootStateType) => state.identState.søkerId);
    const fellesState = useSelector((state: RootStateType) => state.felles);
    const dokumenttype = useSelector((state: RootStateType) => state.fordelingState.dokumenttype);

    const sakstype = finnForkortelseForDokumenttype(dokumenttype)!;

    const journalpost = fellesState.journalpost!;
    const fagsak = journalpost?.sak;
    const fagsakId = fagsak?.fagsakId;
    const journalpostId = journalpost?.journalpostId;

    const settPåVent = useMutation({
        mutationFn: () => settJournalpostPaaVentUtenSøknadId(journalpostId),
        onSuccess: () => {
            setSattPåVent(true);
        },
    });

    const lukkJournalpost = useMutation({
        mutationFn: () => lukkJournalpostEtterKopiering(journalpostId, søkerId, fagsak),
        onSuccess: () => {
            setVisLukkOppgave(false);
            setJpLukket(true);
        },
    });

    const get3WeeksDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

    if (jpLukket) {
        return (
            <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
                <Modal.Header closeButton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.tittel" />
                    </Heading>
                </Modal.Header>

                <Modal.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <Alert variant="success" size="small" data-test-id="brevModalInfoSattPåVent">
                            <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukket.info" />
                        </Alert>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        type="button"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                        size="small"
                        data-test-id="brevModalGåTilLos"
                    >
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukket.gåTilLosBtn" />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    if (visLukkOppgave) {
        return (
            <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
                <Modal.Header closeButton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.tittel" />
                    </Heading>
                </Modal.Header>

                <Modal.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.info" />

                        {lukkJournalpost.isError && (
                            <div className="mt-4">
                                <ErrorMessage>
                                    <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.error" />
                                </ErrorMessage>
                            </div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        type="button"
                        onClick={() => lukkJournalpost.mutate()}
                        size="small"
                        data-test-id="brevModalSettPåvent"
                    >
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.bekreft.btn" />
                    </Button>

                    <Button
                        type="button"
                        onClick={() => setVisLukkOppgave(false)}
                        size="small"
                        variant="secondary"
                        data-test-id="brevModalAvbryt"
                    >
                        <FormattedMessage id="fordeling.journalført.brevModal.avbryt.btn" />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    if (sattPåVent) {
        return (
            <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
                <Modal.Header closeButton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.sattPåVent.tittel" />
                    </Heading>
                </Modal.Header>

                <Modal.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <Alert variant="success" size="small" data-test-id="brevModalInfoSattPåVent">
                            <FormattedMessage
                                id="fordeling.journalført.åpneVentLukkBrevModal.sattPåVent.info"
                                values={{ datoString: get3WeeksDate() }}
                            />
                        </Alert>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        type="button"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                        size="small"
                        data-test-id="brevModalGåTilLos"
                    >
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.sattPåVent.gåTilLosBtn" />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
            <Modal.Header closeButton={true}>
                <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                    <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.tittel" />
                </Heading>
            </Modal.Header>

            <Modal.Body>
                <div className="min-w-[500px] max-w-[500px]">
                    <Alert variant="info" size="small" data-test-id="brevModalInfo">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.alert" />
                    </Alert>

                    <BrevContainer>
                        <BrevComponent
                            søkerId={søkerId}
                            sakstype={sakstype}
                            fagsakId={fagsakId}
                            journalpostId={journalpostId}
                            sendBrevUtenModal={true}
                            brevFraModal={true}
                        />
                    </BrevContainer>

                    {settPåVent.isError && (
                        <div className="mt-4">
                            <ErrorMessage>
                                <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.settPåVentError" />
                            </ErrorMessage>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    type="button"
                    onClick={() => settPåVent.mutate()}
                    size="small"
                    data-test-id="brevModalSettPåvent"
                >
                    <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.settPåVent.btn" />
                </Button>

                <Button
                    type="button"
                    onClick={() => setVisLukkOppgave(true)}
                    size="small"
                    variant="secondary"
                    data-test-id="brevModalLukkOppgave"
                >
                    <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.btn" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default VentLukkBrevModal;
