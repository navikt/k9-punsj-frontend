import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IdentRules } from 'app/rules';
import { IEksisterendeSoknaderState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { createSoknad, findEksisterendeSoknader, resetSoknadidAction } from '../../state/actions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { EksisterendeSoknader } from './EksisterendeSoknader';
import './registreringsValg.less';

export interface IRegistreringsValgComponentProps {
    journalpostid: string;
}

export interface IRegistreringsValgDispatchProps {
    createNewSoknad: typeof createSoknad;
    resetSoknadId: typeof resetSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
    getEksisterendeSoknader: typeof findEksisterendeSoknader;
}

export interface IEksisterendeSoknaderStateProps {
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    identState: IIdentState;
}

type IRegistreringsValgProps = IRegistreringsValgComponentProps &
    IEksisterendeSoknaderStateProps &
    IRegistreringsValgDispatchProps;

export const RegistreringsValgComponent: React.FC<IRegistreringsValgProps> = (props: IRegistreringsValgProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const {
        journalpostid,
        identState,
        eksisterendeSoknaderState,
        getEksisterendeSoknader,
        getAlleJournalposter,
        createNewSoknad,
        resetSoknadId,
    } = props;
    const { søkerId, pleietrengendeId } = identState;
    const { eksisterendeSoknaderSvar, soknadid, isSoknadCreated, createSoknadRequestError } = eksisterendeSoknaderState;
    const { søknader } = eksisterendeSoknaderSvar;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!fordelingState.dokumenttype) {
            navigate(location.pathname.replace('soknader', ''));
        }
    }, [fordelingState.dokumenttype, location.pathname, navigate]);

    useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            getEksisterendeSoknader(søkerId, null);
        }

        getAlleJournalposter(søkerId);
    }, [søkerId, pleietrengendeId, getEksisterendeSoknader, getAlleJournalposter]);

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        if (søknader?.length === 0) {
            createNewSoknad(journalpostid, søkerId, pleietrengendeId);
        }
    }, [søknader, journalpostid, pleietrengendeId, søkerId, createNewSoknad]);

    useEffect(() => {
        if (isSoknadCreated && soknadid) {
            resetSoknadId();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknadid)}`);
        }
    }, [isSoknadCreated, soknadid, navigate, resetSoknadId]);

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
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    return (
        <div className="registrering-page">
            <EksisterendeSoknader pleietrengendeId={pleietrengendeId} />
            <div className="knapperad">
                <Button
                    variant="secondary"
                    className="knapp knapp1"
                    onClick={() => navigate(location.pathname.replace('soknader', ''))}
                    size="small"
                >
                    <FormattedMessage id="fordeling.registreringsValg.tilbake" />
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={() => createNewSoknad(journalpostid, søkerId, pleietrengendeId)}
                        className="knapp2"
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
    createNewSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createSoknad(journalpostid, søkerId, pleietrengendeId)),
    resetSoknadId: () => dispatch(resetSoknadidAction()),
    getEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeSoknader(søkerId, pleietrengendeId)),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    identState: state.identState,
});

export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
