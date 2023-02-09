import React from 'react';
import { Alert, BodyShort, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { RootStateType } from 'app/state/RootState';
import { klassifiserDokument } from 'app/api/api';
import VerticalSpacer from 'app/components/VerticalSpacer';
import KlassifiseringInfo from './KlassifiseringInfo';

interface OwnProps {
    lukkModal: () => void;
}

export default function KlassifiserModal({ lukkModal }: OwnProps) {
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpostId = useSelector((state: RootStateType) => state.felles.journalpost?.journalpostId as string);

    const { mutate, status, error, data } = useMutation({
        mutationFn: () =>
            klassifiserDokument({
                brukerIdent: identState.ident1,
                barnIdent: identState.ident2,
                annenPart: identState.annenPart,
                journalpostId,
                fagsakYtelseTypeKode: fagsak?.sakstype,
                periode: fagsak?.gyldigPeriode,
                saksnummer: fagsak?.fagsakId,
            }),
    });
    const disabled = ['loading', 'success'].includes(status);

    return (
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        <Modal open onClose={!disabled ? lukkModal : () => {}} aria-labelledby="modal-heading">
            <Modal.Content>
                <>
                    <Heading spacing level="1" size="small" id="modal-heading">
                        Lagre sakstype på journalpost
                    </Heading>
                    <VerticalSpacer thirtyTwoPx />
                    <BodyShort size="small">
                        {`Er du sikker på at du vil knytte følgende informasjon til journalpost ${journalpostId}?`}
                    </BodyShort>
                    <VerticalSpacer twentyPx />
                    <KlassifiseringInfo />
                    <VerticalSpacer twentyPx />

                    {data ? (
                        <Button>Gå til LOS</Button>
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
                    <VerticalSpacer sixteenPx />
                    {error && <Alert variant="error">Noe gikk galt under lagring</Alert>}
                    {data && <Alert variant="success">Sakstypen ble lagret til journalpost</Alert>}
                </>
            </Modal.Content>
        </Modal>
    );
}
