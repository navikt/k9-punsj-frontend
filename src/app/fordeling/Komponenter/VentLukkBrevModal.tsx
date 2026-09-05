import React, { useEffect, useState } from 'react';

import { Alert, Button, ErrorMessage, Heading } from '@navikt/ds-react';
import { useMutation } from '@tanstack/react-query';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { lukkJournalpostEtterKopiering, settJournalpostPaaVentUtenSøknadId } from 'app/api/api';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import BrevContainer from 'app/components/brev/BrevContainer';
import { PunsjDialog } from 'app/components/PunsjDialog';
import { RootStateType } from 'app/state/RootState';
import { finnForkortelseForDokumenttype, initializeDate, redirectToLos } from 'app/utils';

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
    });

    const lukkJournalpost = useMutation({
        mutationFn: () => lukkJournalpostEtterKopiering(journalpostId, søkerId, fagsak),
    });

    useEffect(() => {
        if (settPåVent.isSuccess) {
            setSattPåVent(true);
        }
    }, [settPåVent.isSuccess]);

    useEffect(() => {
        if (lukkJournalpost.isSuccess) {
            setVisLukkOppgave(false);
            setJpLukket(true);
        }
    }, [lukkJournalpost.isSuccess]);

    const get3WeeksDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

    if (jpLukket) {
        return (
            <PunsjDialog
                open={open}
                onOpenChange={(isOpen) => !isOpen && onClose()}
                aria-labelledby="modal-heading"
                data-test-id="brevModal"
            >
                <PunsjDialog.Header withClosebutton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.tittel" />
                    </Heading>
                </PunsjDialog.Header>

                <PunsjDialog.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <Alert variant="success" size="small" data-test-id="brevModalInfoSattPåVent">
                            <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukket.info" />
                        </Alert>
                    </div>
                </PunsjDialog.Body>

                <PunsjDialog.Footer>
                    <Button
                        type="button"
                        onClick={() => {
                            redirectToLos();
                        }}
                        size="small"
                        data-test-id="brevModalGåTilLos"
                    >
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukket.gåTilLosBtn" />
                    </Button>
                </PunsjDialog.Footer>
            </PunsjDialog>
        );
    }

    if (visLukkOppgave) {
        return (
            <PunsjDialog
                open={open}
                onOpenChange={(isOpen) => !isOpen && onClose()}
                aria-labelledby="modal-heading"
                data-test-id="brevModal"
            >
                <PunsjDialog.Header withClosebutton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.lukk.tittel" />
                    </Heading>
                </PunsjDialog.Header>

                <PunsjDialog.Body>
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
                </PunsjDialog.Body>

                <PunsjDialog.Footer>
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
                </PunsjDialog.Footer>
            </PunsjDialog>
        );
    }

    if (sattPåVent) {
        return (
            <PunsjDialog
                open={open}
                onOpenChange={(isOpen) => !isOpen && onClose()}
                aria-labelledby="modal-heading"
                data-test-id="brevModal"
            >
                <PunsjDialog.Header withClosebutton={false}>
                    <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.sattPåVent.tittel" />
                    </Heading>
                </PunsjDialog.Header>

                <PunsjDialog.Body>
                    <div className="min-w-[500px] max-w-[500px]">
                        <Alert variant="success" size="small" data-test-id="brevModalInfoSattPåVent">
                            <FormattedMessage
                                id="fordeling.journalført.åpneVentLukkBrevModal.sattPåVent.info"
                                values={{ datoString: get3WeeksDate() }}
                            />
                        </Alert>
                    </div>
                </PunsjDialog.Body>

                <PunsjDialog.Footer>
                    <Button
                        type="button"
                        onClick={() => {
                            redirectToLos();
                        }}
                        size="small"
                        data-test-id="brevModalGåTilLos"
                    >
                        <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.sattPåVent.gåTilLosBtn" />
                    </Button>
                </PunsjDialog.Footer>
            </PunsjDialog>
        );
    }

    return (
        <PunsjDialog
            open={open}
            onOpenChange={(isOpen) => !isOpen && onClose()}
            aria-labelledby="modal-heading"
            data-test-id="brevModal"
        >
            <PunsjDialog.Header withClosebutton>
                <Heading level="1" size="small" id="modal-heading" data-test-id="brevModalHeader">
                    <FormattedMessage id="fordeling.journalført.åpneVentLukkBrevModal.tittel" />
                </Heading>
            </PunsjDialog.Header>

            <PunsjDialog.Body>
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
            </PunsjDialog.Body>

            <PunsjDialog.Footer>
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
            </PunsjDialog.Footer>
        </PunsjDialog>
    );
};

export default VentLukkBrevModal;
