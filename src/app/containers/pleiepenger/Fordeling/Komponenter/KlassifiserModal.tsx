import React from 'react';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';

import { Alert, BodyShort, Button, Heading, Loader, Modal } from '@navikt/ds-react';

import { klassifiserDokument } from 'app/api/api';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { FordelingDokumenttype } from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import { finnForkortelseForDokumenttype, getEnvironmentVariable } from 'app/utils';

import KlassifiseringInfo from './KlassifiseringInfo';

interface OwnProps {
    lukkModal: () => void;
}

export default function KlassifiserModal({ lukkModal }: OwnProps) {
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpostId = useSelector((state: RootStateType) => state.felles.journalpost?.journalpostId as string);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype,
    );

    const { mutate, status, error, isSuccess } = useMutation({
        mutationFn: () =>
            klassifiserDokument({
                brukerIdent: identState.søkerId,
                barnIdent: identState.pleietrengendeId,
                annenPart: identState.annenPart ? identState.annenPart : undefined,
                journalpostId,
                fagsakYtelseTypeKode: fagsak?.sakstype || finnForkortelseForDokumenttype(dokumenttype),
                periode: fagsak?.gyldigPeriode,
                saksnummer: fagsak?.fagsakId,
            }),
    });
    const disabled = ['loading', 'success'].includes(status);

    return (
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        <Modal open onClose={lukkModal} aria-labelledby="modal-heading">
            <Modal.Header closeButton={!disabled}>
                <Heading level="1" size="small" id="modal-heading">
                    Lagre sakstype på journalpost
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <>
                    <BodyShort size="small">
                        {`Er du sikker på at du vil knytte følgende informasjon til journalpost ${journalpostId}?`}
                    </BodyShort>
                    <VerticalSpacer twentyPx />
                    <KlassifiseringInfo />
                    <VerticalSpacer twentyPx />
                    {isSuccess && (
                        <Alert variant="success" className="mb-2">
                            Journalposten er nå ferdigstilt og du kan fortsette til LOS.
                        </Alert>
                    )}

                    {isSuccess ? (
                        <Button
                            onClick={() => {
                                window.location.href = getEnvironmentVariable('K9_LOS_URL');
                            }}
                        >
                            Gå til LOS
                        </Button>
                    ) : (
                        <div>
                            <Button
                                disabled={disabled}
                                onClick={() => mutate()}
                                size="small"
                                style={{ marginRight: '1rem' }}
                            >
                                {status !== 'loading' ? (
                                    'Lagre til LOS'
                                ) : (
                                    <span>
                                        Lagrer... <Loader size="xsmall" title="Lagrer..." />
                                    </span>
                                )}
                            </Button>
                            <Button onClick={lukkModal} disabled={disabled} size="small" variant="secondary">
                                Avbryt
                            </Button>
                        </div>
                    )}

                    {error && (
                        <>
                            <VerticalSpacer sixteenPx />
                            <Alert variant="error">Noe gikk galt under lagring</Alert>
                        </>
                    )}
                </>
            </Modal.Body>
        </Modal>
    );
}
