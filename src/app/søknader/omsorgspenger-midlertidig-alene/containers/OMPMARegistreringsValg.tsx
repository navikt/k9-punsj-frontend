import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';

import { findEksisterendeSoknader } from 'app/state/actions';
import { IdentRules } from 'app/validation';
import { IIdentState } from '../../../models/types/IdentState';
import { RootStateType } from '../../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../../state/actions/JournalposterPerIdentActions';
import { createOMPMASoknad, resetOMPMASoknadidAction } from '../state/actions/EksisterendeOMPMASoknaderActions';
import { IEksisterendeOMPMASoknaderState } from '../types/EksisterendeOMPMASoknaderState';
import { EksisterendeOMPMASoknader } from './EksisterendeOMPMASoknader';

export interface IOMPMARegistreringsValgComponentProps {
    journalpostid: string;
}

export interface IOMPMARegistreringsValgDispatchProps {
    createSoknad: typeof createOMPMASoknad;
    resetSoknadidAction: typeof resetOMPMASoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
    getEksisterendeSoknader: typeof findEksisterendeSoknader;
}

export interface IEksisterendeOMPMASoknaderStateProps {
    eksisterendeSoknaderState: IEksisterendeOMPMASoknaderState;
    identState: IIdentState;
}

type IOMPMARegistreringsValgProps = IOMPMARegistreringsValgComponentProps &
    IOMPMARegistreringsValgDispatchProps &
    IEksisterendeOMPMASoknaderStateProps;

export const RegistreringsValgComponent: React.FC<IOMPMARegistreringsValgProps> = (
    props: IOMPMARegistreringsValgProps,
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

    const { søkerId, pleietrengendeId, annenPart } = identState;
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
            createSoknad(journalpostid, søkerId, annenPart, k9saksnummer);
        }
    }, [annenPart, createSoknad, eksisterendeSoknaderSvar, journalpostid, søkerId, søknader]);

    useEffect(() => {
        if (eksisterendeSoknaderSvar && isSoknadCreated && soknadid) {
            resetSoknadidAction();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknadid)}`);
        }
    }, [eksisterendeSoknaderSvar, isSoknadCreated, navigate, resetSoknadidAction, soknadid]);

    const kanStarteNyRegistrering = () => {
        if (søknader?.length) {
            return !eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader?.some((eksisterendeSoknad) =>
                Array.from(eksisterendeSoknad.journalposter!).some((jp) => jp === journalpostid),
            );
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
            <EksisterendeOMPMASoknader
                søkerId={søkerId}
                annenPart={annenPart}
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
                    Tilbake
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={() => createSoknad(journalpostid, søkerId, annenPart, k9saksnummer)}
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
    createSoknad: (journalpostid: string, søkerId: string, annenPart: string, k9saksnummer?: string) =>
        dispatch(createOMPMASoknad(journalpostid, søkerId, annenPart, k9saksnummer)),
    resetSoknadidAction: () => dispatch(resetOMPMASoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
    getEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeSoknader(søkerId, pleietrengendeId)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPMASoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeOMPMASoknaderState,
    identState: state.identState,
});

export const OMPMARegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
