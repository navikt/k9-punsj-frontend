import React from 'react';
import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { RootStateType } from 'app/state/RootState';
import { klassifiserDokument } from 'app/api/api';
import VerticalSpacer from 'app/components/VerticalSpacer';
import FagsakVisning from './FagsakVisning';

interface OwnProps {
    lukkModal: () => void;
}

export default function KlassifiserModal({ lukkModal }: OwnProps) {
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpostId = useSelector((state: RootStateType) => state.felles.journalpost?.journalpostId as string);

    if (!fagsak) {
        throw Error('Mangler fagsak');
    }

    const { mutate, status } = useMutation({
        mutationFn: () =>
            klassifiserDokument({
                brukerIdent: identState.ident1,
                pleietrengendeIdent: identState.ident2,
                annenPart: identState.annenPart,
                journalpostId,
                fagsakYtelseTypeKode: fagsak?.sakstype,
                periode: fagsak?.gyldigPeriode,
                saksnummer: fagsak?.fagsakId,
            }),
    });

    return (
        <Modal open aria-label="Modal demo" onClose={lukkModal} aria-labelledby="modal-heading">
            <Modal.Content>
                <Heading spacing level="1" size="small" id="modal-heading">
                    Lagre sakstype på journalpost
                </Heading>
                <VerticalSpacer thirtyTwoPx />
                <BodyShort size="small">
                    {`Er du sikker på at du vil knytte journalpost ${journalpostId} til fagsak ${fagsak.fagsakId}?`}
                </BodyShort>
                <VerticalSpacer twentyPx />
                <FagsakVisning fagsak={fagsak} />
                <VerticalSpacer fourtyPx />
                <div>
                    <Button
                        disabled={['loading', 'success'].includes(status)}
                        onClick={() => mutate}
                        size="small"
                        style={{ marginRight: '1rem' }}
                    >
                        Lagre til LOS
                    </Button>
                    <Button onClick={lukkModal} size="small" variant="secondary">
                        Avbryt
                    </Button>
                </div>
            </Modal.Content>
        </Modal>
    );
}
