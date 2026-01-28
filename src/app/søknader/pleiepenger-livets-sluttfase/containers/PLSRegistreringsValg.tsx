import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IdentRules } from 'app/validation';
import { findEksisterendeSoknader } from 'app/state/actions';
import { IIdentState } from '../../../models/types/IdentState';
import { RootStateType } from '../../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../../state/actions/JournalposterPerIdentActions';
import { createPLSSoknad, resetPLSSoknadidAction } from '../state/actions/EksisterendePLSSoknaderActions';
import { IEksisterendePLSSoknaderState } from '../types/EksisterendePLSSoknaderState';
import { EksisterendePLSSoknader } from './EksisterendePLSSoknader';

import './plsRegistreringsValg.less';

export interface IPLSRegistreringsValgComponentProps {
    journalpostid: string;
}

export interface IPLSRegistreringsValgDispatchProps {
    createSoknad: typeof createPLSSoknad;
    resetSoknadidAction: typeof resetPLSSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
    getEksisterendeSoknader: typeof findEksisterendeSoknader;
}

export interface IEksisterendeSoknaderStateProps {
    eksisterendeSoknaderState: IEksisterendePLSSoknaderState;
    identState: IIdentState;
}

type IPLSRegistreringsValgProps = IPLSRegistreringsValgComponentProps &
    IEksisterendeSoknaderStateProps &
    IPLSRegistreringsValgDispatchProps;

export const PLSRegistreringsValgComponent: React.FunctionComponent<IPLSRegistreringsValgProps> = (
    props: IPLSRegistreringsValgProps,
) => {
    const navigate = useNavigate();
    const location = useLocation();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const k9saksnummer = fordelingState.fagsak?.fagsakId;

    const {
        journalpostid,
        identState,
        eksisterendeSoknaderState,
        createSoknad,
        resetSoknadidAction,
        getAlleJournalposter,
        getEksisterendeSoknader,
    } = props;
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
        if (!søkerId) {
            navigate(location.pathname.replace('soknader/', ''));
        }
    }, [location.pathname, navigate, søkerId]);

    useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            getEksisterendeSoknader(søkerId, null);
        }

        getAlleJournalposter(søkerId);
    }, [søkerId, pleietrengendeId, getEksisterendeSoknader, getAlleJournalposter]);

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        if (søknader?.length === 0) {
            createSoknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer);
        }
    }, [createSoknad, journalpostid, søkerId, pleietrengendeId, søknader?.length]);

    useEffect(() => {
        if (eksisterendeSoknaderSvar && isSoknadCreated && soknadid) {
            resetSoknadidAction();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknadid)}`);
        }
    }, [eksisterendeSoknaderSvar, isSoknadCreated, navigate, resetSoknadidAction, soknadid]);

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
                    Tilbake
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={() => createSoknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer)}
                        className="knapp knapp2"
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
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null, k9saksnummer?: string) =>
        dispatch(createPLSSoknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer)),
    resetSoknadidAction: () => dispatch(resetPLSSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
    getEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeSoknader(søkerId, pleietrengendeId)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendePLSSoknaderState,
    identState: state.identState,
});

export const PLSRegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(PLSRegistreringsValgComponent);
