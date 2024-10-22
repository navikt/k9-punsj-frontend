import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { Alert, Button } from '@navikt/ds-react';
import { ROUTES } from 'app/constants/routes';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { createSoknad, findEksisterendeSoknader, resetSoknadidAction } from 'app/state/actions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from 'app/state/actions/JournalposterPerIdentActions';
import { EksisterendeSoknader } from '../EksisterendePSBSoknader';
import { Dispatch } from 'redux';

import './pSBRegistreringsValg.less';

interface Props {
    journalpostid: string;
}

export const PSBRegistreringsValg: React.FC<Props> = ({ journalpostid }: Props) => {
    const location = useLocation();

    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    const createNewSoknad = (
        journalpostId: string,
        søkerId: string,
        pleietrengendeId: string | null,
        k9saksnummer?: string,
    ) => dispatch(createSoknad(journalpostId, søkerId, pleietrengendeId, k9saksnummer));
    const resetSoknadId = () => dispatch(resetSoknadidAction());
    const getEksisterendeSoknader = (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeSoknader(søkerId, pleietrengendeId));
    const getAlleJournalposter = (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent));

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const eksisterendeSoknaderState = useSelector((state: RootStateType) => state.eksisterendeSoknaderState);
    const identState = useSelector((state: RootStateType) => state.identState);
    const k9saksnummer = fordelingState.fagsak?.fagsakId;

    const { søkerId, pleietrengendeId } = identState;
    const {
        eksisterendeSoknaderSvar,
        soknadid,
        isSoknadCreated,
        createSoknadRequestError,
        isEksisterendeSoknaderLoading,
    } = eksisterendeSoknaderState;
    const { søknader } = eksisterendeSoknaderSvar;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!fordelingState.dokumenttype) {
            navigate(location.pathname.replace('soknader/', ''));
        }
    }, []);

    useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            getEksisterendeSoknader(søkerId, null);
        }

        getAlleJournalposter(søkerId);
    }, []);

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        if (!isEksisterendeSoknaderLoading && søknader?.length === 0) {
            createNewSoknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer);
        }
    }, [isEksisterendeSoknaderLoading, søknader]);

    useEffect(() => {
        if (isSoknadCreated && soknadid) {
            resetSoknadId();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknadid)}`);
        }
    }, [isSoknadCreated, soknadid]);

    const kanStarteNyRegistrering = () => {
        if (søknader?.length) {
            return !eksisterendeSoknaderSvar.søknader?.some((es) =>
                Array.from(es.journalposter!).some((jp) => jp === journalpostid),
            );
        }
        return true;
    };

    if (createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="fordeling.registreringsValg.createSoknadRequestError" />
            </Alert>
        );
    }

    return (
        <div className="registrering-page">
            <EksisterendeSoknader
                pleietrengendeId={pleietrengendeId}
                fagsakId={k9saksnummer || ''}
                kanStarteNyRegistrering={kanStarteNyRegistrering()}
            />
            <div className="knapperad">
                <Button
                    variant="secondary"
                    className="knapp knapp1"
                    onClick={() => navigate(location.pathname.replace('soknader/', ''))}
                    size="small"
                    disabled={isEksisterendeSoknaderLoading}
                >
                    <FormattedMessage id="fordeling.registreringsValg.tilbake" />
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={() => createNewSoknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer)}
                        className="knapp2"
                        size="small"
                        disabled={isEksisterendeSoknaderLoading}
                    >
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
