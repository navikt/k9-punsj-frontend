import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';
import { ROUTES } from 'app/constants/routes';
import { IdentRules } from 'app/rules';
import { findEksisterendeSoknader } from 'app/state/actions';
import { RootStateType } from '../../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../../state/actions/JournalposterPerIdentActions';
import { createPLSSoknad, resetPLSSoknadidAction } from '../state/actions/EksisterendePLSSoknaderActions';
import { EksisterendePLSSoknader } from './EksisterendePLSSoknader';

import './plsRegistreringsValg.less';

export interface Props {
    journalpostid: string;
}

export const PLSRegistreringsValg: React.FC<Props> = ({ journalpostid }: Props) => {
    const location = useLocation();

    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    const { søkerId, pleietrengendeId } = useSelector((state: RootStateType) => state.identState);
    const eksisterendeSoknaderState = useSelector((state: RootStateType) => state.eksisterendePLSSoknaderState);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const k9saksnummer = fordelingState.fagsak?.fagsakId;

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
        if (!søkerId) {
            navigate(location.pathname.replace('soknader/', ''));
        }
    }, [location.pathname, navigate, søkerId]);

    useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            dispatch(findEksisterendeSoknader(søkerId, null));
        }

        dispatch(hentAlleJournalposterPerIdentAction(søkerId));
    }, [søkerId, pleietrengendeId, dispatch]);

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        if (søknader?.length === 0) {
            dispatch(createPLSSoknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer));
        }
    }, [dispatch, journalpostid, søkerId, pleietrengendeId, søknader?.length]);

    useEffect(() => {
        if (eksisterendeSoknaderSvar && isSoknadCreated && soknadid) {
            dispatch(resetPLSSoknadidAction());
            navigate(`../${ROUTES.PUNCH.replace(':id', soknadid)}`);
        }
    }, [eksisterendeSoknaderSvar, isSoknadCreated, navigate, dispatch, soknadid]);

    const kanStarteNyRegistrering = () => {
        if (søknader?.length) {
            return !søknader?.some((es) => Array.from(es.journalposter!).some((jp) => jp === journalpostid));
        }
        return true;
    };

    if (createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="eksisterendeSoknader.createSoknadRequestError" />
            </Alert>
        );
    }

    return (
        <div className="registrering-page">
            <EksisterendePLSSoknader
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
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
                    <FormattedMessage id="eksisterendeSoknader.btn.tilbake" />
                </Button>

                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={() =>
                            dispatch(createPLSSoknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer))
                        }
                        className="knapp knapp2"
                        size="small"
                        disabled={isEksisterendeSoknaderLoading}
                    >
                        <FormattedMessage id="eksisterendeSoknader.btn.startNyRegistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
