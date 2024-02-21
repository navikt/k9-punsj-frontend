import React, { useEffect } from 'react';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';

import { Alert, AlertProps, Button, Heading, Loader, Modal } from '@navikt/ds-react';

import { klassifiserDokument } from 'app/api/api';

import { FordelingDokumenttype } from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import { finnForkortelseForDokumenttype, getEnvironmentVariable } from 'app/utils';

import { FormattedMessage } from 'react-intl';
import { ROUTES } from 'app/constants/routes';

import { useNavigate } from 'react-router';
import KlassifiseringInfo from './KlassifiseringInfo';

interface OwnProps {
    lukkModal: () => void;
    fortsett?: boolean;
}

export const getJounalførOgFortsettPath = (dokumenttype?: FordelingDokumenttype) => {
    switch (dokumenttype) {
        case FordelingDokumenttype.OMSORGSPENGER_KS:
            return ROUTES.OMPKS_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        case FordelingDokumenttype.PLEIEPENGER:
            return ROUTES.PSB_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        case FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
            return ROUTES.PLS_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        case FordelingDokumenttype.OMSORGSPENGER_MA:
            return ROUTES.OMPMA_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        case FordelingDokumenttype.OMSORGSPENGER_UT:
            return ROUTES.OMPUT_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        case FordelingDokumenttype.OMSORGSPENGER_AO:
            return ROUTES.OMPAO_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        case FordelingDokumenttype.OPPLAERINGSPENGER:
            return ROUTES.OLP_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        case FordelingDokumenttype.KORRIGERING_IM:
            return ROUTES.KORRIGERING_ROOT + ROUTES.JOURNALFØR_OG_FORTSETT;
        default:
            return '/'; // TODO: Hva skal vi gjøre her?
    }
};

const KlassifiserModal = ({ lukkModal, fortsett }: OwnProps) => {
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpostId = useSelector((state: RootStateType) => state.felles.journalpost?.journalpostId as string);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype,
    );
    const navigate = useNavigate();

    // TODO Kanskje få tilbake reservert saksnummer og sette i fordeling state
    // TODO ogKanskje oppdatere journalpost med erFerdistilt = true eller hele jp objektet
    const { mutate, status, error, isSuccess } = useMutation({
        mutationFn: () =>
            klassifiserDokument({
                brukerIdent: identState.søkerId,
                barnIdent: identState.pleietrengendeId,
                journalpostId,
                fagsakYtelseTypeKode: fagsak?.k9FagsakYtelseType || finnForkortelseForDokumenttype(dokumenttype),
                periode: fagsak?.gyldigPeriode,
                saksnummer: fagsak?.fagsakId,
            }),
    });

    useEffect(() => {
        if (isSuccess && fortsett) {
            navigate(getJounalførOgFortsettPath(dokumenttype));
        }
    }, [isSuccess]);

    const disabled = ['loading', 'success'].includes(status);

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
                    <FormattedMessage id="fordeling.klassifiserModal.tittel" />
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <>
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
                    {/* Vise feilen fra serveren */}
                    {renderAlert('error', 'fordeling.klassifiserModal.alert.error', !!error, (error as Error)?.message)}
                </>
            </Modal.Body>
            <Modal.Footer>
                {!fortsett && isSuccess ? (
                    <Button
                        size="small"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        <FormattedMessage id="fordeling.klassifiserModal.btn.gåTilLos" />
                    </Button>
                ) : (
                    <>
                        <Button type="button" disabled={disabled} onClick={() => mutate()} size="small">
                            {status !== 'loading' ? (
                                <FormattedMessage id="fordeling.klassifiserModal.btn.JournalførJournalposten" />
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
