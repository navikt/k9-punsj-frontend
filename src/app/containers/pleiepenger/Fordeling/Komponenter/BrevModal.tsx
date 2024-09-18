import React, { useState } from 'react';

import { Alert, Button, Checkbox, ErrorMessage, Heading, Modal } from '@navikt/ds-react';
import BrevComponent from 'app/components/brev/BrevComponent';
import { DokumenttypeForkortelse } from 'app/models/enums';
import { FormattedMessage } from 'react-intl';
import { settJournalpostPaaVentUtenSøknadId } from 'app/api/api';
import { useMutation } from 'react-query';
import { getEnvironmentVariable } from 'app/utils';
import { useDispatch, useSelector } from 'react-redux';
import { lukkJournalpostOppgave } from 'app/state/actions';
import { Dispatch } from 'redux';
import { RootStateType } from 'app/state/RootState';
import Fagsak from 'app/types/Fagsak';

interface Props {
    open: boolean;
    journalpostId: string;
    fagsakId: string;
    søkerId: string;
    sakstype: DokumenttypeForkortelse; //TODO sjekk type

    onClose: () => void;
}

const BrevModal: React.FC<Props> = ({ open, journalpostId, fagsakId, søkerId, sakstype, onClose }: Props) => {
    const [visBrev, setVisBrev] = useState(false);
    const [sattPåVent, setSattPåVent] = useState(false);
    const [visLukkOppgave, setVisLukkOppgave] = useState(false);
    // const [jpLukket, setJpLukket] = useState(false);

    const dispatch = useDispatch<Dispatch<any>>();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const lukkJournalpost = () => dispatch(lukkJournalpostOppgave(journalpostId, søkerId)); //TODO FAGSAKID

    const settPåVent = useMutation({
        mutationFn: () => settJournalpostPaaVentUtenSøknadId(journalpostId),
        onSuccess: () => {
            // Vent 4 sek og get journalpost etter kopiering for å sjekke om den er ferdigstilt
            setSattPåVent(true);
        },
    });

    if (fordelingState.lukkOppgaveDone) {
        return (
            <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
                <Modal.Header closeButton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.lukk.tittel" />
                    </Heading>
                </Modal.Header>
                <Modal.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <Alert variant="success" size="small" data-test-id="brevModalInfoSattPåVent">
                            <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.lukket.info" />
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
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.lukket.gåTilLosBtn" />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    // TODO: bli ferdige med denne
    if (visLukkOppgave && !fordelingState.lukkOppgaveDone) {
        return (
            <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
                <Modal.Header closeButton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.lukk.tittel" />
                    </Heading>
                </Modal.Header>
                <Modal.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.lukk.info" />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        type="button"
                        onClick={() => setVisLukkOppgave(false)}
                        size="small"
                        variant="secondary"
                        data-test-id="brevModalAvbryt"
                    >
                        <FormattedMessage id="fordeling.journalført.brevModal.avbryt.btn" />
                    </Button>
                    <Button
                        type="button"
                        onClick={() => lukkJournalpost()}
                        size="small"
                        data-test-id="brevModalSettPåvent"
                    >
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.lukk.btn" />
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
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.sattPåVent.tittel" />
                    </Heading>
                </Modal.Header>
                <Modal.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <Alert variant="success" size="small" data-test-id="brevModalInfoSattPåVent">
                            <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.sattPåVent.info" />
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
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.sattPåVent.gåTilLosBtn" />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-heading" data-test-id="brevModal">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                    <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.tittel" />
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <div className="min-w-[500px] max-w-[500px]">
                    <Alert variant="info" size="small" data-test-id="brevModalInfo">
                        <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.alert" />
                    </Alert>
                    <div className="mb-4 mt-4">
                        <Checkbox
                            onChange={() => {
                                setVisBrev(!visBrev);
                            }}
                            checked={visBrev}
                        >
                            <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.sendBrev.checkbox" />
                        </Checkbox>
                    </div>
                    {visBrev && (
                        <BrevComponent
                            søkerId={søkerId}
                            sakstype={sakstype}
                            fagsakId={fagsakId}
                            journalpostId={journalpostId}
                            brevSendtCallback={() => null}
                            sendBrevUtenModal={true}
                            brevFraModal={true}
                        />
                    )}
                    {settPåVent.isError && (
                        <div className="mt-4">
                            <ErrorMessage>
                                <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.settPåVentError" />
                            </ErrorMessage>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    type="button"
                    onClick={() => setVisLukkOppgave(true)}
                    size="small"
                    variant="secondary"
                    data-test-id="brevModalLukkOppgave"
                >
                    <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.lukk.btn" />
                </Button>
                <Button
                    type="button"
                    onClick={() => settPåVent.mutate()}
                    size="small"
                    data-test-id="brevModalSettPåvent"
                >
                    <FormattedMessage id="fordeling.journalført.åpenVentLukkBrevModal.settPåVent.btn" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BrevModal;
