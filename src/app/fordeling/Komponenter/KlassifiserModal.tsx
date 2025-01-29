import React, { useEffect, useState } from 'react';

import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { Alert, AlertProps, Button, Checkbox, Heading, Loader, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import {
    getJournalpostEtterKopiering,
    klassifiserDokument,
    kopierJournalpostNotRedux,
    postBehandlingsAar,
    settJournalpostPaaVentUtenSøknadId,
} from 'app/api/api';
import Fagsak from 'app/types/Fagsak';
import {
    dokumenttyperMedBehandlingsår,
    dokumenttyperMedBehandlingsårValg,
    dokumenttyperMedPleietrengende,
    dokumentyperMedFosterbarn,
    FordelingDokumenttype,
} from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import {
    finnForkortelseForDokumenttype,
    getEnvironmentVariable,
    getForkortelseFraFordelingDokumenttype,
    getPathFraDokumenttype,
    initializeDate,
} from 'app/utils';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IJournalpost } from 'app/models/types/Journalpost/Journalpost';
import KlassifiseringInfo from './KlassifiseringInfo';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';

interface Props {
    dedupkey: string;
    toSøkere: boolean;
    fortsett?: boolean;
    behandlingsAar?: string;

    lukkModal: () => void;
    setFagsak: (sak: Fagsak) => void;
}

