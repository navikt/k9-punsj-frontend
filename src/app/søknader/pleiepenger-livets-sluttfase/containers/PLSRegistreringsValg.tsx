import React from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { Alert, Button } from '@navikt/ds-react';
import { DokumenttypeForkortelse } from 'app/models/enums/FordelingDokumenttype';
import { RootStateType } from '../../../state/RootState';
import { useRegistreringsValg } from '../../../hooks/registreringsvalg/useRegistreringsValg';
import { EksisterendePLSSoknader } from './EksisterendePLSSoknader';

export interface Props {
    journalpostid: string;
}

export const PLSRegistreringsValg: React.FC<Props> = ({ journalpostid }: Props) => {
    const { søkerId, pleietrengendeId } = useSelector((state: RootStateType) => state.identState);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const k9saksnummer = fordelingState.fagsak?.fagsakId;

    const {
        isEksisterendeSoknaderLoading,
        isCreatingSoknad,
        createSoknadError,
        createSoknad,
        kanStarteNyRegistrering,
        handleTilbake,
    } = useRegistreringsValg(DokumenttypeForkortelse.PPN, {
        journalpostid,
        søkerId,
        pleietrengendeId,
        k9saksnummer,
    });

    if (createSoknadError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.createSoknadRequestError" />
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <EksisterendePLSSoknader
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
                kanStarteNyRegistrering={kanStarteNyRegistrering()}
            />
            <div className="flex gap-4 mt-4">
                <Button
                    variant="secondary"
                    onClick={handleTilbake}
                    size="small"
                    disabled={isEksisterendeSoknaderLoading}
                >
                    <FormattedMessage id="eksisterendeSoknader.btn.tilbake" />
                </Button>

                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={createSoknad}
                        size="small"
                        disabled={isEksisterendeSoknaderLoading || isCreatingSoknad}
                    >
                        <FormattedMessage id="eksisterendeSoknader.btn.startNyRegistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
