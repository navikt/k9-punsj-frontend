import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';

import { findEksisterendeSoknader } from 'app/state/actions';
import { IdentRules } from 'app/rules';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { createOMPKSSoknad, resetOMPKSSoknadidAction } from '../state/actions/EksisterendeOMPKSSoknaderActions';
import { EksisterendeOMPKSSoknader } from './EksisterendeOMPKSSoknader';
import { IEksisterendeOMPKSSoknaderState } from '../types/EksisterendeOMPKSSoknaderState';

export interface IOMPKSRegistreringsValgComponentProps {
    journalpostid: string;
}

export interface IOMPKSRegistreringsValgDispatchProps {
    createSoknad: typeof createOMPKSSoknad;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
    resetSoknadidAction: typeof resetOMPKSSoknadidAction;
    getEksisterendeSoknader: typeof findEksisterendeSoknader;
}

export interface IEksisterendeOMPKSSoknaderStateProps {
    eksisterendeSoknaderState: IEksisterendeOMPKSSoknaderState;
    identState: IIdentState;
}

type IOMPKSRegistreringsValgProps = IOMPKSRegistreringsValgComponentProps &
    IOMPKSRegistreringsValgDispatchProps &
    IEksisterendeOMPKSSoknaderStateProps;

export const RegistreringsValgComponent: React.FC<IOMPKSRegistreringsValgProps> = (
    props: IOMPKSRegistreringsValgProps,
) => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        journalpostid,
        identState,
        eksisterendeSoknaderState,
        getEksisterendeSoknader,
        getAlleJournalposter,
        createSoknad,
        resetSoknadidAction,
    } = props;
    const { søkerId, pleietrengendeId } = identState;
    const { eksisterendeSoknaderSvar, soknadid, isSoknadCreated, createSoknadRequestError } = eksisterendeSoknaderState;
    const { søknader } = eksisterendeSoknaderSvar;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!søkerId) {
            navigate(location.pathname.replace('soknader', ''));
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
            createSoknad(journalpostid, søkerId, pleietrengendeId);
        }
    }, [createSoknad, journalpostid, pleietrengendeId, søkerId, søknader]);

    useEffect(() => {
        if (isSoknadCreated && soknadid) {
            resetSoknadidAction();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknadid)}`);
        }
    }, [isSoknadCreated, navigate, resetSoknadidAction, soknadid]);

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;
        if (soknader?.length) {
            return !soknader?.some((es) => Array.from(es.journalposter!).some((jp) => jp === journalpostid));
        }
        return true;
    };

    if (createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    return (
        <div className="registrering-page">
            <EksisterendeOMPKSSoknader søkerId={søkerId} pleietrengendeId={pleietrengendeId} />

            <div className="knapperad">
                <Button
                    variant="secondary"
                    className="knapp knapp1"
                    onClick={() => navigate(location.pathname.replace('soknader', ''))}
                    size="small"
                >
                    Tilbake
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={() => createSoknad(journalpostid, søkerId, pleietrengendeId)}
                        className="knapp knapp2"
                        size="small"
                    >
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createOMPKSSoknad(journalpostid, søkerId, pleietrengendeId)),
    resetSoknadidAction: () => dispatch(resetOMPKSSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
    getEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeSoknader(søkerId, pleietrengendeId)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPKSSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeOMPKSSoknaderState,
    identState: state.identState,
});

export const OMPKSRegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