const KlassifiserModal = ({ dedupkey, toSøkere, fortsett, behandlingsAar, lukkModal, setFagsak }: Props) => {
    const navigate = useNavigate();

    const [visBrev, setVisBrev] = useState(false);

    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost as IJournalpost);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype,
    );

    const ytelseForKopiering = getForkortelseFraFordelingDokumenttype(dokumenttype);

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const isDokumenttypeMedBehandlingsår = dokumenttyperMedBehandlingsår.includes(dokumenttype);
    const isDokumenttypeMedBehandlingsårValg = dokumenttyperMedBehandlingsårValg.includes(dokumenttype);
    const isDokumenttypeMedFosterbarn = dokumentyperMedFosterbarn.includes(dokumenttype);
    const isDokumenttypeMedPleietrengende = dokumenttyperMedPleietrengende.includes(dokumenttype);

    const kopiere = toSøkere && !!journalpost?.kanKopieres && !erInntektsmeldingUtenKrav;

    const settPåVent = useMutation({
        mutationFn: () => settJournalpostPaaVentUtenSøknadId(journalpost.journalpostId),
    });

    //TODO: Vise ny jp som er kopiert

    const getJournalpost = useMutation({
        mutationFn: () => getJournalpostEtterKopiering(journalpost.journalpostId),
        // mutationFn: () => getJournalpostEtterKopiering('206'), // For testing 403 svar
    });

    const kopierJournalpost = useMutation({
        mutationFn: () =>
            kopierJournalpostNotRedux(
                dedupkey,
                identState.annenSokerIdent!,
                journalpost.journalpostId,
                ytelseForKopiering,
                isDokumenttypeMedPleietrengende ? identState.pleietrengendeId : undefined,
                isDokumenttypeMedBehandlingsårValg ? Number(behandlingsAar) : undefined,
                dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA ? identState.annenPart : undefined,
            ),
        onSuccess: () => {
            if (fortsett) {
                getJournalpost.mutate();
            }
        },
    });

    const journalførJournalpost = useMutation({
        mutationFn: () =>
            klassifiserDokument({
                brukerIdent: identState.søkerId,
                pleietrengendeIdent: identState.pleietrengendeId,
                relatertPersonIdent: identState.annenPart,
                journalpostId: journalpost.journalpostId,
                fagsakYtelseTypeKode: fagsak?.sakstype || finnForkortelseForDokumenttype(dokumenttype),
                periode: fagsak?.gyldigPeriode,
                saksnummer: fagsak?.fagsakId,
                barnAktørIder: isDokumenttypeMedFosterbarn ? identState.fosterbarn : undefined,
            }),
        onSuccess: () => {
            if (kopiere) {
                kopierJournalpost.mutate();
            }

            if (!fortsett) {
                settPåVent.mutate();
            }

            if (fortsett && !kopiere) {
                getJournalpost.mutate();
            }
        },
    });

    const settBehandlingsÅr = useMutation({
        mutationFn: () => postBehandlingsAar(journalpost.journalpostId, identState.søkerId, behandlingsAar),
        onSuccess: () => journalførJournalpost.mutate(),
    });

    // Sette fagsak i fordeling state
    useEffect(() => {
        if (fortsett && journalførJournalpost.isSuccess) {
            const sakstype = finnForkortelseForDokumenttype(dokumenttype);
            const fagsakId = journalførJournalpost.data.saksnummer as string;

            if (!fagsak?.fagsakId && sakstype && fagsakId) {
                const reservertSak: Fagsak = {
                    fagsakId,
                    sakstype,
                    pleietrengendeIdent: identState.pleietrengendeId,
                    gyldigPeriode: { fom: '', tom: '' },
                    reservertSaksnummer: true,
                    behandlingsår: behandlingsAar,
                };
                setFagsak(reservertSak);
            }
        }
    }, [journalførJournalpost.isSuccess]);

    // Navigere videre
    useEffect(() => {
        if (fortsett && (!kopiere || kopierJournalpost.isError) && getJournalpost.isSuccess) {
            navigate(getPathFraDokumenttype(dokumenttype) || '/');
        }
    }, [getJournalpost.isSuccess]);

    const disabled =
        ['loading'].includes(settBehandlingsÅr.status) ||
        ['loading', 'success'].includes(journalførJournalpost.status) ||
        ['loading', 'success'].includes(settPåVent.status) ||
        ['loading', 'success'].includes(kopierJournalpost.status) ||
        ['loading', 'success'].includes(getJournalpost.status);

    const disabledButtonsLoading =
        ['loading'].includes(journalførJournalpost.status) ||
        ['loading'].includes(settPåVent.status) ||
        ['loading'].includes(kopierJournalpost.status) ||
        ['loading'].includes(getJournalpost.status);

    const renderAlert = (variant: AlertProps['variant'], messageId: string, condition?: boolean, message?: string) => {
        if (!condition) return null;
        const reservertFagsakId =
            journalførJournalpost.isSuccess && (journalførJournalpost.data.saksnummer as string)
                ? (journalførJournalpost.data.saksnummer as string)
                : undefined;
        const fagsakIdEtterKopier =
            getJournalpost.isSuccess && getJournalpost.data.sak?.fagsakId
                ? getJournalpost.data.sak?.fagsakId
                : undefined;
        const threeWeeksDate = initializeDate().add(21, 'days').format('DD.MM.YYYY');
        const messageContent = message || (
            <FormattedMessage
                id={messageId}
                values={{
                    saksnummer: reservertFagsakId || fagsakIdEtterKopier || '',
                    dato: threeWeeksDate,
                    annenSøkerFnr: identState.annenSokerIdent,
                    pleietrengendeFnr: identState.pleietrengendeId,
                }}
            />
        );
        return (
            <Alert variant={variant} size="small">
                {messageContent}
            </Alert>
        );
    };

    const handleJournalfør = () => {
        if (isDokumenttypeMedBehandlingsår) {
            settBehandlingsÅr.mutate();
        } else journalførJournalpost.mutate();
    };

    const handleGåVidere = () => {
        if (!getJournalpost.isSuccess) {
            getJournalpost.mutate();
        } else {
            navigate(getPathFraDokumenttype(dokumenttype) || '/');
        }
    };

    const doNotShowWarnigAlert = journalførJournalpost.isSuccess || settPåVent.isSuccess || kopierJournalpost.isSuccess;

    const visGåTilLosBtn =
        !fortsett &&
        (settBehandlingsÅr.isSuccess || !isDokumenttypeMedBehandlingsår) &&
        journalførJournalpost.isSuccess &&
        settPåVent.isSuccess;

    const reservertFagsakIdForBrev = journalførJournalpost?.data?.saksnummer as string;

    return (
        <Modal open onClose={lukkModal} aria-labelledby="modal-heading" data-test-id="klassifiserModal">
            <Modal.Header closeButton={false}>
                <Heading level="1" size="small" id="modal-heading" data-test-id="klassifiserModalHeader">
                    <FormattedMessage id={`fordeling.klassifiserModal.tittel${fortsett ? '' : '.settPåVent'}`} />
                </Heading>
            </Modal.Header>

            <Modal.Body>
                <div className="max-w-xl">
                    <KlassifiseringInfo />

                    <div data-test-id="klassifiserModalAlertBlokk">
                        {renderAlert(
                            'success',
                            'fordeling.klassifiserModal.ikkeFortsett.alert.success',
                            !fortsett && journalførJournalpost.isSuccess && !!fagsak?.fagsakId,
                        )}

                        {renderAlert(
                            'success',
                            'fordeling.klassifiserModal.ikkeFortsett.alert.success.reservert',
                            !fortsett && journalførJournalpost.isSuccess && !fagsak?.fagsakId,
                        )}

                        {renderAlert(
                            'success',
                            'fordeling.klassifiserModal.alert.success',
                            fortsett && journalførJournalpost.isSuccess && !!fagsak?.fagsakId,
                        )}

                        {renderAlert(
                            'success',
                            'fordeling.klassifiserModal.alert.success.reservert',
                            fortsett && journalførJournalpost.isSuccess && !fagsak?.fagsakId,
                        )}

                        {renderAlert('warning', 'fordeling.klassifiserModal.alert.warning', !doNotShowWarnigAlert)}

                        {renderAlert('error', 'fordeling.error.settBehandlingsÅrMutation', !!settBehandlingsÅr.error)}

                        {/* Vise feilen fra serveren etter journalføring */}
                        {renderAlert(
                            'error',
                            'fordeling.klassifiserModal.alert.error',
                            !!journalførJournalpost.error,
                            (journalførJournalpost.error as Error)?.message,
                        )}

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
                            'success',
                            'fordeling.klassifiserModal.ikkeFortsett.alert.success',
                            !fortsett &&
                                getJournalpost.isSuccess &&
                                getJournalpost.data.erFerdigstilt &&
                                !getJournalpost.data.sak?.reservert,
                        )}

                        {renderAlert(
                            'success',
                            'fordeling.klassifiserModal.ikkeFortsett.alert.success.reservert',
                            !fortsett &&
                                getJournalpost.isSuccess &&
                                getJournalpost.data.erFerdigstilt &&
                                getJournalpost.data.sak?.reservert,
                        )}

                        {renderAlert(
                            'error',
                            'fordeling.klassifiserModal.kopierJournalpost.alert.error',
                            !!kopierJournalpost.error,
                            (kopierJournalpost.error as Error)?.message,
                        )}

                        {/* Vise feilen fra serveren etter sjekk tilgang til jp */}
                        {renderAlert(
                            'warning',
                            'fordeling.klassifiserModal.alert.getJournalpost.error',
                            !!getJournalpost.error,
                            (getJournalpost.error as Error)?.message,
                        )}

                        {settBehandlingsÅr.isLoading && (
                            <div className="mt-5">
                                <span>
                                    <FormattedMessage id="fordeling.klassifiserModal.settBehandlingsÅrLoading" />
                                    {'  '}
                                    <Loader size="xsmall" title="Lagrer..." />
                                </span>
                            </div>
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

                        {getJournalpost.isLoading && (
                            <div className="mt-5">
                                <span>
                                    <FormattedMessage id="fordeling.klassifiserModal.getJournalpostLoading" />
                                    <Loader size="xsmall" title="Sjekker journalposten for tilgangsrettigheter..." />
                                </span>
                            </div>
                        )}
                    </div>

                    {visGåTilLosBtn && reservertFagsakIdForBrev && (
                        <div className="mt-2">
                            <Checkbox
                                onChange={() => {
                                    setVisBrev(!visBrev);
                                }}
                                checked={visBrev}
                            >
                                <FormattedMessage id="fordeling.klassifiserModal.sendBrev.checkbox" />
                            </Checkbox>

                            {visBrev && (
                                <BrevComponent
                                    søkerId={identState.søkerId}
                                    sakstype={finnForkortelseForDokumenttype(dokumenttype) || ''}
                                    fagsakId={reservertFagsakIdForBrev}
                                    journalpostId={journalpost.journalpostId}
                                    brevSendtCallback={() => null}
                                    sendBrevUtenModal={true}
                                />
                            )}
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                {visGåTilLosBtn || getJournalpost.isError ? (
                    <Button
                        size="small"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                        disabled={disabledButtonsLoading}
                        data-test-id="klassifiserModalGåTilLos"
                    >
                        <FormattedMessage id="fordeling.klassifiserModal.btn.gåTilLos" />
                    </Button>
                ) : (
                    <>
                        {!journalførJournalpost.isSuccess && (
                            <>
                                <Button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleJournalfør()}
                                    size="small"
                                    data-test-id="klassifiserModalJournalfør"
                                >
                                    {!journalførJournalpost.isLoading ? (
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
                                <Button
                                    type="button"
                                    onClick={lukkModal}
                                    disabled={disabled}
                                    size="small"
                                    variant="secondary"
                                    data-test-id="klassifiserModalAvbryt"
                                >
                                    <FormattedMessage id="fordeling.klassifiserModal.btn.avbryt" />
                                </Button>
                            </>
                        )}

                        {journalførJournalpost.isSuccess && (
                            <>
                                <Button
                                    type="button"
                                    onClick={() => handleGåVidere()}
                                    size="small"
                                    disabled={getJournalpost.isLoading || kopierJournalpost.isLoading}
                                    data-test-id="klassifiserModalGåVidereEtterKopiering"
                                >
                                    <FormattedMessage id="fordeling.klassifiserModal.btn.gåVidere" />
                                </Button>
                                {kopierJournalpost.isError && (
                                    <Button
                                        type="button"
                                        onClick={() => kopierJournalpost.mutate()}
                                        disabled={kopierJournalpost.isSuccess || kopierJournalpost.isLoading}
                                        size="small"
                                        data-test-id="klassifiserModalKopierPåNyttBtn"
                                    >
                                        <FormattedMessage id="fordeling.klassifiserModal.btn.kopier" />
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                )}

                {settPåVent.isError && (
                    <Button
                        type="button"
                        onClick={() => settPåVent.mutate()}
                        size="small"
                        variant="secondary"
                        data-test-id="klassifiserModalPrøvIgjen"
                    >
                        <FormattedMessage id="fordeling.klassifiserModal.btn.settPåVent" />
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default KlassifiserModal;
