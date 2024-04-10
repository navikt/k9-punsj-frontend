import React, { useEffect } from 'react';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { Alert, AlertProps, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { klassifiserDokument, settJournalpostPaaVentUtenSøknadId } from 'app/api/api';
import Fagsak from 'app/types/Fagsak';
import { FordelingDokumenttype } from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import {
    finnForkortelseForDokumenttype,
    getEnvironmentVariable,
    getPathFraDokumenttype,
    initializeDate,
} from 'app/utils';
import KlassifiseringInfo from './KlassifiseringInfo';

interface OwnProps {
    lukkModal: () => void;
    setFagsak: (sak: Fagsak) => void;
    fortsett?: boolean;
}

const KlassifiserModal = ({ lukkModal, setFagsak, fortsett }: OwnProps) => {
    const navigate = useNavigate();

    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpostId = useSelector((state: RootStateType) => state.felles.journalpost?.journalpostId as string);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype,
    );

    const get3WeeksDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

    const { mutate, status, error, isSuccess, data } = useMutation({
        mutationFn: () =>
            klassifiserDokument({
                brukerIdent: identState.søkerId,
                pleietrengendeIdent: identState.pleietrengendeId,
                relatertPersonIdent: identState.annenPart,
                journalpostId,
                fagsakYtelseTypeKode: fagsak?.sakstype || finnForkortelseForDokumenttype(dokumenttype),
                periode: fagsak?.gyldigPeriode,
                saksnummer: fagsak?.fagsakId,
            }),
    });

    const settPåVentMutation = useMutation({
        mutationFn: () => settJournalpostPaaVentUtenSøknadId(journalpostId),
    });

    // Sette fagsak i fordeling state og navigere til journalfør og fortsett
    useEffect(() => {
        if (fortsett && isSuccess) {
            const sakstype = finnForkortelseForDokumenttype(dokumenttype);
            const fagsakId = data.saksnummer as string;

            if (!fagsak?.fagsakId && sakstype && fagsakId) {
                const reservertSak: Fagsak = {
                    fagsakId,
                    sakstype,
                    pleietrengendeIdent: identState.pleietrengendeId,
                    gyldigPeriode: { fom: '', tom: '' },
                    reservertSaksnummer: true,
                };
                setFagsak(reservertSak);
            }

            navigate(getPathFraDokumenttype(dokumenttype) || '/');
        }
        if (!fortsett && isSuccess) {
            settPåVentMutation.mutate();
        }
    }, [isSuccess]);

    const disabled =
        ['loading', 'success'].includes(status) && ['loading', 'success'].includes(settPåVentMutation.status);

    const disabledButtonsLoading = ['loading'].includes(status) && ['loading'].includes(settPåVentMutation.status);

    const renderAlert = (variant: AlertProps['variant'], messageId: string, condition?: boolean, message?: string) => {
        if (!condition) return null;
        const reservertFagsakId = isSuccess && (data.saksnummer as string) ? (data.saksnummer as string) : '';
        const threeWeeksDate = get3WeeksDate();
        const messageContent = message || (
            <FormattedMessage id={messageId} values={{ saksnummer: reservertFagsakId, dato: threeWeeksDate }} />
        );
        return (
            <Alert variant={variant} size="small">
                {messageContent}
            </Alert>
        );
    };

    return (
        <Modal open onClose={lukkModal} aria-labelledby="modal-heading">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading">
                    <FormattedMessage id={`fordeling.klassifiserModal.tittel${fortsett ? '' : '.settPåVent'}`} />
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <div className="max-w-xl">
                    <KlassifiseringInfo />

                    {renderAlert(
                        'success',
                        'fordeling.klassifiserModal.alert.success',
                        isSuccess && !!fagsak?.fagsakId,
                    )}
                    {renderAlert(
                        'success',
                        'fordeling.klassifiserModal.alert.success.reservert',
                        isSuccess && !fagsak?.fagsakId,
                    )}
                    {renderAlert('warning', 'fordeling.klassifiserModal.alert.warning', !isSuccess && !error)}
                    {/* Vise feilen fra serveren etter journalføring */}
                    {renderAlert('error', 'fordeling.klassifiserModal.alert.error', !!error, (error as Error)?.message)}
                    {/* Vise feilen fra serveren etter sett på vent */}
                    {renderAlert(
                        'error',
                        'fordeling.klassifiserModal.settPåVent.alert.error',
                        !!settPåVentMutation.error,
                        (settPåVentMutation.error as Error)?.message,
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                {!fortsett && isSuccess && settPåVentMutation.isSuccess ? (
                    <Button
                        size="small"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                        disabled={disabledButtonsLoading}
                    >
                        <FormattedMessage id="fordeling.klassifiserModal.btn.gåTilLos" />
                    </Button>
                ) : (
                    <>
                        <Button type="button" disabled={disabled} onClick={() => mutate()} size="small">
                            {status !== 'loading' ? (
                                <FormattedMessage
                                    id={`fordeling.klassifiserModal.btn.${fortsett ? 'JournalførJournalposten' : 'JournalførOgSettPåvent'}`}
                                />
                            ) : (
                                <span>
                                    <FormattedMessage id="fordeling.klassifiserModal.lagrer" />{' '}
                                    <Loader size="xsmall" title="Lagrer..." />
                                </span>
                            )}
                        </Button>
                        <Button type="button" onClick={lukkModal} disabled={disabled} size="small" variant="secondary">
                            <FormattedMessage id="fordeling.klassifiserModal.btn.avbryt" />
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default KlassifiserModal;
