import React from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { Alert, Button, Loader } from '@navikt/ds-react';
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
        søknader,
        journalposter,
        isEksisterendeSoknaderLoading,
        isJournalposterLoading,
        isCreatingSoknad,
        eksisterendeSoknaderError,
        journalposterError,
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

    if (eksisterendeSoknaderError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.requestError" />
            </Alert>
        );
    }

    if (journalposterError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.requestError" />
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            {isEksisterendeSoknaderLoading || isJournalposterLoading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="flex items-center gap-2">
                        <Loader />
                        <FormattedMessage id="eksisterendeSoknader.loading.henting" />
                    </div>
                </div>
            ) : isCreatingSoknad ? (
                <div className="flex justify-center items-center py-8">
                    <div className="flex items-center gap-2">
                        <Loader />
                        <FormattedMessage id="eksisterendeSoknader.loading.opprettelse" />
                    </div>
                </div>
            ) : (
                <>
                    <EksisterendePLSSoknader
                        søknader={søknader}
                        journalposter={journalposter}
                        søkerId={søkerId}
                        pleietrengendeId={pleietrengendeId}
                        kanStarteNyRegistrering={kanStarteNyRegistrering()}
                        fagsakId={k9saksnummer}
                    />

                    <div className="flex gap-4 mt-4">
                        <Button variant="secondary" onClick={handleTilbake} size="small">
                            <FormattedMessage id="eksisterendeSoknader.btn.tilbake" />
                        </Button>

                        {kanStarteNyRegistrering() && (
                            <Button onClick={createSoknad} size="small">
                                <FormattedMessage id="eksisterendeSoknader.btn.startNyRegistrering" />
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
