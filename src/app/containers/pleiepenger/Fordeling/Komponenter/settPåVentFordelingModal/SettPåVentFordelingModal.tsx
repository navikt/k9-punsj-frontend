import React from 'react';
import { useMutation } from 'react-query';
import { Alert, AlertProps, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { settJournalpostPaaVentUtenSøknadId } from 'app/api/api';

import { getEnvironmentVariable, initializeDate } from 'app/utils';

interface Props {
    journalpostId: string;
    lukkModal: () => void;
}

const SettPåVentFordelingModal = ({ journalpostId, lukkModal }: Props) => {
    const { mutate, status, error, isSuccess } = useMutation({
        mutationFn: () => settJournalpostPaaVentUtenSøknadId(journalpostId),
    });

    const disabled = ['loading', 'success'].includes(status);

    const get3WeeksDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

    const renderAlert = (variant: AlertProps['variant'], messageId: string, condition?: boolean, message?: string) => {
        if (!condition) return null;
        return (
            <Alert variant={variant} size="small">
                {!!message && message}
                {!message && <FormattedMessage id={messageId} />}
            </Alert>
        );
    };

    return (
        <Modal open onBeforeClose={lukkModal} aria-labelledby="modal-heading">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading">
                    <FormattedMessage id="fordeling.settJpPåVent.modal.tittel" />
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <div className="max-w-md min-w-96">
                    <FormattedMessage id="fordeling.settJpPåVent.modal.info" values={{ dato: get3WeeksDate() }} />

                    {renderAlert('success', 'fordeling.settJpPåVent.modal.btn.success', isSuccess)}

                    {/* Vise feilen fra serveren */}
                    {renderAlert('error', 'fordeling.settJpPåVent.modal.btn.error', !!error, (error as Error)?.message)}
                </div>
            </Modal.Body>
            <Modal.Footer>
                {isSuccess ? (
                    <Button
                        size="small"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        <FormattedMessage id="fordeling.settJpPåVent.modal.btn.gåTilLos" />
                    </Button>
                ) : (
                    <>
                        <Button type="button" disabled={disabled} onClick={() => mutate()} size="small">
                            {status !== 'loading' ? (
                                <FormattedMessage id="fordeling.settJpPåVent.modal.btn.settPåVent" />
                            ) : (
                                <span>
                                    <Loader size="xsmall" title="Lagrer..." />
                                </span>
                            )}
                        </Button>
                        <Button type="button" onClick={lukkModal} disabled={disabled} size="small" variant="secondary">
                            <FormattedMessage id="fordeling.settJpPåVent.modal.btn.avbryt" />
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default SettPåVentFordelingModal;
