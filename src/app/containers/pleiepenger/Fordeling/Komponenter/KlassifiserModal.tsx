import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { Alert, AlertProps, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import {
    getJournalpostEtterKopiering,
    klassifiserDokument,
    kopierJournalpostToSøkere,
    settJournalpostPaaVentUtenSøknadId,
} from 'app/api/api';
import Fagsak from 'app/types/Fagsak';
import { FordelingDokumenttype } from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import {
    finnForkortelseForDokumenttype,
    getEnvironmentVariable,
    getPathFraDokumenttype,
    initializeDate,
} from 'app/utils';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IJournalpost } from 'app/models/types/Journalpost/Journalpost';
import KlassifiseringInfo from './KlassifiseringInfo';

interface OwnProps {
    lukkModal: () => void;
    setFagsak: (sak: Fagsak) => void;
    dedupkey: string;
    fortsett?: boolean;
}

const KlassifiserModal = ({ lukkModal, setFagsak, dedupkey, fortsett }: OwnProps) => {
    const navigate = useNavigate();
    const [getJpAntallForsøk, setGetJpAntallForsøk] = useState(0);
    const [ventGetJournalpost, setVentGetJournalpost] = useState(false);
    const [jpIkkejournalførtFeil, setJpIkkeJournalførtFeil] = useState(false);

    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost as IJournalpost);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype,
    );

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const toSøkere =
        identState.søkerId &&
        identState.pleietrengendeId &&
        identState.annenSokerIdent &&
        journalpost?.journalpostId &&
        journalpost?.kanKopieres &&
        !erInntektsmeldingUtenKrav;

    const get3WeeksDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

    const { mutate, status, error, isSuccess, data } = useMutation({
        mutationFn: () =>
            klassifiserDokument({
                brukerIdent: identState.søkerId,
                pleietrengendeIdent: identState.pleietrengendeId,
                relatertPersonIdent: identState.annenPart,
                journalpostId: journalpost.journalpostId,
                fagsakYtelseTypeKode: fagsak?.sakstype || finnForkortelseForDokumenttype(dokumenttype),
                periode: fagsak?.gyldigPeriode,
                saksnummer: fagsak?.fagsakId,
            }),
    });

    const settPåVent = useMutation({
        mutationFn: () => settJournalpostPaaVentUtenSøknadId(journalpost.journalpostId),
    });

    // Forsøk hvis pleietrengende har ikke fødselsnummer ????
    const kopierJournalpost = useMutation({
        mutationFn: () =>
            kopierJournalpostToSøkere(
                identState.søkerId,
                identState.annenSokerIdent!,
                identState.pleietrengendeId,
                journalpost.journalpostId,
                dedupkey,
            ),
    });

    const getJournalpost = useMutation({
        mutationFn: () => getJournalpostEtterKopiering(journalpost.journalpostId),
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
            settPåVent.mutate();
        }
    }, [isSuccess]);

    // Vent 4 sek og get journalpost etter kopiering for å sjekke om den er ferdigstilt
    useEffect(() => {
        if (kopierJournalpost.isSuccess) {
            setGetJpAntallForsøk(getJpAntallForsøk + 1);
            setVentGetJournalpost(true);
            setTimeout(() => getJournalpost.mutate(), 4000);
        }
    }, [kopierJournalpost.isSuccess]);

    // Hvis getJournalpost isSuccess, sjekk om journalposten er ferdigstilt. Hvis journalposten er ferdigstilt reload siden for å gå videre
    // Hvis journalposten ikke er ferdigstilt, vent 1 sek og prøv igjen
    // Hvis journalposten ikke er ferdigstilt etter 3 forsøk, vis feilmelding
    useEffect(() => {
        if (getJournalpost.isSuccess) {
            const journalpostEtterKopiering = getJournalpost.data;
            if (journalpostEtterKopiering?.erFerdigstilt) {
                if (fortsett) {
                    setVentGetJournalpost(false);
                    window.location.reload();
                } else {
                    setVentGetJournalpost(false);
                    settPåVent.mutate();
                }
            } else if (getJpAntallForsøk < 3) {
                setTimeout(() => getJournalpost.mutate(), 1000);
            } else {
                setVentGetJournalpost(false);
                setJpIkkeJournalførtFeil(true);
            }
        }
    }, [getJournalpost.isSuccess]);

    const disabled =
        ['loading', 'success'].includes(status) ||
        ['loading', 'success'].includes(settPåVent.status) ||
        ['loading', 'success'].includes(kopierJournalpost.status) ||
        ['loading', 'success'].includes(getJournalpost.status) ||
        jpIkkejournalførtFeil ||
        ventGetJournalpost;

    const disabledButtonsLoading =
        ['loading'].includes(status) ||
        ['loading'].includes(settPåVent.status) ||
        ['loading'].includes(kopierJournalpost.status) ||
        ['loading'].includes(getJournalpost.status) ||
        jpIkkejournalførtFeil ||
        ventGetJournalpost;

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

    const handleJournalfør = () => {
        if (toSøkere) {
            kopierJournalpost.mutate();
        } else mutate();
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
                        !!settPåVent.error,
                        (settPåVent.error as Error)?.message,
                    )}
                    {renderAlert(
                        'success',
                        'fordeling.klassifiserModal.kopierJournalpost.alert.success',
                        kopierJournalpost.isSuccess,
                    )}
                    {renderAlert(
                        'error',
                        'fordeling.klassifiserModal.kopierJournalpost.alert.error',
                        !!kopierJournalpost.error,
                        (kopierJournalpost.error as Error)?.message,
                    )}
                    {renderAlert(
                        'error',
                        'fordeling.klassifiserModal.jpIkkejournalførtFeil.alert.error',
                        jpIkkejournalførtFeil,
                    )}
                    {kopierJournalpost.isLoading && (
                        <div className="mt-5">
                            <span>
                                <FormattedMessage id="fordeling.klassifiserModal.kopierLoading" />
                                {'  '}
                                <Loader size="xsmall" title="Lagrer..." />
                            </span>
                        </div>
                    )}
                    {(ventGetJournalpost || getJournalpost.isLoading) && (
                        <div className="mt-5">
                            <span>
                                <FormattedMessage id="fordeling.klassifiserModal.ventJpJournalføres" />
                                {'  '}
                                <Loader size="xsmall" title="Lagrer..." />
                            </span>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                {!fortsett && (isSuccess || getJournalpost.isSuccess) && settPåVent.isSuccess ? (
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
                        <Button type="button" disabled={disabled} onClick={() => handleJournalfør()} size="small">
                            {status !== 'loading' || ventGetJournalpost ? (
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
